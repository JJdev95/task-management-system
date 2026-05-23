using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.MsSql;

namespace TaskForge.IntegrationTests;

public sealed class TaskForgeApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string TestConnectionStringVariable = "TASKFORGE_TEST_CONNECTION_STRING";

    private readonly MsSqlContainer? _database;
    private string? _connectionString;

    public TaskForgeApiFactory()
    {
        _connectionString = Environment.GetEnvironmentVariable(TestConnectionStringVariable);

        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            _database = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
                .Build();
        }
    }

    public async Task InitializeAsync()
    {
        if (_database is null)
        {
            return;
        }

        await _database.StartAsync();
        _connectionString = _database.GetConnectionString();
    }

    public new async Task DisposeAsync()
    {
        if (_database is not null)
        {
            await _database.DisposeAsync();
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _connectionString
                    ?? throw new InvalidOperationException($"Set {TestConnectionStringVariable} or enable Docker for integration tests."),
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173"
            });
        });
    }
}
