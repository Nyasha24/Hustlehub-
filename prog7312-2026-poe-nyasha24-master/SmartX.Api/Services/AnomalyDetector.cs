using SmartX.Shared.Models;

namespace SmartX.Api.Services;

/// <summary>
/// Implements the "tiered alerting with anomaly highlighting" strategy chosen
/// in the Task 1 report.
public class AnomalyDetector
{
    private const int WindowSize = 30;      // rolling window used for mean/stddev
    private const float WarningZ = 2.0f;    // z-score thresholds — tune per deployment
    private const float CriticalZ = 3.5f;
    private static readonly TimeSpan DisconnectTimeout = TimeSpan.FromSeconds(30);

    /// <summary>Checks a freshly-ingested numeric reading against its sensor's own recent history.</summary>
    public TelemetryAlert? CheckValueAnomaly(string sensorId, string zone, float value, SensorHistory history)
    {
        if (history.Count < WindowSize)
        {
            return null; // not enough history yet to judge "normal" for this sensor
        }

        float mean = history.Mean(WindowSize);
        float stdDev = history.StdDev(WindowSize);
        if (stdDev < 0.0001f)
        {
            return null; // flat/constant signal — avoid dividing by ~0
        }

        float z = MathF.Abs(value - mean) / stdDev;

        if (z >= CriticalZ)
        {
            return new TelemetryAlert
            {
                SensorId = sensorId,
                Zone = zone,
                Severity = AlertSeverity.Critical,
                Message = $"Reading {value:F2} is {z:F1} standard deviations from this sensor's recent average ({mean:F2})."
            };
        }

        if (z >= WarningZ)
        {
            return new TelemetryAlert
            {
                SensorId = sensorId,
                Zone = zone,
                Severity = AlertSeverity.Warning,
                Message = $"Reading {value:F2} is drifting from this sensor's recent average ({mean:F2})."
            };
        }

        return null;
    }

    // Checks every registered sensor's last-seen timestamp — catches devices that went silent. 
    public IEnumerable<TelemetryAlert> CheckDisconnects(TelemetryStore store)
    {
        var now = DateTime.UtcNow;

        foreach (var (macAddress, lastSeen) in store.LastSeen)
        {
            if (now - lastSeen <= DisconnectTimeout) continue;
            if (!store.Registrations.TryGetValue(macAddress, out var registration)) continue;

            yield return new TelemetryAlert
            {
                SensorId = macAddress,
                Zone = registration.Zone,
                Severity = AlertSeverity.Critical,
                Message = $"No telemetry received for over {DisconnectTimeout.TotalSeconds:F0}s — sensor may be offline.",
                IsDisconnect = true
            };
        }
    }
}
