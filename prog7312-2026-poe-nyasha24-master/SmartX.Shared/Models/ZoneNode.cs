namespace SmartX.Shared.Models;

/// <summary>
/// Represents a physical/logical zone (e.g. "Farm A" -> "Greenhouse 2" -> "Bed 4").
/// Zones can nest arbitrarily deep, which is why they're validated recursively
/// rather than with a fixed number of loops.
/// </summary>
public class ZoneNode
{
    public required string Name { get; init; }
    public List<ZoneNode> SubZones { get; init; } = new();
    public List<string> SensorIds { get; init; } = new();
}

/// <summary>
/// Recursive traversal helpers over the zone hierarchy.
///
/// Both methods share the same shape: process this node's own data, then
/// recurse into each child. The base case is a node with an empty
/// SubZones list, which naturally terminates the recursion at any depth
/// without needing to know how deep the tree actually goes.
/// </summary>
public static class ZoneValidator
{
    /// <summary>Recursively counts every sensor registered anywhere in the tree.</summary>
    public static int CountSensorsRecursive(ZoneNode node)
    {
        int count = node.SensorIds.Count;

        foreach (var subZone in node.SubZones)
        {
            count += CountSensorsRecursive(subZone); // recursive descent
        }

        return count;
    }

    /// <summary>
    /// Recursively checks that every sensor referenced in the tree is actually
    /// registered. Returns one message per orphaned/unregistered sensor found.
    /// </summary>
    public static List<string> ValidateRecursive(ZoneNode node, HashSet<string> knownSensorIds, string path = "")
    {
        var issues = new List<string>();
        string currentPath = string.IsNullOrEmpty(path) ? node.Name : $"{path} / {node.Name}";

        foreach (var sensorId in node.SensorIds)
        {
            if (!knownSensorIds.Contains(sensorId))
            {
                issues.Add($"Zone '{currentPath}': references unregistered sensor '{sensorId}'");
            }
        }

        foreach (var subZone in node.SubZones)
        {
            issues.AddRange(ValidateRecursive(subZone, knownSensorIds, currentPath)); // recursive descent
        }

        return issues;
    }

    /// <summary>Recursively finds the maximum nesting depth of the zone tree (used in the README/demo).</summary>
    public static int MaxDepth(ZoneNode node)
    {
        if (node.SubZones.Count == 0)
        {
            return 1; // base case
        }

        return 1 + node.SubZones.Max(MaxDepth);
    }
}
