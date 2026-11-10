namespace SmartX.Shared.Models;


/// Severity tiers used by the alerting pipeline. Info-level anomalies are
/// logged but not pushed to the dashboard; Warning/Critical are surfaced
/// and visually highlighted.

public enum AlertSeverity
{
    Info,
    Warning,
    Critical
}

/// 
/// The three telemetry categories described in the Smart-X brief:
/// floats for soil moisture, integers for power wattage, booleans for valve state.

public enum SensorCategory
{
    SoilMoisture,
    PowerWattage,
    ValveState
}


/// A device registering itself with the gateway (MAC address, zone/location, category).

public class SensorRegistration
{
    public required string MacAddress { get; init; }
    public required string Zone { get; init; }
    public required SensorCategory Category { get; init; }
    public DateTime RegisteredAt { get; init; } = DateTime.UtcNow;
}


/// A raised alert — either a value-based anomaly or a silent-disconnect timeout.
/// This is what the tiered alerting strategy from Task 1 surfaces on the dashboard 

public class TelemetryAlert
{
    public required string SensorId { get; init; }
    public required string Zone { get; init; }
    public required AlertSeverity Severity { get; init; }
    public required string Message { get; init; }
    public DateTime RaisedAt { get; init; } = DateTime.UtcNow;
    public bool IsDisconnect { get; init; }
}
