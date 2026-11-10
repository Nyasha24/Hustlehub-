using Microsoft.AspNetCore.SignalR.Client;
using SmartX.Shared.Models;

namespace SmartX.Desktop.Services;

/// <summary>
/// Wraps the SignalR connection so the dashboard receives new readings and
/// alerts the instant they happen server-side — no polling, no "refresh"
/// button. This is what makes the dashboard feel alive rather than static.
/// </summary>
public class RealtimeClient
{
    private const string HubUrl = "http://localhost:5080/hubs/telemetry";
    private readonly HubConnection _connection;

    public event Action<DashboardReading>? ReadingReceived;
    public event Action<TelemetryAlert>? AlertReceived;

    public RealtimeClient()
    {
        _connection = new HubConnectionBuilder()
            .WithUrl(HubUrl)
            .WithAutomaticReconnect()
            .Build();

        _connection.On<DashboardReading>("ReceiveReading", reading => ReadingReceived?.Invoke(reading));
        _connection.On<TelemetryAlert>("ReceiveAlert", alert => AlertReceived?.Invoke(alert));
    }

    public async Task StartAsync()
    {
        if (_connection.State == HubConnectionState.Disconnected)
        {
            await _connection.StartAsync();
        }
    }

    public async Task StopAsync()
    {
        await _connection.StopAsync();
    }
}
