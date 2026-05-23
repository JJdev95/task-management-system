using MediatR;

namespace TaskForge.Application.Auth.Queries.GetCurrentUser;

public sealed record GetCurrentUserQuery : IRequest<AuthUserDto>;
