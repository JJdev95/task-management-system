using MediatR;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Application.Common.Interfaces;

namespace TaskForge.Application.Tasks.Queries.GetTaskById;

public sealed class GetTaskByIdQueryHandler(
    ICurrentUserService currentUserService,
    ITaskRepository taskRepository)
    : IRequestHandler<GetTaskByIdQuery, TaskDto>
{
    public async Task<TaskDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var taskItem = await taskRepository.GetByIdForUserAsync(
            request.Id,
            currentUserService.UserId,
            cancellationToken);

        if (taskItem is null)
        {
            throw new NotFoundException("Task was not found.");
        }

        return taskItem.ToDto();
    }
}
