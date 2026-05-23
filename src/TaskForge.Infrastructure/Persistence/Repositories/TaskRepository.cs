using Microsoft.EntityFrameworkCore;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks.Queries.GetTasks;
using TaskForge.Domain.Tasks;

namespace TaskForge.Infrastructure.Persistence.Repositories;

public sealed class TaskRepository(ApplicationDbContext dbContext) : ITaskRepository
{
    public async Task AddAsync(TaskItem taskItem, CancellationToken cancellationToken)
    {
        await dbContext.TaskItems.AddAsync(taskItem, cancellationToken);
    }

    public async Task<TaskItem?> GetByIdForUserAsync(
        Guid id,
        string userId,
        CancellationToken cancellationToken)
    {
        return await dbContext.TaskItems
            .FirstOrDefaultAsync(task => task.Id == id && task.OwnerUserId == userId, cancellationToken);
    }

    public async Task<PaginatedList<TaskItem>> GetForUserAsync(
        GetTasksQuery query,
        string userId,
        CancellationToken cancellationToken)
    {
        var taskQuery = dbContext.TaskItems
            .AsNoTracking()
            .Where(task => task.OwnerUserId == userId);

        if (query.Status.HasValue)
        {
            taskQuery = taskQuery.Where(task => task.Status == query.Status);
        }

        if (query.Priority.HasValue)
        {
            taskQuery = taskQuery.Where(task => task.Priority == query.Priority);
        }

        if (query.IsCompleted.HasValue)
        {
            taskQuery = query.IsCompleted.Value
                ? taskQuery.Where(task => task.Status == TaskItemStatus.Completed)
                : taskQuery.Where(task => task.Status != TaskItemStatus.Completed);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            taskQuery = taskQuery.Where(task =>
                task.Title.Contains(search) ||
                (task.Description != null && task.Description.Contains(search)));
        }

        if (query.DueFrom.HasValue)
        {
            taskQuery = taskQuery.Where(task => task.DueDate >= query.DueFrom);
        }

        if (query.DueTo.HasValue)
        {
            taskQuery = taskQuery.Where(task => task.DueDate <= query.DueTo);
        }

        var totalCount = await taskQuery.CountAsync(cancellationToken);
        var orderedQuery = ApplyDefaultOrdering(taskQuery);

        var items = await orderedQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedList<TaskItem>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<TaskItem> ApplyDefaultOrdering(IQueryable<TaskItem> query)
    {
        return query
            .OrderByDescending(task => task.Priority)
            .ThenBy(task => task.DueDate == null)
            .ThenBy(task => task.DueDate)
            .ThenByDescending(task => task.UpdatedAtUtc);
    }
}
