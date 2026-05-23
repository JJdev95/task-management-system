FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["TaskForge.sln", "./"]
COPY ["src/TaskForge.Domain/TaskForge.Domain.csproj", "src/TaskForge.Domain/"]
COPY ["src/TaskForge.Application/TaskForge.Application.csproj", "src/TaskForge.Application/"]
COPY ["src/TaskForge.Infrastructure/TaskForge.Infrastructure.csproj", "src/TaskForge.Infrastructure/"]
COPY ["src/TaskForge.Api/TaskForge.Api.csproj", "src/TaskForge.Api/"]
RUN dotnet restore "src/TaskForge.Api/TaskForge.Api.csproj"
COPY . .
RUN dotnet publish "src/TaskForge.Api/TaskForge.Api.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TaskForge.Api.dll"]
