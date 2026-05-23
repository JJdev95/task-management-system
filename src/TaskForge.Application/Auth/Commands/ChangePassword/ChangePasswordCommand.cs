using MediatR;

namespace TaskForge.Application.Auth.Commands.ChangePassword;

public sealed record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword)
    : IRequest;
