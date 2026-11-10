using System.Collections.ObjectModel;
using System.Globalization;
using System.Text.Json;
using System.Windows;
using System.Windows.Media;
using Microsoft.Win32;
using SmartX.Desktop.Services;
using SmartX.Shared.Models;

namespace SmartX.Desktop;

public partial class MainWindow : Window
{
    private readonly ApiClient _api = new();
    private readonly RealtimeClient _realtime = new();

    // Capped so the DataGrid stays fast and readable under high-throughput
    // seeding rather than growing forever — newest readings at the top.
    private const int MaxRowsShown = 300;

    private readonly ObservableCollection<DashboardReading> _readings = new();
    private readonly ObservableCollection<TelemetryAlert> _alerts = new();

    private string? _selectedFilePath;

    public MainWindow()
    {
        InitializeComponent();

        ReadingsGrid.ItemsSource = _readings;
        AlertsGrid.ItemsSource = _alerts;

        _realtime.ReadingReceived += OnReadingReceived;
        _realtime.AlertReceived += OnAlertReceived;

        Loaded += MainWindow_Loaded;
        Closing += (_, _) => { _ = _realtime.StopAsync(); };
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            await _realtime.StartAsync();
            SetStatus("Connected to gateway — live feed active.", Brushes.LimeGreen);
        }
        catch (Exception ex)
        {
            SetStatus($"Could not connect to gateway: {ex.Message}. Is SmartX.Api running?", Brushes.Red);
        }

        try
        {
            var existingAlerts = await _api.GetRecentAlertsAsync();
            foreach (var alert in existingAlerts)
            {
                _alerts.Insert(0, alert);
            }
        }
        catch
        {
            // Gateway not reachable yet — the connection status message already covers this.
        }
    }

    private void SetStatus(string message, Brush color)
    {
        Dispatcher.Invoke(() =>
        {
            StatusText.Text = message;
            StatusDot.Fill = color;
        });
    }

    // Live feed handlers 

    private void OnReadingReceived(DashboardReading reading)
    {
        Dispatcher.Invoke(() =>
        {
            _readings.Insert(0, reading);
            while (_readings.Count > MaxRowsShown)
            {
                _readings.RemoveAt(_readings.Count - 1);
            }
        });
    }

    private void OnAlertReceived(TelemetryAlert alert)
    {
        Dispatcher.Invoke(() =>
        {
            _alerts.Insert(0, alert);
            while (_alerts.Count > MaxRowsShown)
            {
                _alerts.RemoveAt(_alerts.Count - 1);
            }
        });
    }

    // Register tab 

    private async void RegisterButton_Click(object sender, RoutedEventArgs e)
    {
        var category = ParseCategory(RegCategoryBox.Text);
        var registration = new SensorRegistration
        {
            MacAddress = RegMacBox.Text.Trim(),
            Zone = RegZoneBox.Text.Trim(),
            Category = category
        };

        RegStatusText.Text = "Registering...";
        var success = await _api.RegisterSensorAsync(registration);
        RegStatusText.Text = success
            ? $"Registered '{registration.MacAddress}' in zone '{registration.Zone}'."
            : "Registration failed — check that SmartX.Api is running.";
    }

    // Manual ingest tab

    private async void SendReadingButton_Click(object sender, RoutedEventArgs e)
    {
        var category = ParseCategory(IngestCategoryBox.Text);
        var sensorId = IngestSensorIdBox.Text.Trim();
        var zone = IngestZoneBox.Text.Trim();
        var rawValue = IngestValueBox.Text.Trim();

        var request = category switch
        {
            SensorCategory.SoilMoisture => new IngestRequest
            {
                SensorId = sensorId,
                Zone = zone,
                Category = category,
                FloatValue = float.TryParse(rawValue, NumberStyles.Float, CultureInfo.InvariantCulture, out var f) ? f : 0f
            },
            SensorCategory.PowerWattage => new IngestRequest
            {
                SensorId = sensorId,
                Zone = zone,
                Category = category,
                IntValue = int.TryParse(rawValue, out var i) ? i : 0
            },
            SensorCategory.ValveState => new IngestRequest
            {
                SensorId = sensorId,
                Zone = zone,
                Category = category,
                BoolValue = rawValue.Equals("true", StringComparison.OrdinalIgnoreCase)
            },
            _ => throw new InvalidOperationException()
        };

        IngestStatusText.Text = "Sending...";
        var success = await _api.SendReadingAsync(request);
        IngestStatusText.Text = success
            ? "Reading sent — check the Live Dashboard tab."
            : "Send failed — check that SmartX.Api is running.";
    }

    private static SensorCategory ParseCategory(string? text) => text switch
    {
        "SoilMoisture" => SensorCategory.SoilMoisture,
        "PowerWattage" => SensorCategory.PowerWattage,
        "ValveState" => SensorCategory.ValveState,
        _ => SensorCategory.SoilMoisture
    };

    // Upload tab  

    private void ChooseFileButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Title = "Select a log file or sensor photo",
            Filter = "All files (*.*)|*.*"
        };

        if (dialog.ShowDialog() == true)
        {
            _selectedFilePath = dialog.FileName;
            SelectedFileText.Text = $"Selected: {_selectedFilePath}";
        }
    }

    private async void UploadButton_Click(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrEmpty(_selectedFilePath))
        {
            UploadStatusText.Text = "Choose a file first.";
            return;
        }

        UploadStatusText.Text = "Uploading...";
        var (success, message) = await _api.UploadFileAsync(_selectedFilePath);
        UploadStatusText.Text = success ? $"Upload succeeded: {message}" : $"Upload failed: {message}";
    }

    // Zone validation tab

    private async void ValidateZonesButton_Click(object sender, RoutedEventArgs e)
    {
        ValidationResultBox.Text = "Running recursive validation...";
        try
        {
            var result = await _api.ValidateZonesAsync();
            ValidationResultBox.Text = result is null
                ? "No result returned."
                : JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            ValidationResultBox.Text = $"Validation failed: {ex.Message}";
        }
    }
}
