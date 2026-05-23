using FluentValidation;

namespace TaskForge.Application.Tasks.Queries.GetTasks;

public sealed class GetTasksQueryValidator : AbstractValidator<GetTasksQuery>
{
    public GetTasksQueryValidator()
    {
        RuleFor(query => query.PageNumber)
            .GreaterThanOrEqualTo(1);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, 50);

        RuleFor(query => query.Status)
            .IsInEnum()
            .When(query => query.Status.HasValue);

        RuleFor(query => query.Priority)
            .IsInEnum()
            .When(query => query.Priority.HasValue);

        RuleFor(query => query.Search)
            .MaximumLength(120);

        RuleFor(query => query)
            .Must(query => query.DueFrom is null || query.DueTo is null || query.DueFrom <= query.DueTo)
            .WithMessage("DueFrom must be earlier than or equal to DueTo.");
    }
}
