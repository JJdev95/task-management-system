using TaskForge.Domain.Tasks;

namespace TaskForge.Api.Contracts.Tasks;

public sealed record UpdateTaskRequest(
    string Title,
    string? Description,
    TaskItemStatus Status,
    TaskItemPriority Priority,
    DateOnly? DueDate);
