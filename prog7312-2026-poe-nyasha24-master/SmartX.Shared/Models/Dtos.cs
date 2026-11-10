namespace SmartX.Shared.Models;

/// <summary>Payload the WPF client (or a simulated device) posts to /api/telemetry.</summary>
public class IngestRequest
{
    public required string SensorId { get; init; }
    public required string Zone { get; init; }
    public required SensorCategory Category { get; init; }

    // Only the field matching Category is expected to be populated.
    public float? FloatValue { get; init; }
    public int? IntValue { get; init; }
    public bool? BoolValue { get; init; }
}

/// <summary>One row in the live dashboard feed — the flattened view the WPF UI actually binds to.</summary>
public class DashboardReading
{
    public required string SensorId { get; init; }
    public required string Zone { get; init; }
    public required SensorCategory Category { get; init; }
    public required string DisplayValue { get; init; }
    public DateTime Timestamp { get; init; }
    public AlertSeverity Severity { get; init; } = AlertSeverity.Info;
}
