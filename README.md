# TaskFlow

TaskFlow is a full-stack project & task management application with real-time notifications, role-based access control, file attachments, and team collaboration features. The backend is built with **.NET 8 Web API** and the frontend with **React 19 + Vite**. SQLite is used as the database, so setup is fast and works seamlessly on Windows, Mac, and Linux.

## Features

- **Role-based access control** — three roles: `Admin`, `ProjectManager`, and `Member`, each with distinct permissions
- **Project management** — create projects, assign team members, and track progress
- **Task management** — Kanban-style task board with create/edit/assign/status workflows
- **Real-time notifications** — powered by **SignalR** (WebSocket) over a JWT-authenticated hub
- **Comments & file attachments** — discuss tasks and attach files (up to 10 MB per file)
- **User approval workflow** — `ProjectManager` accounts require admin approval before activation
- **Granular per-user permissions** — admins can toggle a user's ability to interact with tasks, comment, or attach files
- **Profile management** — users can update their name and profile picture
- **Admin panel** — user management, approvals, and system controls
- **JWT authentication** — secure stateless auth, with passwords hashed using BCrypt
- **Swagger UI** — interactive API docs available in development

## Tech Stack

**Backend** ([TaskFlow/](TaskFlow/))
- .NET 8 Web API
- Entity Framework Core 8 (SQLite provider)
- ASP.NET Core SignalR (real-time)
- JWT Bearer authentication + BCrypt password hashing
- Swashbuckle (Swagger)
- Repository + Service layer pattern

**Frontend** ([taskflow-frontend/](taskflow-frontend/))
- React 19 + Vite
- React Router DOM 7 (client-side routing)
- React Context API for auth/state
- Axios (HTTP client)
- `@microsoft/signalr` (real-time client)
- Bootstrap 5 + react-icons
- `jwt-decode` for token claim extraction

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or higher)

## Step-by-Step Developer Setup

### 1. Initialize the Database
The project uses SQLite, so your entire database lives in a local file (`taskflow.db`). You need to generate this file by applying the Entity Framework migrations.

Open your terminal and navigate to the backend folder:
```bash
cd TaskFlow

# Apply the migrations to create the database file
dotnet ef database update
```
*(Note: If the `dotnet ef` command is not recognized, install the tool via `dotnet tool install --global dotnet-ef` first)*

### 2. Run the Backend API
In the same `TaskFlow` directory, start the .NET backend API server.
```bash
dotnet run
```
The backend server will start running on its designated port (default is usually `http://localhost:5218`). Swagger UI will be available at `http://localhost:5218/swagger` while running in the `Development` environment.

### 3. Run the Frontend App
Open a **new** terminal window, navigate into the frontend folder, install dependencies, and start the development server.
```bash
cd taskflow-frontend

# Install JavaScript packages (Only needed the first time)
npm install

# Start the React hot-reloading development server
npm run dev
```
The frontend website will start up on `http://localhost:5173`. Open this URL in your browser!

## Default Seed Accounts

On first migration, the database is seeded with test accounts (all use the password `000000`):

| Role            | Emails                            |
| --------------- | --------------------------------- |
| Admin           | `admin1@a.a`, `admin2@a.a`, `admin3@a.a` |
| ProjectManager  | `pm1@p.p`, `pm2@p.p`, `pm3@p.p`   |
| Member          | `m1@m.m`, `m2@m.m`, `m3@m.m`      |

> These credentials are for **local development only**. Change or remove the seeded users before deploying.

## Project Structure

```
TaskFlow/                       # .NET 8 backend
├── Controllers/                # API endpoints (Auth, Projects, Tasks, Admin, ...)
├── Models/                     # Domain entities (User, Project, TaskItem, Comment, ...)
├── DTOs/                       # Request/response DTOs
├── Data/                       # EF Core DbContext + seeding
├── Repositories/               # Data-access layer
├── Services/                   # Business logic (AuthService, TaskService, ...)
├── Hubs/                       # SignalR hubs (NotificationHub)
├── Middlewares/                # Global exception handler, etc.
├── Migrations/                 # EF Core migrations
└── wwwroot/uploads/            # Uploaded attachments

taskflow-frontend/              # React 19 + Vite frontend
└── src/
    ├── pages/                  # Dashboard, TaskBoard, ProjectDetail, Admin, ...
    ├── components/             # Modals, NotificationBell, PrivateRoute, RoleRoute, ...
    ├── context/                # AuthContext (JWT, current user)
    ├── hooks/                  # useNotifications (SignalR)
    ├── services/api.js         # Axios instance
    └── utils/                  # Token decoding helpers
```

## Configuration

Backend settings live in [TaskFlow/appsettings.json](TaskFlow/appsettings.json):
- `ConnectionStrings:DefaultConnection` — SQLite file path
- `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:DurationInMinutes` — JWT signing & lifetime

The CORS policy (`ReactPolicy`) allows the dev frontend at `http://localhost:5173`. Adjust this in [TaskFlow/Program.cs](TaskFlow/Program.cs) if your frontend runs elsewhere.

### Git Instructions
Because we defined a strict `.gitignore`, your local `taskflow.db` file will NOT be committed to GitHub. Each developer on the team has their own isolated database to experiment with, preventing data conflicts!
