using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Platform.Infrastructure.Persistence;

using Platform.Application.Abstractions;
using Platform.Application.Dtos;
using Platform.Application.Dtos.Auth;
using Platform.Application.Services;

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
    var canConnect = await db.Database.CanConnectAsync();
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

    // Refresh Token → HttpOnly Cookie
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
app.MapPost("/api/datasets", async (CreateDatasetRequest req, DatasetService svc) =>
{
    var created = await svc.CreateAsync(req);
    return Results.Created($"/api/datasets/{created.Id}", created);
})
.WithName("CreateDataset")
.WithOpenApi()
.RequireAuthorization();

app.MapGet("/api/datasets", async (DatasetService svc) =>
{
    var items = await svc.ListAsync();
    return Results.Ok(items);
})
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


app.Run();
