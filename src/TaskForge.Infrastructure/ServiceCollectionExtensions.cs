using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Infrastructure.Authentication;
using TaskForge.Infrastructure.Caching;
using TaskForge.Infrastructure.Persistence;
using TaskForge.Infrastructure.Persistence.Repositories;
using TaskForge.Infrastructure.Persistence.Seeding;

namespace TaskForge.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services
            .AddIdentityApiEndpoints<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.SignIn.RequireConfirmedAccount = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddMemoryCache();
        services.AddHttpContextAccessor();
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddSingleton<ITaskListCache, TaskListCache>();
        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}
