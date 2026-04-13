# TaskFlow

Welcome to the TaskFlow project! This application consists of a .NET 8 Web API backend and a Vite + React frontend. We use SQLite for the database, meaning setup is extremely fast and works on Windows, Mac, and Linux seamlessly.

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
The backend server will start running on its designated port (default is usually `http://localhost:5218`).

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

### Git Instructions
Because we defined a strict `.gitignore`, your local `taskflow.db` file will NOT be committed to GitHub. Each developer on the team has their own isolated database to experiment with, preventing data conflicts!
