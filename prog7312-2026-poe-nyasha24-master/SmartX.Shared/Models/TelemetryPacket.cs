using System.Numerics;

namespace SmartX.Shared.Models;

/// <summary>
/// Generic wrapper for a single numeric telemetry reading.
///
/// Constrained to `INumber&lt;T&gt;` (.NET generic math) rather than plain
/// `struct` so the compiler enforces that T actually supports +, -, and
/// comparison — this is what lets one class type serve both the float
/// (soil moisture) and int (power wattage) streams without duplicating
/// the aggregation/comparison logic for each.
///
/// Boolean valve state is deliberately NOT represented by this class —
/// bool does not implement INumber&lt;T&gt;, and arithmetic/relational
/// operators don't have a sensible meaning for an on/off state anyway.
/// See <see cref="ValveStateReading"/> for that case instead.
/// </summary>
public class TelemetryPacket<T> where T : struct, INumber<T>
{
    public required string SensorId { get; init; }
    public required string Zone { get; init; }
    public required T Value { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string Unit { get; init; } = string.Empty;

    /// <summary>
    /// Combines two readings from the same sensor into an aggregate packet
    /// (arithmetic mean). Used when the anomaly detector needs a rolling
    /// combined value without holding onto every raw sample.
    /// </summary>
    public static TelemetryPacket<T> operator +(TelemetryPacket<T> a, TelemetryPacket<T> b)
    {
        if (a.SensorId != b.SensorId)
            throw new InvalidOperationException(
                $"Cannot aggregate packets from different sensors ('{a.SensorId}' vs '{b.SensorId}').");

        var two = T.One + T.One;
        var combined = (a.Value + b.Value) / two;

        return new TelemetryPacket<T>
        {
            SensorId = a.SensorId,
            Zone = a.Zone,
            Value = combined,
            Timestamp = DateTime.UtcNow,
            Unit = a.Unit
        };
    }

    /// <summary>Returns the raw delta between two readings — used to detect sudden spikes.</summary>
    public static T operator -(TelemetryPacket<T> a, TelemetryPacket<T> b) => a.Value - b.Value;

    public static bool operator >(TelemetryPacket<T> a, TelemetryPacket<T> b) => a.Value > b.Value;
    public static bool operator <(TelemetryPacket<T> a, TelemetryPacket<T> b) => a.Value < b.Value;

    public override string ToString() => $"[{Timestamp:HH:mm:ss}] {SensorId} ({Zone}) = {Value}{Unit}";
}

/// <summary>
/// Non-generic counterpart for boolean valve-state telemetry.
/// Kept separate from TelemetryPacket&lt;T&gt; on purpose — see class remarks above.
/// </summary>
public class ValveStateReading
{
    public required string SensorId { get; init; }
    public required string Zone { get; init; }
    public required bool IsOpen { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    public override string ToString() =>
        $"[{Timestamp:HH:mm:ss}] {SensorId} ({Zone}) valve = {(IsOpen ? "OPEN" : "CLOSED")}";
}
