using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Platform.Infrastructure.Persistence;

using Platform.Application.Abstractions;
using Platform.Application.Dtos;
using Platform.Application.Dtos.Auth;
using Platform.Application.Dtos.Dataset;
using Platform.Application.Services;

using Platform.Infrastructure.BackgroundJobs;
using Platform.Infrastructure.Persistence.Repositories;
using Platform.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// DbContext 등록 (PostgreSQL)
// -----------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------
// DI 등록
// -----------------------------
builder.Services.AddScoped<IDatasetRepository, DatasetRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<DatasetService>();
builder.Services.AddScoped<AuthService>();

// Job 추적 (Singleton: 프로세스 생존 기간 동안 상태 유지)
builder.Services.AddSingleton<IJobTracker, JobTracker>();

// BackgroundService 큐 + 워커
builder.Services.AddSingleton<DatasetValidationQueue>();
builder.Services.AddSingleton<DatasetMergeQueue>();
builder.Services.AddHostedService<DatasetValidationWorker>();
builder.Services.AddHostedService<DatasetMergeWorker>();

// -----------------------------
// JWT 인증
// -----------------------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var secret = jwtSection["Secret"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidAudience            = jwtSection["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// -----------------------------
// Swagger
// -----------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = Microsoft.OpenApi.Models.ParameterLocation.Header,
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            []
        }
    });
});

var app = builder.Build();

// -----------------------------
// 미들웨어
// -----------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

// -----------------------------
// Health Check
// -----------------------------
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithName("Health")
   .WithOpenApi();

// -----------------------------
// DB 연결 검증
// -----------------------------
app.MapGet("/db-check", async (ApplicationDbContext db) =>
{
    var canConnect    = await db.Database.CanConnectAsync();
    var userCount     = await db.Users.CountAsync();
    var datasetCount  = await db.Datasets.CountAsync();
    var jobCount      = await db.TrainingJobs.CountAsync();

    return Results.Ok(new
    {
        ok = true,
        canConnect,
        counts = new { users = userCount, datasets = datasetCount, trainingJobs = jobCount }
    });
})
.WithName("DbCheck")
.WithOpenApi();


// -----------------------------
// Auth APIs
// -----------------------------
app.MapPost("/api/auth/login", async (LoginRequest req, AuthService svc, HttpContext ctx) =>
{
    var result = await svc.LoginAsync(req);
    if (result is null)
        return Results.Unauthorized();

    ctx.Response.Cookies.Append("refreshToken", result.AccessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure   = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires  = DateTimeOffset.UtcNow.AddDays(7),
    });

    return Results.Ok(result);
})
.WithName("Login")
.WithOpenApi()
.AllowAnonymous();

app.MapPost("/api/auth/refresh", async (HttpContext ctx, AuthService svc) =>
{
    var refreshToken = ctx.Request.Cookies["refreshToken"];
    if (string.IsNullOrEmpty(refreshToken))
        return Results.Unauthorized();

    var result = await svc.RefreshAsync(refreshToken);
    if (result is null)
        return Results.Unauthorized();

    ctx.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure   = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires  = DateTimeOffset.UtcNow.AddDays(7),
    });

    return Results.Ok(result);
})
.WithName("Refresh")
.WithOpenApi()
.AllowAnonymous();

app.MapPost("/api/auth/logout", async (HttpContext ctx, AuthService svc) =>
{
    var refreshToken = ctx.Request.Cookies["refreshToken"];
    if (!string.IsNullOrEmpty(refreshToken))
        await svc.RevokeAsync(refreshToken);

    ctx.Response.Cookies.Delete("refreshToken");
    return Results.NoContent();
})
.WithName("Logout")
.WithOpenApi()
.RequireAuthorization();


// -----------------------------
// Dataset APIs
// -----------------------------
app.MapPost("/api/datasets", async (CreateDatasetRequest req, DatasetService svc, ClaimsPrincipal user) =>
{
    var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var created = await svc.CreateAsync(req, userId);
    return Results.Created($"/api/datasets/{created.Id}", created);
})
.WithName("CreateDataset")
.WithOpenApi()
.RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets", async (DatasetService svc) =>
    Results.Ok(await svc.ListAsync()))
.WithName("ListDatasets")
.WithOpenApi()
.RequireAuthorization();

app.MapGet("/api/datasets/{id:guid}", async (Guid id, DatasetService svc) =>
{
    var item = await svc.GetAsync(id);
    return item is null ? Results.NotFound() : Results.Ok(item);
})
.WithName("GetDatasetById")
.WithOpenApi()
.RequireAuthorization();

app.MapDelete("/api/datasets/{id:guid}", async (Guid id, DatasetService svc) =>
{
    var deleted = await svc.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteDataset")
.WithOpenApi()
.RequireAuthorization(p => p.RequireRole("Admin"));


// -----------------------------
// Dataset Validation APIs
// -----------------------------
app.MapPost("/api/datasets/{id:guid}/validate",
    async (Guid id, DatasetService svc, DatasetValidationQueue queue, IJobTracker tracker) =>
    {
        var dataset = await svc.GetAsync(id);
        if (dataset is null)
            return Results.NotFound();

        var jobId = tracker.Start(DatasetJobType.Validation);
        await queue.EnqueueAsync(new ValidationWorkItem(jobId, id));

        return Results.Accepted($"/api/datasets/validate/{jobId}", new { jobId });
    })
.WithName("ValidateDataset")
.WithOpenApi()
.RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets/validate/{jobId:guid}", (Guid jobId, IJobTracker tracker) =>
{
    var info = tracker.Get(jobId);
    if (info is null) return Results.NotFound();

    return Results.Ok(new JobStatusResponse(
        info.JobId, info.Type.ToString(), info.Status.ToString(),
        info.Progress, info.Error, info.ResultDatasetId,
        info.StartedAt, info.FinishedAt));
})
.WithName("GetValidationStatus")
.WithOpenApi()
.RequireAuthorization();


// -----------------------------
// Dataset Merge APIs
// -----------------------------
app.MapPost("/api/datasets/merge",
    async (MergeDatasetRequest req, DatasetMergeQueue queue, IJobTracker tracker, ClaimsPrincipal user) =>
    {
        if (req.DatasetIds is null || req.DatasetIds.Count < 2)
            return Results.BadRequest("At least 2 dataset IDs are required.");

        if (string.IsNullOrWhiteSpace(req.NewName))
            return Results.BadRequest("NewName is required.");

        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var jobId  = tracker.Start(DatasetJobType.Merge);
        await queue.EnqueueAsync(new MergeWorkItem(jobId, req.DatasetIds, req.NewName, req.Description, userId));

        return Results.Accepted($"/api/datasets/merge/{jobId}", new { jobId });
    })
.WithName("MergeDatasets")
.WithOpenApi()
.RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets/merge/{jobId:guid}", (Guid jobId, IJobTracker tracker) =>
{
    var info = tracker.Get(jobId);
    if (info is null) return Results.NotFound();

    return Results.Ok(new JobStatusResponse(
        info.JobId, info.Type.ToString(), info.Status.ToString(),
        info.Progress, info.Error, info.ResultDatasetId,
        info.StartedAt, info.FinishedAt));
})
.WithName("GetMergeStatus")
.WithOpenApi()
.RequireAuthorization();


app.Run();
