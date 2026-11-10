using Microsoft.AspNetCore.SignalR;
using SmartX.Api.Hubs;
using SmartX.Shared.Models;

namespace SmartX.Api.Services;

/// <summary>
/// The single code path every reading goes through, whether it came from
/// a real HTTP POST or from the mock simulator: store it, run it past the
/// anomaly detector, raise + broadcast an alert if needed, and push the
/// reading itself to the dashboard over SignalR.
/// </summary>
public class IngestionService
{
    private readonly TelemetryStore _store;
    private readonly AnomalyDetector _detector;
    private readonly IHubContext<TelemetryHub> _hub;

    public IngestionService(TelemetryStore store, AnomalyDetector detector, IHubContext<TelemetryHub> hub)
    {
        _store = store;
        _detector = detector;
        _hub = hub;
    }

    public async Task IngestAsync(IngestRequest request)
    {
        _store.LastSeen[request.SensorId] = DateTime.UtcNow;

        var reading = new DashboardReading
        {
            SensorId = request.SensorId,
            Zone = request.Zone,
            Category = request.Category,
            DisplayValue = FormatValue(request),
            Timestamp = DateTime.UtcNow,
            Severity = AlertSeverity.Info
        };

        TelemetryAlert? alert = null;

        switch (request.Category)
        {
            case SensorCategory.SoilMoisture when request.FloatValue is { } floatVal:
                alert = ProcessNumeric(request.SensorId, request.Zone, floatVal);
                break;

            case SensorCategory.PowerWattage when request.IntValue is { } intVal:
                alert = ProcessNumeric(request.SensorId, request.Zone, intVal);
                break;

            case SensorCategory.ValveState when request.BoolValue is { } boolVal:
                _store.ValveStates[request.SensorId] = boolVal;
                break;
        }

        if (alert is not null)
        {
            _store.RecordAlert(alert);
        }

        var severity = alert?.Severity ?? AlertSeverity.Info;
        var pushedReading = new DashboardReading
        {
            SensorId = reading.SensorId,
            Zone = reading.Zone,
            Category = reading.Category,
            DisplayValue = reading.DisplayValue,
            Timestamp = reading.Timestamp,
            Severity = severity
        };

        await _hub.Clients.All.SendAsync("ReceiveReading", pushedReading);

        if (alert is not null)
        {
            await _hub.Clients.All.SendAsync("ReceiveAlert", alert);
        }
    }

    private TelemetryAlert? ProcessNumeric(string sensorId, string zone, float value)
    {
        var history = _store.Histories.GetOrAdd(sensorId, _ => new SensorHistory());
        var alert = _detector.CheckValueAnomaly(sensorId, zone, value, history);
        history.Add(value);
        return alert;
    }

    private static string FormatValue(IngestRequest request) => request.Category switch
    {
        SensorCategory.SoilMoisture => $"{request.FloatValue:F2}%",
        SensorCategory.PowerWattage => $"{request.IntValue}W",
        SensorCategory.ValveState => request.BoolValue == true ? "OPEN" : "CLOSED",
        _ => "n/a"
    };
}
