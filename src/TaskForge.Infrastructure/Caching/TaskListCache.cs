using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks;

namespace TaskForge.Infrastructure.Caching;

public sealed class TaskListCache(IMemoryCache memoryCache) : ITaskListCache
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _keysByUser = new();

    public async Task<PaginatedList<TaskDto>> GetOrCreateAsync(
        string userId,
        string cacheKey,
        Func<CancellationToken, Task<PaginatedList<TaskDto>>> factory,
        CancellationToken cancellationToken)
    {
        if (memoryCache.TryGetValue(cacheKey, out PaginatedList<TaskDto>? cached) && cached is not null)
        {
            return cached;
        }

        var result = await factory(cancellationToken);
        memoryCache.Set(cacheKey, result, CacheDuration);

        var userKeys = _keysByUser.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        userKeys.TryAdd(cacheKey, 0);

        return result;
    }

    public void InvalidateUser(string userId)
    {
        if (!_keysByUser.TryRemove(userId, out var keys))
        {
            return;
        }

        foreach (var key in keys.Keys)
        {
            memoryCache.Remove(key);
        }
    }
}
