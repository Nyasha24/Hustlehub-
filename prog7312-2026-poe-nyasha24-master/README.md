# Smart-X Gateway (WPF Desktop)

A Smart-X data ingestion and validation gateway for the "Traditional Desktop"
architecture option: a WPF client communicating with an ASP.NET Core Minimal
API backend over HTTP (async) and SignalR (real-time push).

## Architecture

```
SmartX.sln
├── SmartX.Shared    Class library — models & data structures used by both
│                    the API and the desktop client (TelemetryPacket<T>,
│                    SensorHistory, ZoneNode, etc.)
├── SmartX.Api       ASP.NET Core Minimal API + SignalR hub. Owns the
│                    in-memory store, anomaly detection, alerting, and a
│                    background service that seeds mock telemetry.
└── SmartX.Desktop   WPF client. Registers sensors, sends manual readings,
                     uploads files, and shows a live-updating dashboard.
```

Data flow: `TelemetrySimulator` (background service) or a real POST to
`/api/telemetry` → `IngestionService` stores the reading, runs it through
`AnomalyDetector`, and pushes both the reading and any resulting alert to
every connected WPF client over the `TelemetryHub` SignalR hub. The WPF
client never polls — it just listens.

## Requirements

- Windows (WPF only builds/runs on Windows)
- .NET 10 SDK. **If you only have an older SDK installed (8 or 9), open
  `SmartX.csproj`, `SmartX.Shared.csproj`, `SmartX.Api.csproj`, and
  `SmartX.Desktop.csproj` and change `net10.0`/`net10.0-windows` to
  `net8.0`/`net8.0-windows`.** Nothing in this codebase uses a .NET-10-only
  API, so this is a safe swap.

## Running it

1. **Restore packages** (from the solution root):
   ```
   dotnet restore
   ```
2. **Start the API first** — it must be running before the desktop app connects:
   ```
   dotnet run --project SmartX.Api
   ```
   It listens on `http://localhost:5080`. On startup it seeds ~60 virtual
   sensors and begins feeding them mock telemetry once a second — this is
   the "heavily seed with mock data" requirement from the brief.
3. **Start the desktop client** (separate terminal, or hit F5 in Visual Studio
   with `SmartX.Desktop` as the startup project):
   ```
   dotnet run --project SmartX.Desktop
   ```
4. Open the **Live Dashboard** tab — readings should start streaming in
   within a couple of seconds, with warning/critical rows highlighted.

If the desktop app shows "Could not connect to gateway," the API isn't
running yet, or the port in `SmartX.Desktop/Services/ApiClient.cs` doesn't
match `SmartX.Api/appsettings.json`.

## Where the Task 1 research strategy shows up

The chosen dashboard engagement strategy — **tiered alerting with anomaly
highlighting** — is implemented, not just described:

- `AnomalyDetector.CheckValueAnomaly` — rolling per-sensor mean/stddev
  (z-score), so each sensor is judged against its own normal range rather
  than one global threshold.
- `AnomalyDetector.CheckDisconnects` — a separate timeout check, because a
  silent sensor produces no bad value to threshold against.
- `TelemetryAlert.Severity` — Info/Warning/Critical tiering.
- `MainWindow.xaml` `DataTrigger`s — Warning rows shade yellow, Critical
  rows shade red and bold, directly on the live grid.

## Data structures, and why

- **`TelemetryPacket<T>` (generics + operator overloading)** — constrained
  to `INumber<T>` so one class serves both `float` (moisture) and `int`
  (wattage) without duplicating aggregation logic. Boolean valve state is
  deliberately a separate `ValveStateReading` type, since `bool` has no
  meaningful `+`/`>` and doesn't implement `INumber<T>` anyway.
- **`SensorHistory` (jagged array)** — stores readings as a growable list
  of fixed-size `float[]` chunks instead of one flat array, so adding a
  reading is O(1) amortised rather than repeatedly copying a resized array
  under high-throughput seeding.
- **`ZoneNode` + `ZoneValidator` (recursion)** — zones nest arbitrarily
  (farm → greenhouse → bed). `CountSensorsRecursive`, `ValidateRecursive`,
  and `MaxDepth` all walk the tree recursively so they work at any depth
  without hardcoded loop levels. Try it from the **Zone Tree Validation**
  tab in the desktop app.
- **Collections** — `ConcurrentDictionary`/`ConcurrentQueue` in the store
  (thread-safe under concurrent ingestion), `ObservableCollection<T>` in
  the WPF client (drives the live-updating grids without manual refresh
  code).

## Submission Note
The complete project with the full commit history (27 commits) is on the **main** branch

