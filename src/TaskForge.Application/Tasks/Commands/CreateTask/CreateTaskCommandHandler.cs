using MediatR;
using TaskForge.Application.Common.Interfaces;
using TaskForge.Domain.Tasks;

namespace TaskForge.Application.Tasks.Commands.CreateTask;

public sealed class CreateTaskCommandHandler(
    ICurrentUserService currentUserService,
    ITaskRepository taskRepository,
    ITaskListCache taskListCache)
    : IRequestHandler<CreateTaskCommand, TaskDto>
{
    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var taskItem = TaskItem.Create(
            currentUserService.UserId,
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            now);

        await taskRepository.AddAsync(taskItem, cancellationToken);
        await taskRepository.SaveChangesAsync(cancellationToken);
        taskListCache.InvalidateUser(currentUserService.UserId);

        return taskItem.ToDto();
    }
}
