using FluentAssertions;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Tasks.Commands.UpdateTask;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests.Application;

public sealed class UpdateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_updates_only_task_owned_by_current_user()
    {
        var repository = new FakeTaskRepository();
        var cache = new PassthroughTaskListCache();
        var owned = TaskItem.Create("user-1", "Old", null, TaskItemPriority.Low, null, DateTimeOffset.UtcNow);
        await repository.AddAsync(owned, CancellationToken.None);

        var handler = new UpdateTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, cache);

        var result = await handler.Handle(
            new UpdateTaskCommand(owned.Id, "New", "Updated", TaskItemStatus.InProgress, TaskItemPriority.High, null),
            CancellationToken.None);

        result.Title.Should().Be("New");
        result.Status.Should().Be(TaskItemStatus.InProgress);
        cache.Invalidations.Should().Be(1);
    }

    [Fact]
    public async Task Handle_returns_not_found_for_another_users_task()
    {
        var repository = new FakeTaskRepository();
        var task = TaskItem.Create("other-user", "Private", null, TaskItemPriority.Low, null, DateTimeOffset.UtcNow);
        await repository.AddAsync(task, CancellationToken.None);
        var handler = new UpdateTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, new PassthroughTaskListCache());

        var action = () => handler.Handle(
            new UpdateTaskCommand(task.Id, "Hack", null, TaskItemStatus.Todo, TaskItemPriority.Low, null),
            CancellationToken.None);

        await action.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_rejects_editing_completed_task_details()
    {
        var repository = new FakeTaskRepository();
        var cache = new PassthroughTaskListCache();
        var completed = TaskItem.Create("user-1", "Done", "Finished", TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        completed.Update("Done", "Finished", TaskItemStatus.Completed, TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        await repository.AddAsync(completed, CancellationToken.None);

        var handler = new UpdateTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, cache);

        var action = () => handler.Handle(
            new UpdateTaskCommand(completed.Id, "Done", "Changed", TaskItemStatus.Completed, TaskItemPriority.Medium, null),
            CancellationToken.None);

        await action.Should().ThrowAsync<ConflictException>();
        cache.Invalidations.Should().Be(0);
    }

    [Fact]
    public async Task Handle_allows_completed_task_status_change_when_details_are_unchanged()
    {
        var repository = new FakeTaskRepository();
        var cache = new PassthroughTaskListCache();
        var completed = TaskItem.Create("user-1", "Done", "Finished", TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        completed.Update("Done", "Finished", TaskItemStatus.Completed, TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        await repository.AddAsync(completed, CancellationToken.None);

        var handler = new UpdateTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, cache);

        var result = await handler.Handle(
            new UpdateTaskCommand(completed.Id, "Done", "Finished", TaskItemStatus.InProgress, TaskItemPriority.Medium, null),
            CancellationToken.None);

        result.Status.Should().Be(TaskItemStatus.InProgress);
        cache.Invalidations.Should().Be(1);
    }
}
