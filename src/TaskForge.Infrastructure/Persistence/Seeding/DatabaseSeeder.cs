using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskForge.Domain.Tasks;
using TaskForge.Infrastructure.Authentication;

namespace TaskForge.Infrastructure.Persistence.Seeding;

public sealed class DatabaseSeeder(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    ILogger<DatabaseSeeder> logger)
{
    public const string DemoEmail = "demo@taskforge.local";
    public const string DemoPassword = "TaskForge123";

    public async Task SeedIfEmptyAsync(CancellationToken cancellationToken = default)
    {
        if (await dbContext.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var demoUser = new ApplicationUser
        {
            UserName = DemoEmail,
            Email = DemoEmail,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(demoUser, DemoPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"Could not seed demo user. {errors}");
        }

        var now = DateTimeOffset.UtcNow;
        var tasks = new[]
        {
            TaskItem.Create(demoUser.Id, "Plan weekly priorities", "Choose the most important work for the week and block time for it.", TaskItemPriority.High, DateOnly.FromDateTime(now.UtcDateTime.AddDays(1)), now),
            TaskItem.Create(demoUser.Id, "Book dentist appointment", "Call the clinic and pick a morning slot.", TaskItemPriority.Medium, DateOnly.FromDateTime(now.UtcDateTime.AddDays(3)), now),
            TaskItem.Create(demoUser.Id, "Pay utility bills", "Review the latest bills and pay anything due this week.", TaskItemPriority.Critical, DateOnly.FromDateTime(now.UtcDateTime.AddDays(2)), now),
            TaskItem.Create(demoUser.Id, "Grocery run", "Restock breakfast items, vegetables, and coffee.", TaskItemPriority.Low, DateOnly.FromDateTime(now.UtcDateTime.AddDays(4)), now)
        };

        tasks[1].Update(
            tasks[1].Title,
            tasks[1].Description,
            TaskItemStatus.InProgress,
            tasks[1].Priority,
            tasks[1].DueDate,
            now);

        tasks[2].Update(
            tasks[2].Title,
            tasks[2].Description,
            TaskItemStatus.Blocked,
            tasks[2].Priority,
            tasks[2].DueDate,
            now);

        await dbContext.TaskItems.AddRangeAsync(tasks, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded demo account {Email} with sample tasks.", DemoEmail);
    }
}
