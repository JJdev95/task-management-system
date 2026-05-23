using TaskForge.Application.Common.Interfaces;
using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks;
using TaskForge.Application.Tasks.Queries.GetTasks;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests;

internal sealed class FakeCurrentUserService(string userId) : ICurrentUserService
{
    public string UserId { get; } = userId;
}

internal sealed class PassthroughTaskListCache : ITaskListCache
{
    public int Invalidations { get; private set; }

    public Task<PaginatedList<TaskDto>> GetOrCreateAsync(
        string userId,
        string cacheKey,
        Func<CancellationToken, Task<PaginatedList<TaskDto>>> factory,
        CancellationToken cancellationToken)
    {
        return factory(cancellationToken);
    }

    public void InvalidateUser(string userId)
    {
        Invalidations++;
    }
}

internal sealed class FakeTaskRepository : ITaskRepository
{
    private readonly List<TaskItem> _tasks = [];

    public IReadOnlyList<TaskItem> Tasks => _tasks;

    public Task AddAsync(TaskItem taskItem, CancellationToken cancellationToken)
    {
        _tasks.Add(taskItem);
        return Task.CompletedTask;
    }

    public Task<TaskItem?> GetByIdForUserAsync(Guid id, string userId, CancellationToken cancellationToken)
    {
        return Task.FromResult(_tasks.FirstOrDefault(task => task.Id == id && task.OwnerUserId == userId && !task.IsDeleted));
    }

    public Task<PaginatedList<TaskItem>> GetForUserAsync(
        GetTasksQuery query,
        string userId,
        CancellationToken cancellationToken)
    {
        var items = _tasks
            .Where(task => task.OwnerUserId == userId && !task.IsDeleted)
            .ToArray();

        return Task.FromResult(new PaginatedList<TaskItem>(items, query.PageNumber, query.PageSize, items.Length));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(1);
    }
}
