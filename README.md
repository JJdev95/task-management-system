# TaskForge

TaskForge is a small task management system with the following flow: create an account, sign in, and manage a private list of tasks with priorities, due dates, statuses, and completion tracking.

Live app: https://taskforge-web.purpletree-477923cc.westeurope.azurecontainerapps.io/

## What It Includes

- User registration, login, refresh tokens, sign-out, current-user lookup, and password changes.
- Private task ownership, so users can only view and change their own tasks.
- Task creation, editing, soft deletion, filtering, pagination, and status changes.
- Filtering by status, priority, completion state, due-date range, and search text.
- React and TypeScript frontend with a responsive task board.
- Swagger documentation, Docker Compose startup, EF Core migrations, demo seed data, unit tests, and integration tests.

## Architecture

The backend is a .NET 10 Web API using Clean Architecture. The main layers are split into `Domain`, `Application`, `Infrastructure`, and `Api`:

- `Domain` contains the core task model and domain behavior.
- `Application` contains MediatR commands, queries, validators, and use-case logic.
- `Infrastructure` contains EF Core, SQL Server, Identity, repositories, caching, migrations, and seeding.
- `Api` contains Carter modules, request/response contracts, authentication setup, Swagger, and HTTP response shaping.

Business rules are kept out of route handlers. Task ownership is checked before read, update, and delete operations, and task deletion is implemented as a soft delete.

## Deployment

The solution is containerized and deployed to Azure. The live frontend is hosted at:

https://taskforge-web.purpletree-477923cc.westeurope.azurecontainerapps.io/

The deployed environment uses:

- Azure Container Registry for the built frontend and backend images.
- Azure Container Apps for the React frontend container.
- Azure Container Apps for the .NET API container.
- Azure SQL / SQL Server for the production database.

## Running Locally

The quickest way to review the project locally is with Docker Compose:

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

For non-Docker local setup, see [GETTING_STARTED.md](GETTING_STARTED.md).

## Notes For Reviewers

The first request to the hosted app may be slow because the Azure resources are running on a very small, low-cost setup. After the initial load, the app should respond more normally.

There is a local SQL Server password present in the local configuration / Docker setup so you(the reviewer) can start the app more easily locally. In a normal production project I would not commit passwords to the repository, even local-only ones. The real deployment passwords and connection strings are stored in GitHub repository secrets and Azure app secrets.