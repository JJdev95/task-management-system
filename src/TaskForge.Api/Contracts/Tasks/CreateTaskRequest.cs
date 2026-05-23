using TaskForge.Domain.Tasks;

namespace TaskForge.Api.Contracts.Tasks;

public sealed record CreateTaskRequest(
    string Title,
    string? Description,
    TaskItemPriority Priority,
    DateOnly? DueDate);
