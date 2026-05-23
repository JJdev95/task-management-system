using MediatR;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Commands.CreateTask;

public sealed record CreateTaskCommand(
    string Title,
    string? Description,
    TaskItemPriority Priority,
    DateOnly? DueDate)
    : IRequest<TaskDto>;
