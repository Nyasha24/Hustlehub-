using System.Collections.Concurrent;
using SmartX.Shared.Models;

namespace SmartX.Api.Services;

/// <summary>
/// Central in-memory store for the gateway. Uses ConcurrentDictionary/ConcurrentBag
/// throughout because the telemetry simulator, real ingestion requests, and
/// dashboard reads can all happen on different threads at once under load.
/// </summary>
public class TelemetryStore
{
    public ConcurrentDictionary<string, SensorRegistration> Registrations { get; } = new();
    public ConcurrentDictionary<string, SensorHistory> Histories { get; } = new();     // moisture / power
    public ConcurrentDictionary<string, bool> ValveStates { get; } = new();            // latest valve reading
    public ConcurrentDictionary<string, DateTime> LastSeen { get; } = new();
    public ConcurrentQueue<TelemetryAlert> Alerts { get; } = new();

    public ZoneNode RootZone { get; } = new()
    {
        Name = "Smart-X",
        SubZones = new List<ZoneNode>
        {
            new()
            {
                Name = "Hydroponic Farm A",
                SubZones = new List<ZoneNode>
                {
                    new() { Name = "Greenhouse 1", SensorIds = new List<string>() },
                    new() { Name = "Greenhouse 2", SensorIds = new List<string>() }
                }
            },
            new()
            {
                Name = "Utility Tracker Block",
                SubZones = new List<ZoneNode>
                {
                    new() { Name = "Substation 1", SensorIds = new List<string>() }
                }
            },
            new()
            {
                Name = "Smart Grid Installation",
                SubZones = new List<ZoneNode>()
            }
        }
    };

    public void Register(SensorRegistration registration)
    {
        Registrations[registration.MacAddress] = registration;
        LastSeen[registration.MacAddress] = DateTime.UtcNow;

        if (registration.Category != SensorCategory.ValveState)
        {
            Histories.TryAdd(registration.MacAddress, new SensorHistory());
        }

        
        var target = FindLeafByName(RootZone, registration.Zone) ?? RootZone;
        if (!target.SensorIds.Contains(registration.MacAddress))
        {
            target.SensorIds.Add(registration.MacAddress);
        }
    }

    private static ZoneNode? FindLeafByName(ZoneNode node, string name)
    {
        if (string.Equals(node.Name, name, StringComparison.OrdinalIgnoreCase))
        {
            return node;
        }

        foreach (var sub in node.SubZones)
        {
            var found = FindLeafByName(sub, name); // recursive search
            if (found is not null) return found;
        }

        return null;
    }

    public void RecordAlert(TelemetryAlert alert) => Alerts.Enqueue(alert);

    public List<TelemetryAlert> RecentAlerts(int count = 50) =>
        Alerts.Reverse().Take(count).ToList();
}
