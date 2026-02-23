using Microsoft.EntityFrameworkCore;
using Platform.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// DbContext 등록 (PostgreSQL)
// -----------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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
// DB 연결 검증용 엔드포인트
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
// 기본 샘플 엔드포인트
// -----------------------------
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool",
    "Mild", "Warm", "Balmy", "Hot",
    "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

// -----------------------------
// Record 타입
// -----------------------------
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}