using TaskForge.Domain.Common;
using TaskForge.Domain.Exceptions;

namespace TaskForge.Domain.Tasks;

public sealed class TaskItem : Entity
{
    private TaskItem()
    {
    }

    private TaskItem(
        string ownerUserId,
        string title,
        string? description,
        TaskItemPriority priority,
        DateOnly? dueDate,
        DateTimeOffset createdAtUtc)
    {
        OwnerUserId = Require(ownerUserId, nameof(ownerUserId));
        Title = Require(title, nameof(title));
        Description = NormalizeOptional(description);
        Priority = priority;
        DueDate = dueDate;
        Status = TaskItemStatus.Todo;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = createdAtUtc;
    }

    public string OwnerUserId { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TaskItemStatus Status { get; private set; }
    public TaskItemPriority Priority { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public DateTimeOffset? DeletedAtUtc { get; private set; }
    public bool IsDeleted { get; private set; }

    public static TaskItem Create(
        string ownerUserId,
        string title,
        string? description,
        TaskItemPriority priority,
        DateOnly? dueDate,
        DateTimeOffset createdAtUtc)
    {
        return new TaskItem(ownerUserId, title, description, priority, dueDate, createdAtUtc);
    }

    public void Update(
        string title,
        string? description,
        TaskItemStatus status,
        TaskItemPriority priority,
        DateOnly? dueDate,
        DateTimeOffset updatedAtUtc)
    {
        Title = Require(title, nameof(title));
        Description = NormalizeOptional(description);
        Status = status;
        Priority = priority;
        DueDate = dueDate;
        UpdatedAtUtc = updatedAtUtc;
    }

    public bool HasSameEditableDetails(
        string title,
        string? description,
        TaskItemPriority priority,
        DateOnly? dueDate)
    {
        return Title == Require(title, nameof(title)) &&
            Description == NormalizeOptional(description) &&
            Priority == priority &&
            DueDate == dueDate;
    }

    public void SoftDelete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        IsDeleted = true;
        DeletedAtUtc = deletedAtUtc;
        UpdatedAtUtc = deletedAtUtc;
    }

    private static string Require(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{parameterName} is required.");
        }

        return value.Trim();
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
