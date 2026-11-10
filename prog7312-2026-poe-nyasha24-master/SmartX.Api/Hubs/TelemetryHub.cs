using Microsoft.AspNetCore.SignalR;

namespace SmartX.Api.Hubs;

/// <summary>
/// Thin hub — the WPF client only listens, it never calls back into the hub
/// methods (no client-invoked methods are defined here). All pushes happen
/// server-side via IHubContext&lt;TelemetryHub&gt; from the ingestion pipeline
/// and the disconnect-checker background service. This is the "push, not
/// polling" mechanism behind the real-time visual feedback strategy.
/// </summary>lemetr
public class TelemetryHub : Hub
{
}
