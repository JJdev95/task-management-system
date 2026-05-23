using MediatR;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Application.Common.Models;

namespace TaskForge.Application.Tasks.Queries.GetTasks;

public sealed class GetTasksQueryHandler(
    ICurrentUserService currentUserService,
    ITaskRepository taskRepository,
    ITaskListCache taskListCache)
    : IRequestHandler<GetTasksQuery, PaginatedList<TaskDto>>
{
    public async Task<PaginatedList<TaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = BuildCacheKey(currentUserService.UserId, request);

        return await taskListCache.GetOrCreateAsync(
            currentUserService.UserId,
            cacheKey,
            async token =>
            {
                var page = await taskRepository.GetForUserAsync(request, currentUserService.UserId, token);
                return new PaginatedList<TaskDto>(
                    [.. page.Items.Select(task => task.ToDto())],
                    page.PageNumber,
                    page.PageSize,
                    page.TotalCount);
            },
            cancellationToken);
    }

    private static string BuildCacheKey(string userId, GetTasksQuery query)
    {
        return string.Join(
            '|',
            userId,
            query.PageNumber,
            query.PageSize,
            query.Status,
            query.Priority,
            query.IsCompleted,
            query.Search?.Trim().ToUpperInvariant(),
            query.DueFrom,
            query.DueTo);
    }
}
