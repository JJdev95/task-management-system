using MediatR;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Commands.UpdateTask;

public sealed class UpdateTaskCommandHandler(
    ICurrentUserService currentUserService,
    ITaskRepository taskRepository,
    ITaskListCache taskListCache)
    : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    public async Task<TaskDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = await taskRepository.GetByIdForUserAsync(
            request.Id,
            currentUserService.UserId,
            cancellationToken) ?? throw new NotFoundException("Task was not found.");

        if (taskItem.Status == TaskItemStatus.Completed &&
            !taskItem.HasSameEditableDetails(request.Title, request.Description, request.Priority, request.DueDate))
        {
            throw new ConflictException("Completed tasks can only be moved to another status before editing.");
        }

        taskItem.Update(
            request.Title,
            request.Description,
            request.Status,
            request.Priority,
            request.DueDate,
            DateTimeOffset.UtcNow);

        await taskRepository.SaveChangesAsync(cancellationToken);
        taskListCache.InvalidateUser(currentUserService.UserId);

        return taskItem.ToDto();
    }
}
