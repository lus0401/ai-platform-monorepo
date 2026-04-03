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
using Platform.Application.Dtos.Training;
using Platform.Application.Services;
using Platform.Application.UseCases.Dataset;
using Platform.Application.UseCases.Training;

using Platform.Infrastructure.BackgroundJobs;
using Platform.Infrastructure.Persistence.Repositories;
using Platform.Infrastructure.Security;
using Platform.Infrastructure.Storage;
using Platform.Infrastructure.WebSockets;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// DbContext 등록 (PostgreSQL)
// -----------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------
// DI 등록 — Repositories
// -----------------------------
builder.Services.AddScoped<IDatasetRepository, DatasetRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITrainingJobRepository, TrainingJobRepository>();
builder.Services.AddScoped<IModelArtifactRepository, ModelArtifactRepository>();

// DI 등록 — Services
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IStorageService, LocalStorageService>();
builder.Services.AddScoped<DatasetService>();
builder.Services.AddScoped<AuthService>();

// DI 등록 — Use Cases
builder.Services.AddScoped<StartTrainingJobUseCase>();
builder.Services.AddScoped<DeployModelUseCase>();
builder.Services.AddScoped<ValidateDatasetUseCase>();
builder.Services.AddScoped<MergeDatasetUseCase>();

// Job 추적 (Singleton: 프로세스 생존 기간 동안 상태 유지)
builder.Services.AddSingleton<IJobTracker, JobTracker>();

// WebSocket 연결 관리
builder.Services.AddSingleton<TrainingWebSocketManager>();

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

app.UseWebSockets();
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
    var canConnect   = await db.Database.CanConnectAsync();
    var userCount    = await db.Users.CountAsync();
    var datasetCount = await db.Datasets.CountAsync();
    var jobCount     = await db.TrainingJobs.CountAsync();

    return Results.Ok(new
    {
        ok = true,
        canConnect,
        counts = new { users = userCount, datasets = datasetCount, trainingJobs = jobCount }
    });
})
.WithName("DbCheck")
.WithOpenApi();


// ==============================
// Auth APIs
// ==============================
app.MapPost("/api/auth/login", async (LoginRequest req, AuthService svc, HttpContext ctx) =>
{
    var result = await svc.LoginAsync(req);
    if (result is null) return Results.Unauthorized();

    ctx.Response.Cookies.Append("refreshToken", result.AccessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure   = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires  = DateTimeOffset.UtcNow.AddDays(7),
    });
    return Results.Ok(result);
})
.WithName("Login").WithOpenApi().AllowAnonymous();

app.MapPost("/api/auth/refresh", async (HttpContext ctx, AuthService svc) =>
{
    var refreshToken = ctx.Request.Cookies["refreshToken"];
    if (string.IsNullOrEmpty(refreshToken)) return Results.Unauthorized();

    var result = await svc.RefreshAsync(refreshToken);
    if (result is null) return Results.Unauthorized();

    ctx.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure   = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires  = DateTimeOffset.UtcNow.AddDays(7),
    });
    return Results.Ok(result);
})
.WithName("Refresh").WithOpenApi().AllowAnonymous();

app.MapPost("/api/auth/logout", async (HttpContext ctx, AuthService svc) =>
{
    var refreshToken = ctx.Request.Cookies["refreshToken"];
    if (!string.IsNullOrEmpty(refreshToken))
        await svc.RevokeAsync(refreshToken);

    ctx.Response.Cookies.Delete("refreshToken");
    return Results.NoContent();
})
.WithName("Logout").WithOpenApi().RequireAuthorization();


// ==============================
// Dataset APIs
// ==============================
app.MapPost("/api/datasets", async (CreateDatasetRequest req, DatasetService svc, ClaimsPrincipal user) =>
{
    var userId  = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var created = await svc.CreateAsync(req, userId);
    return Results.Created($"/api/datasets/{created.Id}", created);
})
.WithName("CreateDataset").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets", async (DatasetService svc) =>
    Results.Ok(await svc.ListAsync()))
.WithName("ListDatasets").WithOpenApi().RequireAuthorization();

app.MapGet("/api/datasets/{id:guid}", async (Guid id, DatasetService svc) =>
{
    var item = await svc.GetAsync(id);
    return item is null ? Results.NotFound() : Results.Ok(item);
})
.WithName("GetDatasetById").WithOpenApi().RequireAuthorization();

app.MapDelete("/api/datasets/{id:guid}", async (Guid id, DatasetService svc) =>
{
    var deleted = await svc.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteDataset").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

// Dataset Validation
app.MapPost("/api/datasets/{id:guid}/validate",
    async (Guid id, ValidateDatasetUseCase useCase, DatasetValidationQueue queue) =>
    {
        try
        {
            var result = await useCase.ExecuteAsync(id,
                jobId => queue.EnqueueAsync(new ValidationWorkItem(jobId, id)).AsTask());
            return Results.Accepted($"/api/datasets/validate/{result.JobId}", new { result.JobId });
        }
        catch (InvalidOperationException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    })
.WithName("ValidateDataset").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets/validate/{jobId:guid}", (Guid jobId, IJobTracker tracker) =>
{
    var info = tracker.Get(jobId);
    if (info is null) return Results.NotFound();
    return Results.Ok(new JobStatusResponse(
        info.JobId, info.Type.ToString(), info.Status.ToString(),
        info.Progress, info.Error, info.ResultDatasetId,
        info.StartedAt, info.FinishedAt));
})
.WithName("GetValidationStatus").WithOpenApi().RequireAuthorization();

// Dataset Merge
app.MapPost("/api/datasets/merge",
    async (MergeDatasetRequest req, MergeDatasetUseCase useCase, DatasetMergeQueue queue, ClaimsPrincipal user) =>
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var result = await useCase.ExecuteAsync(req, userId,
                jobId => queue.EnqueueAsync(new MergeWorkItem(jobId, req.DatasetIds, req.NewName, req.Description, userId)).AsTask());
            return Results.Accepted($"/api/datasets/merge/{result.JobId}", new { result.JobId });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    })
.WithName("MergeDatasets").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/datasets/merge/{jobId:guid}", (Guid jobId, IJobTracker tracker) =>
{
    var info = tracker.Get(jobId);
    if (info is null) return Results.NotFound();
    return Results.Ok(new JobStatusResponse(
        info.JobId, info.Type.ToString(), info.Status.ToString(),
        info.Progress, info.Error, info.ResultDatasetId,
        info.StartedAt, info.FinishedAt));
})
.WithName("GetMergeStatus").WithOpenApi().RequireAuthorization();


// ==============================
// Training Job APIs
// ==============================
app.MapPost("/api/training/jobs",
    async (StartTrainingJobRequest req, StartTrainingJobUseCase useCase, ClaimsPrincipal user) =>
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var created = await useCase.ExecuteAsync(req, userId);
            return Results.Created($"/api/training/jobs/{created.Id}", created);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    })
.WithName("StartTrainingJob").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/training/jobs", async (ITrainingJobRepository repo) =>
{
    var jobs = await repo.ListAsync();
    return Results.Ok(jobs.Select(StartTrainingJobUseCase.ToDto));
})
.WithName("ListTrainingJobs").WithOpenApi().RequireAuthorization();

app.MapGet("/api/training/jobs/{id:guid}", async (Guid id, ITrainingJobRepository repo) =>
{
    var job = await repo.GetByIdAsync(id);
    return job is null ? Results.NotFound() : Results.Ok(StartTrainingJobUseCase.ToDto(job));
})
.WithName("GetTrainingJob").WithOpenApi().RequireAuthorization();


// ==============================
// Model Artifact APIs
// ==============================
app.MapPost("/api/training/jobs/{jobId:guid}/deploy",
    async (Guid jobId, DeployModelRequest req, DeployModelUseCase useCase) =>
    {
        // jobId는 URL에서, TrainingJobId는 body에서 — 일치 여부 검증
        if (req.TrainingJobId != jobId)
            return Results.BadRequest(new { error = "jobId mismatch." });

        try
        {
            var artifact = await useCase.ExecuteAsync(req);
            return Results.Created($"/api/models/{artifact.Id}", artifact);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    })
.WithName("DeployModel").WithOpenApi().RequireAuthorization(p => p.RequireRole("Admin"));

app.MapGet("/api/models", async (IModelArtifactRepository repo) =>
{
    var artifacts = await repo.ListAsync();
    return Results.Ok(artifacts.Select(DeployModelUseCase.ToDto));
})
.WithName("ListModels").WithOpenApi().RequireAuthorization();

app.MapGet("/api/models/{id:guid}", async (Guid id, IModelArtifactRepository repo) =>
{
    var artifact = await repo.GetByIdAsync(id);
    return artifact is null ? Results.NotFound() : Results.Ok(DeployModelUseCase.ToDto(artifact));
})
.WithName("GetModel").WithOpenApi().RequireAuthorization();


// ==============================
// WebSocket — 학습 진행률 스트리밍
// ==============================
app.Map("/ws/training/{jobId:guid}", async (Guid jobId, HttpContext ctx, TrainingWebSocketManager wsManager) =>
{
    if (!ctx.WebSockets.IsWebSocketRequest)
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        return;
    }

    var ws = await ctx.WebSockets.AcceptWebSocketAsync();
    wsManager.Add(jobId, ws);

    // 클라이언트가 연결을 끊을 때까지 대기
    var buffer = new byte[64];
    try
    {
        while (ws.State == System.Net.WebSockets.WebSocketState.Open)
        {
            var result = await ws.ReceiveAsync(buffer, ctx.RequestAborted);
            if (result.MessageType == System.Net.WebSockets.WebSocketMessageType.Close)
                break;
        }
    }
    catch (OperationCanceledException) { }
    finally
    {
        wsManager.Remove(jobId, ws);
        if (ws.State == System.Net.WebSockets.WebSocketState.Open)
            await ws.CloseAsync(
                System.Net.WebSockets.WebSocketCloseStatus.NormalClosure,
                "Closed", CancellationToken.None);
    }
});

// Python AI 서버 → .NET: 학습 진행률 수신 후 WebSocket으로 브라우저에 중계
app.MapPost("/api/internal/training/{jobId:guid}/progress",
    async (Guid jobId, TrainingProgressDto progress, TrainingWebSocketManager wsManager, ITrainingJobRepository repo) =>
    {
        var job = await repo.GetByIdAsync(jobId);
        if (job is null) return Results.NotFound();

        // DB 업데이트
        job.Progress     = progress.Progress;
        job.CurrentEpoch = progress.CurrentEpoch;
        job.Status       = progress.Status switch
        {
            "Succeeded" => Platform.Domain.Enums.JobStatus.Succeeded,
            "Failed"    => Platform.Domain.Enums.JobStatus.Failed,
            _           => Platform.Domain.Enums.JobStatus.Running,
        };
        if (job.Status == Platform.Domain.Enums.JobStatus.Running && job.StartedAtUtc is null)
            job.StartedAtUtc = DateTime.UtcNow;
        if (job.Status is Platform.Domain.Enums.JobStatus.Succeeded or Platform.Domain.Enums.JobStatus.Failed)
            job.FinishedAtUtc = DateTime.UtcNow;

        await repo.UpdateAsync(job);

        // WebSocket 브로드캐스트
        var message = System.Text.Json.JsonSerializer.Serialize(progress);
        await wsManager.BroadcastAsync(jobId, message);

        return Results.NoContent();
    })
.WithName("ReceiveTrainingProgress")
.WithOpenApi()
.AllowAnonymous(); // Python 서버는 내부망에서만 호출 (V2에서 API Key 인증 추가 예정)


app.Run();
