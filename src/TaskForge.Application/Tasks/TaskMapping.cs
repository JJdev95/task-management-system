using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks;

public static class TaskMapping
{
    public static TaskDto ToDto(this TaskItem taskItem)
    {
        return new TaskDto(
            taskItem.Id,
            taskItem.Title,
            taskItem.Description,
            taskItem.Status,
            taskItem.Priority,
            taskItem.DueDate,
            taskItem.CreatedAtUtc,
            taskItem.UpdatedAtUtc);
    }
}
