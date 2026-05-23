# TaskForge Web

TaskForge Web is the React TypeScript frontend for the TaskForge task management system. It uses Vite, MUI, Redux Toolkit, Axios, React Router, dnd-kit, and Vitest.

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- TaskForge API running locally at `http://localhost:5082`, or through Docker at `http://localhost:8080`

## Local Development

```powershell
cd src/TaskForge.Web
npm install
npm run dev
```

Open `http://localhost:5173`.

By default, Vite development uses `http://localhost:5082`, which matches `dotnet run --project src/TaskForge.Api/TaskForge.Api.csproj`.

To point the app at a different backend, create `.env.local`:

```text
VITE_API_BASE_URL=http://localhost:5082
```

## Scripts

```powershell
npm run lint
npm run test
npm run build
npm run preview
```

## Docker

From the repository root:

```powershell
docker compose up --build
```

The frontend is served at `http://localhost:5173` and calls the API at `http://localhost:8080`.

## API Assumptions

- Auth uses `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `/api/auth/me`, and `/api/auth/signout`.
- Task CRUD uses `/api/tasks`.
- Drag/drop changes task status through `PUT /api/tasks/{id}`.
- Priority changes use the existing `Low`, `Medium`, `High`, and `Critical` values.
- The client accepts either numeric or string enum values from the API and sends numeric enum values for task write requests.
