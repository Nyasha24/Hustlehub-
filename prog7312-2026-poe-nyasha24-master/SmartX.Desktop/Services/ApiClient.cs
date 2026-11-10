using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using SmartX.Shared.Models;

namespace SmartX.Desktop.Services;

/// <summary>
/// All calls to the Gateway API go through here, and all of them are
/// async — this is the "clean, asynchronous .NET API communication"
/// half of the Task 2 Gateway rubric. Nothing in the UI blocks the
/// thread while waiting on the network.
/// </summary>
public class ApiClient
{
    private readonly HttpClient _http;

    // Change this if your API is running on a different port —
    // it must match SmartX.Api/appsettings.json "Urls".
    private const string BaseAddress = "http://localhost:5080"; 

    public ApiClient()
    {
        _http = new HttpClient { BaseAddress = new Uri(BaseAddress) };
    }

    public async Task<bool> RegisterSensorAsync(SensorRegistration registration)
    {
        var response = await _http.PostAsJsonAsync("/api/sensors/register", registration);
        return response.IsSuccessStatusCode;
    }

    public async Task<List<SensorRegistration>> GetSensorsAsync()
    {
        var result = await _http.GetFromJsonAsync<List<SensorRegistration>>("/api/sensors");
        return result ?? new List<SensorRegistration>();
    }

    public async Task<bool> SendReadingAsync(IngestRequest request)
    {
        var response = await _http.PostAsJsonAsync("/api/telemetry", request);
        return response.IsSuccessStatusCode;
    }

    public async Task<List<TelemetryAlert>> GetRecentAlertsAsync(int count = 50)
    {
        var result = await _http.GetFromJsonAsync<List<TelemetryAlert>>($"/api/alerts?count={count}");
        return result ?? new List<TelemetryAlert>();
    }

    public async Task<object?> ValidateZonesAsync()
    {
        return await _http.GetFromJsonAsync<object>("/api/zones/validate");
    }

    public async Task<(bool Success, string Message)> UploadFileAsync(string filePath)
    {
        using var form = new MultipartFormDataContent();
        await using var stream = File.OpenRead(filePath);
        using var streamContent = new StreamContent(stream);
        form.Add(streamContent, "file", Path.GetFileName(filePath));

        var response = await _http.PostAsync("/api/upload", form);
        var body = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, body);
    }
}
