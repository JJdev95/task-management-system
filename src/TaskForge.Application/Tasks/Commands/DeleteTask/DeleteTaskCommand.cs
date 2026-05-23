using MediatR;

namespace TaskForge.Application.Tasks.Commands.DeleteTask;

public sealed record DeleteTaskCommand(Guid Id) : IRequest;
