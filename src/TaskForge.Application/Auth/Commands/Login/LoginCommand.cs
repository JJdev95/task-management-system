using MediatR;

namespace TaskForge.Application.Auth.Commands.Login;

public sealed record LoginCommand(string Email, string Password) : IRequest;
