using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks.Queries.GetTasks;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Common.Interfaces;

public interface ITaskRepository
{
    Task AddAsync(TaskItem taskItem, CancellationToken cancellationToken);
    Task<TaskItem?> GetByIdForUserAsync(Guid id, string userId, CancellationToken cancellationToken);
    Task<PaginatedList<TaskItem>> GetForUserAsync(GetTasksQuery query, string userId, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
