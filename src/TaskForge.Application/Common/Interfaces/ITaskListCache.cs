using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks;

namespace TaskForge.Application.Common.Interfaces;

public interface ITaskListCache
{
    Task<PaginatedList<TaskDto>> GetOrCreateAsync(
        string userId,
        string cacheKey,
        Func<CancellationToken, Task<PaginatedList<TaskDto>>> factory,
        CancellationToken cancellationToken);

    void InvalidateUser(string userId);
}
