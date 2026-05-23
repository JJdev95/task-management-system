using MediatR;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Commands.DeleteTask;

public sealed class DeleteTaskCommandHandler(
    ICurrentUserService currentUserService,
    ITaskRepository taskRepository,
    ITaskListCache taskListCache)
    : IRequestHandler<DeleteTaskCommand>
{
    public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = await taskRepository.GetByIdForUserAsync(
            request.Id,
            currentUserService.UserId,
            cancellationToken) ?? throw new NotFoundException("Task was not found.");

        if (taskItem.Status == TaskItemStatus.Completed)
        {
            throw new ConflictException("Completed tasks can only be moved to another status before deletion.");
        }

        taskItem.SoftDelete(DateTimeOffset.UtcNow);
        await taskRepository.SaveChangesAsync(cancellationToken);
        taskListCache.InvalidateUser(currentUserService.UserId);
    }
}
