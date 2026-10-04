# Client Project Tracker

A simple web app for a digital agency to track client projects, monitor their progress and manage priorities. Built with ASP.NET Core (MVC + REST API), Entity Framework Core and SQLite.

This simple web app is dedicated to #kodadevteam, #KodaRecruitmentTeam and #kodakollectiv.

## Features

- Project list with client avatars, status pills, priority and due dates (overdue projects are flagged)
- Create, edit and delete projects
- Search by client or project name, and filter by status or priority
- Server-side validation with clear, field-level error messages (plus matching checks in the browser)
- Toast notifications for create, update and delete
- Light and dark mode (remembers your choice)
- Data saved in a local SQLite database
- REST API that other apps can use

## Project model

| Field | Details |
|---|---|
| `id` | Auto-generated |
| `clientName` | Required, max 100 characters |
| `projectName` | Required, max 150 characters |
| `description` | Optional, max 2000 characters |
| `status` | `Planning`, `In Progress`, `On Hold` or `Completed` |
| `priority` | `Low`, `Medium` or `High` |
| `startDate` | Required, `yyyy-MM-dd` |
| `dueDate` | Required, `yyyy-MM-dd`, cannot be earlier than `startDate` |

## Requirements

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (check with `dotnet --version`)
- An internet connection the first time you run, so NuGet can download packages
- Any modern browser (Chrome or Edge recommended)

## How to run

```bash
git clone https://github.com/<your-username>/ClientProjectTracker.git
cd ClientProjectTracker
dotnet run --urls http://localhost:5050
```

Then open **http://localhost:5050** in your browser.

- The console prints `Database file: ...` so you can see where your data is stored.
- Stop the app with `Ctrl+C`.
- Using Visual Studio 2022? Open `ClientProjectTracker.csproj` and press F5, then open the URL shown in the console.

## Data storage

Projects are stored in a SQLite file named `projects.db`, created in the project folder on first run and filled with three sample projects.

- To reset to the sample data, stop the app and delete `projects.db`.
- To back up your data, copy `projects.db`.
- `projects.db` is listed in `.gitignore`, so your data is never committed.
- The tables are created automatically but are not altered later. If you change the `Project` model, delete `projects.db` or switch to EF Core migrations.

## REST API

Base URL: `http://localhost:5050`

| Method | Route | Description | Success |
|---|---|---|---|
| GET | `/projects` | Get all projects | `200` |
| GET | `/projects/{id}` | Get one project | `200` |
| POST | `/projects` | Create a project | `201` |
| PUT | `/projects/{id}` | Update a project | `200` |
| DELETE | `/projects/{id}` | Delete a project | `204` |

Example request body for `POST` and `PUT`:

```json
{
  "clientName": "Acme",
  "projectName": "Website redesign",
  "description": "New homepage and blog.",
  "status": "In Progress",
  "priority": "High",
  "startDate": "2026-10-10",
  "dueDate": "2026-12-01"
}
```

Try it from a terminal:

```bash
curl http://localhost:5050/projects
curl -X POST http://localhost:5050/projects -H "Content-Type: application/json" \
  -d '{"clientName":"Acme","projectName":"Site","status":"Planning","priority":"High","startDate":"2026-10-10","dueDate":"2026-11-10"}'
```

### Errors

Invalid requests return `400` with the problems listed per field:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "clientName": ["Client name is required."],
    "dueDate": ["Due date cannot be earlier than the start date."]
  }
}
```

An unknown id returns `404` with a message such as `No project exists with id 42.`

## Project structure

```
ClientProjectTracker/
├── Program.cs                  App startup and wiring
├── Models/                     Project entity and request payload
├── Views/                      Razor page (layout + project tracker page)
├── Controllers/
│   ├── HomeController.cs       Serves the web page
│   └── ProjectsController.cs   REST API
├── Data/                       EF Core context and sample data
├── Validation/                 Validation rules
└── wwwroot/
    ├── css/site.css            Styling (including dark mode)
    └── js/app.js               Page logic (calls the API with fetch)
```

The app follows the MVC pattern. `HomeController` returns the page, and the page's JavaScript calls `ProjectsController` for data.

## Troubleshooting

- **Port already in use:** run on another port, for example `dotnet run --urls http://localhost:5080`.
- **`NU1100` error when restoring packages:** NuGet can't reach nuget.org. Check `dotnet nuget list source`, then your internet, VPN or firewall.
- **Build error about the target framework:** you have a different .NET SDK. Change `net10.0` in `ClientProjectTracker.csproj` to your major version and use a matching `Microsoft.EntityFrameworkCore.Sqlite` version.
- **Sample data appeared instead of mine:** you are running from a different folder, so a new `projects.db` was created. Check the `Database file:` line in the console.

## Tech stack

ASP.NET Core (MVC and controller-based API), Entity Framework Core with SQLite, vanilla JavaScript and CSS (no front-end frameworks).
