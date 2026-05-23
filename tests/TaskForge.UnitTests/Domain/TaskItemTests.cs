using FluentAssertions;
using TaskForge.Domain.Exceptions;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests.Domain;

public sealed class TaskItemTests
{
    [Fact]
    public void Create_normalizes_required_and_optional_text()
    {
        var now = DateTimeOffset.UtcNow;

        var task = TaskItem.Create("user-1", "  Write tests  ", "  Important coverage  ", TaskItemPriority.High, null, now);

        task.Title.Should().Be("Write tests");
        task.Description.Should().Be("Important coverage");
        task.Status.Should().Be(TaskItemStatus.Todo);
        task.CreatedAtUtc.Should().Be(now);
    }

    [Fact]
    public void Create_rejects_blank_title()
    {
        var action = () => TaskItem.Create("user-1", " ", null, TaskItemPriority.Low, null, DateTimeOffset.UtcNow);

        action.Should().Throw<DomainException>();
    }

    [Fact]
    public void SoftDelete_marks_task_deleted_once()
    {
        var task = TaskItem.Create("user-1", "Task", null, TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        var deletedAt = DateTimeOffset.UtcNow.AddMinutes(5);

        task.SoftDelete(deletedAt);
        task.SoftDelete(deletedAt.AddMinutes(5));

        task.IsDeleted.Should().BeTrue();
        task.DeletedAtUtc.Should().Be(deletedAt);
    }

    [Fact]
    public void HasSameEditableDetails_normalizes_text_before_comparison()
    {
        var task = TaskItem.Create("user-1", "  Task  ", "  Notes  ", TaskItemPriority.High, null, DateTimeOffset.UtcNow);

        task.HasSameEditableDetails("Task", "Notes", TaskItemPriority.High, null).Should().BeTrue();
        task.HasSameEditableDetails("Task", "Different", TaskItemPriority.High, null).Should().BeFalse();
    }
}
