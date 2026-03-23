# VPN Anomaly Detection — Angular Frontend

Real-time dashboard for monitoring and managing a VPN server with anomaly detection. Built with Angular 17 standalone components and Tailwind CSS.

---

## What does this project do?

Provides the visual interface for the VPN Anomaly Detection system. Connects to the Spring Boot backend to display live VPN status, manage traffic captures, trigger ML model training, and visualize anomaly scoring results.

## Application Structure

```
App (sidebar + routing)
├── Traffic Chart          — Daily/custom traffic stats
├── CSV Viewer             — Paginated table viewer for Wireshark CSV files
├── Traffic CSV List       — File manager for captures (repair, score, download)
├── Data Analyst           — ML training queue and model management
├── Monitor                — Analysis job history with filters
└── Admin Actions          — VPN service control (start, stop, restart)
```

## Screens

### Dashboard / Sidebar
Global VPN status indicator (active/inactive) with PID and uptime. Updates on every command execution.

### Traffic Chart
Displays daily traffic statistics (input/output). Supports quick ranges (7, 14, 30 days) and a custom date picker. Totals computed in real time.

### Traffic CSV List
Lists all `.pcap` capture files from the server with their processing status:

| Status | Meaning |
|--------|---------|
| `true` | CSV successfully generated |
| `pending` | Processing in progress |
| `false` | Processing timed out — click to re-trigger |

Each file can be: viewed in the CSV Viewer, sent for anomaly scoring (with model selection), or downloaded.

### CSV Viewer
Loads and renders any CSV file from the server as an interactive table. Supports real-time search across all columns, sortable headers (numeric and alphabetical), and pagination.

### Data Analyst
Manages the ML training pipeline. Allows launching new training jobs with mode selection and optional date range filtering. Displays a live training queue with phase-by-phase progress (Preprocessor → Transform → KMeans → IsoForest), updated every 10 seconds via polling.

| Mode | Description |
|------|-------------|
| `low` | Fast, minimal load |
| `normal` | Balanced time/precision |
| `hardcore` | Maximum detection precision |

### Monitor
Displays the full history of analysis jobs from `analysis_history.json`. Supports multi-criteria filtering by status, duration category, model, and mode, plus a date range filter on `created_at`. Auto-refreshes every 10 minutes.

### Admin Actions
Controls the OpenVPN service with a confirmation step before executing dangerous commands (stop, restart). Shows real-time execution output and updates the global VPN status indicator.

---

## Installation

```bash
git clone https://github.com/nathanvargas/angular-vpn-interface.git
cd angular-vpn-interface

npm install
```

### Configure the API URL

Open `src/app/service/Crud/crud.ts` and update the base URL to match your server:

```typescript
private API = 'http://192.168.0.167:8080/api';
```

### Run locally

```bash
ng serve
```

The app will be available at `http://localhost:4200`.

---

## API Communication

All HTTP calls are centralized in the `CRUD` service (`src/app/service/Crud/crud.ts`).

| Method | Endpoint | Used by |
|--------|----------|---------|
| GET | `/api/dashboard` | App (global status) |
| GET | `/api/clients` | (client list) |
| GET | `/api/csv_files` | Traffic CSV List |
| POST | `/api/csv_files/download` | CSV Viewer, file download |
| POST | `/api/csv_files/reparar/{file}` | Traffic CSV List |
| GET | `/api/traffic/range?from=&to=` | Traffic Chart |
| POST | `/api/traffic/score` | Traffic CSV List |
| POST | `/api/traffic/train` | Data Analyst |
| GET | `/api/traffic/history` | Monitor |
| GET | `/api/traffic/models_info` | Data Analyst |
| GET | `/api/traffic/training_log` | Data Analyst, Traffic CSV List |
| POST | `/api/vpn/execute?command=` | Admin Actions |
| POST | `/api/capture` | (capture trigger) |

---

## Tech Stack

- Angular 17 — standalone components
- Tailwind CSS
- Lucide Angular — icons
- RxJS — reactive HTTP and memory-safe subscriptions via `takeUntil`

---

## Related Projects

- [Spring Boot Backend](https://github.com/nathanvargas/springboot-vpn-backend) — REST API and VPN service management
- [Python ML Pipeline](https://github.com/nathanvargas/anomaly-scoring) — Anomaly detection with Isolation Forest and K-Means

---

Built with Angular, Tailwind CSS, RxJS. Part of the VPN Anomaly Detection project.
