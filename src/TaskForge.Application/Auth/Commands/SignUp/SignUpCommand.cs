using MediatR;
using TaskForge.Application.Auth;

namespace TaskForge.Application.Auth.Commands.SignUp;

public sealed record SignUpCommand(string Email, string Password) : IRequest<AuthUserDto>;
