using FluentAssertions;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Tasks.Commands.DeleteTask;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests.Application;

public sealed class DeleteTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_rejects_deleting_completed_task()
    {
        var repository = new FakeTaskRepository();
        var cache = new PassthroughTaskListCache();
        var completed = TaskItem.Create("user-1", "Done", null, TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        completed.Update("Done", null, TaskItemStatus.Completed, TaskItemPriority.Medium, null, DateTimeOffset.UtcNow);
        await repository.AddAsync(completed, CancellationToken.None);

        var handler = new DeleteTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, cache);

        var action = () => handler.Handle(new DeleteTaskCommand(completed.Id), CancellationToken.None);

        await action.Should().ThrowAsync<ConflictException>();
        completed.IsDeleted.Should().BeFalse();
        cache.Invalidations.Should().Be(0);
    }
}
