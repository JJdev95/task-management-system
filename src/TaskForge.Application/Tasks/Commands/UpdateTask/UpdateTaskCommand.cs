using MediatR;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Commands.UpdateTask;

public sealed record UpdateTaskCommand(
    Guid Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    TaskItemPriority Priority,
    DateOnly? DueDate)
    : IRequest<TaskDto>;
