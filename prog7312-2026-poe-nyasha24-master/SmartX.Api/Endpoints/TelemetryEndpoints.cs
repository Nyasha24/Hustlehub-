using SmartX.Api.Services;
using SmartX.Shared.Models;

namespace SmartX.Api.Endpoints;

public static class TelemetryEndpoints
{
    public static void MapTelemetryEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        // Registration 
        api.MapPost("/sensors/register", (SensorRegistration registration, TelemetryStore store) =>
        {
            store.Register(registration);
            return Results.Created($"/api/sensors/{registration.MacAddress}", registration);
        });

        api.MapGet("/sensors", (TelemetryStore store) =>
            store.Registrations.Values.OrderBy(r => r.Zone).ThenBy(r => r.MacAddress));

        // Ingestion
        api.MapPost("/telemetry", async (IngestRequest request, IngestionService ingestion) =>
        {
            await ingestion.IngestAsync(request);
            return Results.Accepted();
        });

        api.MapGet("/telemetry/{sensorId}/history", (string sensorId, TelemetryStore store, int tail = 50) =>
        {
            if (!store.Histories.TryGetValue(sensorId, out var history))
            {
                return Results.NotFound($"No history for sensor '{sensorId}'.");
            }
            return Results.Ok(history.Tail(tail));
        });

        // Alerts
        api.MapGet("/alerts", (TelemetryStore store, int count = 50) =>
            store.RecentAlerts(count));

        // Zone tree
        api.MapGet("/zones/tree", (TelemetryStore store) => store.RootZone);

        api.MapGet("/zones/validate", (TelemetryStore store) =>
        {
            var known = store.Registrations.Keys.ToHashSet();
            var issues = ZoneValidator.ValidateRecursive(store.RootZone, known);
            var totalSensors = ZoneValidator.CountSensorsRecursive(store.RootZone);
            var maxDepth = ZoneValidator.MaxDepth(store.RootZone);

            return Results.Ok(new
            {
                TotalSensorsInTree = totalSensors,
                MaxZoneDepth = maxDepth,
                Issues = issues
            });
        });

        // File / log upload
        api.MapPost("/upload", async (IFormFile file) =>
        {
            if (file.Length == 0)
            {
                return Results.BadRequest("Empty file.");
            }

            var uploadsDir = Path.Combine(AppContext.BaseDirectory, "Uploads");
            Directory.CreateDirectory(uploadsDir);

            var safeName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Path.GetFileName(file.FileName)}";
            var destination = Path.Combine(uploadsDir, safeName);

            await using var stream = File.Create(destination);
            await file.CopyToAsync(stream);

            return Results.Ok(new { savedAs = safeName, sizeBytes = file.Length });
        }).DisableAntiforgery();
    }
}
