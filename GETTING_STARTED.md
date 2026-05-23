# TaskForge Getting Started

TaskForge runs as a .NET 10 Web API, SQL Server database, and React TypeScript frontend. On startup, the API applies EF Core migrations and seeds a demo account when the database is empty.

## Requirements

- .NET SDK 10
- Node.js 24 with npm 11
- Docker Desktop

## Run With Docker Compose

The quickest way to review the project is from the repository root:

```powershell
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger`
- SQL Server: `localhost,1433`

Demo login:

- Email: `demo@taskforge.local`
- Password: `TaskForge123`

## Run Locally

Start the SQL Server container:

```powershell
docker compose up taskforge-db
```

Run the API:

```powershell
dotnet run --project src/TaskForge.Api/TaskForge.Api.csproj
```

The default local API URL is `http://localhost:5082`. The development connection string is in `src/TaskForge.Api/appsettings.Development.json`.

In another terminal, run the frontend:

```powershell
cd src/TaskForge.Web
npm install
npm run dev
```

For Vite development, `src/TaskForge.Web/.env.development` points to `http://localhost:5082`. Docker Compose builds the frontend with `VITE_API_BASE_URL=http://localhost:8080`.

## Test And Build

Backend:

```powershell
dotnet restore TaskForge.sln
dotnet build TaskForge.sln
dotnet test TaskForge.sln
```

Frontend:

```powershell
cd src/TaskForge.Web
npm run lint
npm run test
npm run build
```

Integration tests use Testcontainers, so Docker Desktop needs to be running for the full integration suite. If Docker is not available, those tests are skipped and the unit tests still run.

## Useful Endpoints

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/signout`
- `POST /api/auth/change-password`

Tasks:

- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
