namespace SmartX.Shared.Models;

/// <summary>
/// Stores a sensor's historical readings as a jagged array (an array of
/// fixed-size chunks) rather than one flat array or a single List&lt;float&gt;.
///
/// Why: under high-throughput seeding (thousands of readings/sec across
/// many sensors) repeatedly resizing one big array is O(n) per grow. A
/// jagged array of fixed-size chunks only ever allocates a new small
/// chunk (O(1) amortised) instead of copying everything that came before.
/// This is the "arrays and recursion" data-structure requirement from the
/// brief, applied for a reason rather than for its own sake.
/// </summary>
public class SensorHistory
{
    private const int ChunkSize = 256;

    // Jagged array in the true sense: List<float[]> is a growable collection
    // of independently-sized arrays (all ChunkSize here, but each row is a
    // separate array object — the defining trait of a jagged array).
    private readonly List<float[]> _chunks = new();
    private int _count;

    public int Count => _count;

    public void Add(float value)
    {
        int chunkIndex = _count / ChunkSize;
        int offset = _count % ChunkSize;

        if (chunkIndex >= _chunks.Count)
        {
            _chunks.Add(new float[ChunkSize]);
        }

        _chunks[chunkIndex][offset] = value;
        _count++;
    }

    /// <summary>Flattens the jagged storage into a single array for API responses / charting.</summary>
    public float[] ToArray()
    {
        var result = new float[_count];
        for (int i = 0; i < _count; i++)
        {
            result[i] = _chunks[i / ChunkSize][i % ChunkSize];
        }
        return result;
    }

    /// <summary>Last N readings — what the dashboard sparkline actually needs, not the full history.</summary>
    public float[] Tail(int n)
    {
        int take = Math.Min(n, _count);
        var result = new float[take];
        for (int i = 0; i < take; i++)
        {
            int sourceIndex = _count - take + i;
            result[i] = _chunks[sourceIndex / ChunkSize][sourceIndex % ChunkSize];
        }
        return result;
    }

    public float Mean(int windowSize)
    {
        var window = Tail(windowSize);
        return window.Length == 0 ? 0f : window.Average();
    }

    public float StdDev(int windowSize)
    {
        var window = Tail(windowSize);
        if (window.Length < 2) return 0f;
        float mean = window.Average();
        float sumSq = window.Sum(v => (v - mean) * (v - mean));
        return MathF.Sqrt(sumSq / (window.Length - 1));
    }
}
