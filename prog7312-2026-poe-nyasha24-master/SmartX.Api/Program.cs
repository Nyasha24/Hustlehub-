using SmartX.Api.Endpoints;
using SmartX.Api.Hubs;
using SmartX.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Services 
builder.Services.AddSingleton<TelemetryStore>();
builder.Services.AddSingleton<AnomalyDetector>();
builder.Services.AddSingleton<IngestionService>();
builder.Services.AddSignalR();
builder.Services.AddHostedService<TelemetrySimulator>();

// The WPF client isn't a browser, but CORS still matters if you later add
// a Blazor/React admin view served from a different port during development.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(_ => true).AllowCredentials());
});

var app = builder.Build();

app.UseCors();

app.MapTelemetryEndpoints();
app.MapHub<TelemetryHub>("/hubs/telemetry");

app.MapGet("/", () => Results.Ok(new
{
    service = "Smart-X Gateway API",
    status = "running",
    hub = "/hubs/telemetry",
    docsHint = "POST /api/telemetry to ingest, GET /api/alerts for the alert feed"
}));

app.Run();
