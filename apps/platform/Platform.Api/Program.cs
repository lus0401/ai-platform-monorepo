using Microsoft.EntityFrameworkCore;
using Platform.Infrastructure.Persistence;

using Platform.Application.Abstractions;
using Platform.Application.Dtos;
using Platform.Application.Services;

using Platform.Infrastructure.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// DbContext 등록 (PostgreSQL)
// -----------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------
// DI 등록 (PostgreSQL)
// -----------------------------
builder.Services.AddScoped<IDatasetRepository, DatasetRepository>();
builder.Services.AddScoped<DatasetService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -----------------------------
// 개발 환경 설정
// -----------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -----------------------------
// 기본 Health Check
// -----------------------------
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithName("Health")
   .WithOpenApi();

// -----------------------------
// DB 연결 검증용 API
// -----------------------------
app.MapGet("/db-check", async (ApplicationDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();

    var userCount = await db.Users.CountAsync();
    var datasetCount = await db.Datasets.CountAsync();
    var jobCount = await db.TrainingJobs.CountAsync();

    return Results.Ok(new
    {
        ok = true,
        canConnect,
        counts = new
        {
            users = userCount,
            datasets = datasetCount,
            trainingJobs = jobCount
        }
    });
})
.WithName("DbCheck")
.WithOpenApi();


// -----------------------------
// Dataset APIs
// -----------------------------
app.MapPost("/datasets", async (CreateDatasetRequest req, DatasetService svc) =>
{
    var created = await svc.CreateAsync(req);
    return Results.Created($"/datasets/{created.Id}", created);
})
.WithName("CreateDataset")
.WithOpenApi();

app.MapGet("/datasets", async (DatasetService svc) =>
{
    var items = await svc.ListAsync();
    return Results.Ok(items);
})
.WithName("ListDatasets")
.WithOpenApi();

app.MapGet("/datasets/{id:guid}", async (Guid id, DatasetService svc) =>
{
    var item = await svc.GetAsync(id);
    return item is null ? Results.NotFound() : Results.Ok(item);
})
.WithName("GetDatasetById")
.WithOpenApi();



app.Run();