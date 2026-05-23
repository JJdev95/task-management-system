using Carter;
using MediatR;
using TaskForge.Api.Contracts.Auth;
using TaskForge.Application.Auth;
using TaskForge.Application.Auth.Commands.ChangePassword;
using TaskForge.Application.Auth.Commands.Login;
using TaskForge.Application.Auth.Commands.RefreshToken;
using TaskForge.Application.Auth.Commands.SignOut;
using TaskForge.Application.Auth.Commands.SignUp;
using TaskForge.Application.Auth.Queries.GetCurrentUser;

namespace TaskForge.Api.Modules;

public sealed class AuthModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/signup", async (SignUpRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var user = await sender.Send(new SignUpCommand(request.Email, request.Password), cancellationToken);
                return Results.Created($"/api/auth/users/{user.Id}", user);
            })
            .AllowAnonymous()
            .WithName("SignUp")
            .WithSummary("Create a new TaskForge user account.")
            .Produces<AuthUserDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem();

        group.MapPost("/login", async (LoginRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(new LoginCommand(request.Email, request.Password), cancellationToken);
                return Results.Empty;
            })
            .AllowAnonymous()
            .WithName("Login")
            .WithSummary("Sign in and issue an Identity bearer access token plus refresh token.")
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();

        group.MapPost("/refresh", async (RefreshTokenRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(new RefreshTokenCommand(request.RefreshToken), cancellationToken);
                return Results.Empty;
            })
            .AllowAnonymous()
            .WithName("RefreshToken")
            .WithSummary("Exchange a valid refresh token for a new bearer token pair.")
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();

        group.MapGet("/me", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var user = await sender.Send(new GetCurrentUserQuery(), cancellationToken);
                return Results.Ok(user);
            })
            .RequireAuthorization()
            .WithName("GetCurrentUser")
            .WithSummary("Return the currently authenticated user's id and email.")
            .Produces<AuthUserDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPost("/signout", async (ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(new SignOutCommand(), cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithName("SignOut")
            .WithSummary("Sign out the current user.")
            .WithDescription("For bearer-token clients such as React, sign-out is completed on the client by discarding the stored access and refresh tokens. This endpoint clears server sign-in state when present, but clients should not reuse old tokens after calling it.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPost("/change-password", async (
                ChangePasswordRequest request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new ChangePasswordCommand(request.CurrentPassword, request.NewPassword), cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithName("ChangePassword")
            .WithSummary("Change the password for the currently authenticated user.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
