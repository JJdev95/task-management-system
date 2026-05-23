using Carter;
using MediatR;
using TaskForge.Api.Contracts.Tasks;
using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks;
using TaskForge.Application.Tasks.Commands.CreateTask;
using TaskForge.Application.Tasks.Commands.DeleteTask;
using TaskForge.Application.Tasks.Commands.UpdateTask;
using TaskForge.Application.Tasks.Queries.GetTaskById;
using TaskForge.Application.Tasks.Queries.GetTasks;
using TaskForge.Domain.Tasks;

namespace TaskForge.Api.Modules;

public sealed class TasksModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tasks")
            .RequireAuthorization()
            .WithTags("Tasks");

        group.MapGet("", async (
                int? pageNumber,
                int? pageSize,
                TaskItemStatus? status,
                TaskItemPriority? priority,
                bool? isCompleted,
                string? search,
                DateOnly? dueFrom,
                DateOnly? dueTo,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new GetTasksQuery(
                    pageNumber.GetValueOrDefault(1),
                    pageSize.GetValueOrDefault(10),
                    status,
                    priority,
                    isCompleted,
                    search,
                    dueFrom,
                    dueTo);

                var result = await sender.Send(query, cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetTasks")
            .WithSummary("List the current user's tasks with pagination, filtering, search, and default priority/due-date ordering.")
            .Produces<PaginatedList<TaskDto>>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem()
            ;

        group.MapGet("/{id:guid}", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var task = await sender.Send(new GetTaskByIdQuery(id), cancellationToken);
                return Results.Ok(task);
            })
            .WithName("GetTaskById")
            .WithSummary("Get one task owned by the current user.")
            .Produces<TaskDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            ;

        group.MapPost("", async (
                CreateTaskRequest request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var task = await sender.Send(
                    new CreateTaskCommand(request.Title, request.Description, request.Priority, request.DueDate),
                    cancellationToken);

                return Results.Created($"/api/tasks/{task.Id}", task);
            })
            .WithName("CreateTask")
            .WithSummary("Create a task owned by the current user.")
            .Produces<TaskDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem()
            ;

        group.MapPut("/{id:guid}", async (
                Guid id,
                UpdateTaskRequest request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var task = await sender.Send(
                    new UpdateTaskCommand(id, request.Title, request.Description, request.Status, request.Priority, request.DueDate),
                    cancellationToken);

                return Results.Ok(task);
            })
            .WithName("UpdateTask")
            .WithSummary("Update one of the current user's tasks.")
            .Produces<TaskDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesValidationProblem()
            ;

        group.MapDelete("/{id:guid}", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new DeleteTaskCommand(id), cancellationToken);
                return Results.NoContent();
            })
            .WithName("DeleteTask")
            .WithSummary("Soft-delete one of the current user's tasks.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            ;
    }
}
