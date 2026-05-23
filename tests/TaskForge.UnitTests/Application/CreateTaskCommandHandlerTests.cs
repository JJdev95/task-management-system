using FluentAssertions;
using TaskForge.Application.Tasks.Commands.CreateTask;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests.Application;

public sealed class CreateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_creates_task_for_current_user_and_invalidates_cache()
    {
        var repository = new FakeTaskRepository();
        var cache = new PassthroughTaskListCache();
        var handler = new CreateTaskCommandHandler(new FakeCurrentUserService("user-1"), repository, cache);

        var result = await handler.Handle(
            new CreateTaskCommand("Ship API", "Finish backend", TaskItemPriority.Critical, null),
            CancellationToken.None);

        result.Title.Should().Be("Ship API");
        repository.Tasks.Should().ContainSingle(task => task.OwnerUserId == "user-1");
        cache.Invalidations.Should().Be(1);
    }
}
