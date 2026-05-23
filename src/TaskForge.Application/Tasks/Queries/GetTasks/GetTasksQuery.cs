using MediatR;
using TaskForge.Application.Common.Models;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Queries.GetTasks;

public sealed record GetTasksQuery(
    int PageNumber = 1,
    int PageSize = 10,
    TaskItemStatus? Status = null,
    TaskItemPriority? Priority = null,
    bool? IsCompleted = null,
    string? Search = null,
    DateOnly? DueFrom = null,
    DateOnly? DueTo = null)
    : IRequest<PaginatedList<TaskDto>>;
