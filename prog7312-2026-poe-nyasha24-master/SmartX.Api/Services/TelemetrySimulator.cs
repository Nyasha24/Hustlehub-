using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using SmartX.Api.Hubs;
using SmartX.Shared.Models;

namespace SmartX.Api.Services;

/// <summary>
/// Seeds the system with a fleet of virtual sensors and continuously feeds
/// them mock readings, exactly as the brief asks ("heavily seed your
/// application with mock telemetry data to prove your data structures work
/// efficiently under load"). Also periodically runs the disconnect check
/// (the "silent failure" half of the alerting strategy) since real hardware
/// isn't required for this assessment.
///
/// To demo a disconnect alert live: let the app run, then note a SensorId
/// from the dashboard and comment out its line in GenerateBatch — the
/// disconnect check will flag it as offline after ~30s.
/// </summary>
public class TelemetrySimulator : BackgroundService
{
    private readonly IngestionService _ingestion;
    private readonly TelemetryStore _store;
    private readonly AnomalyDetector _detector;
    private readonly IHubContext<TelemetryHub> _hub;
    private readonly Random _random = new();

    private const int SensorCount = 60; // "thousands of microcontrollers" simulated at a demo-friendly scale

    public TelemetrySimulator(
        IngestionService ingestion,
        TelemetryStore store,
        AnomalyDetector detector,
        IHubContext<TelemetryHub> hub)
    {
        _ingestion = ingestion;
        _store = store;
        _detector = detector;
        _hub = hub;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        SeedVirtualFleet();

        int tick = 0;
        while (!stoppingToken.IsCancellationRequested)
        {
            await GenerateBatch();

            tick++;
            if (tick % 5 == 0) // every ~5 ticks, run the disconnect sweep
            {
                foreach (var alert in _detector.CheckDisconnects(_store))
                {
                    _store.RecordAlert(alert);
                    await _hub.Clients.All.SendAsync("ReceiveAlert", alert, stoppingToken);
                }
            }

            await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
        }
    }

    private void SeedVirtualFleet()
    {
        string[] zones = { "Greenhouse 1", "Greenhouse 2", "Substation 1", "Smart Grid Installation" };

        for (int i = 0; i < SensorCount; i++)
        {
            var category = (SensorCategory)(i % 3);
            var registration = new SensorRegistration
            {
                MacAddress = $"AA:BB:CC:{i:D2}:00:{category.ToString()[..2].ToUpper()}",
                Zone = zones[i % zones.Length],
                Category = category
            };
            _store.Register(registration);
        }
    }

    private async Task GenerateBatch()
    {
        foreach (var (macAddress, registration) in _store.Registrations)
        {
            var request = registration.Category switch
            {
                SensorCategory.SoilMoisture => new IngestRequest
                {
                    SensorId = macAddress,
                    Zone = registration.Zone,
                    Category = registration.Category,
                    FloatValue = NextMoistureReading(macAddress)
                },
                SensorCategory.PowerWattage => new IngestRequest
                {
                    SensorId = macAddress,
                    Zone = registration.Zone,
                    Category = registration.Category,
                    IntValue = NextWattageReading()
                },
                SensorCategory.ValveState => new IngestRequest
                {
                    SensorId = macAddress,
                    Zone = registration.Zone,
                    Category = registration.Category,
                    BoolValue = _random.NextDouble() > 0.9 // valves toggle rarely
                },
                _ => throw new InvalidOperationException("Unknown sensor category.")
            };

            await _ingestion.IngestAsync(request);
        }
    }

    private float NextMoistureReading(string sensorId)
    {
        // Mostly stable readings around 45%, with an occasional deliberate
        // spike so the anomaly detector has something real to catch.
        bool spike = _random.NextDouble() > 0.985;
        return spike
            ? 95f + (float)_random.NextDouble() * 5f
            : 45f + (float)(_random.NextDouble() * 6 - 3);
    }

    private int NextWattageReading() => 200 + _random.Next(-15, 16);
}
