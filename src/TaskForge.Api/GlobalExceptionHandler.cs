using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TaskForge.Application.Common.Exceptions;
using TaskForge.Domain.Exceptions;

namespace TaskForge.Api;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IHostEnvironment environment)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails = CreateProblemDetails(httpContext, exception);

        if (problemDetails.Status >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled request exception.");
        }
        else
        {
            logger.LogWarning(exception, "Handled request exception.");
        }

        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private ProblemDetails CreateProblemDetails(HttpContext httpContext, Exception exception)
    {
        return exception switch
        {
            ApplicationValidationException validationException => new HttpValidationProblemDetails(validationException.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = BuildValidationDetail(validationException.Errors),
                Instance = httpContext.Request.Path
            },
            UnauthorizedException => Create(
                httpContext,
                StatusCodes.Status401Unauthorized,
                "Authentication failed",
                exception.Message),
            ForbiddenException => Create(
                httpContext,
                StatusCodes.Status403Forbidden,
                "Access denied",
                exception.Message),
            NotFoundException => Create(
                httpContext,
                StatusCodes.Status404NotFound,
                "Resource not found",
                exception.Message),
            ConflictException => Create(
                httpContext,
                StatusCodes.Status409Conflict,
                "Request conflict",
                exception.Message),
            DomainException => Create(
                httpContext,
                StatusCodes.Status400BadRequest,
                "Invalid request",
                exception.Message),
            _ => Create(
                httpContext,
                StatusCodes.Status500InternalServerError,
                "Unexpected server error",
                environment.IsDevelopment() ? exception.Message : "Something went wrong while processing the request.")
        };
    }

    private static string BuildValidationDetail(IReadOnlyDictionary<string, string[]> errors)
    {
        var messages = errors
            .SelectMany(error => error.Value)
            .Where(message => !string.IsNullOrWhiteSpace(message))
            .Distinct()
            .ToArray();

        return messages.Length == 0
            ? "Please correct the highlighted fields and try again."
            : string.Join(" ", messages);
    }

    private static ProblemDetails Create(
        HttpContext httpContext,
        int status,
        string title,
        string detail)
    {
        return new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };
    }
}
