using FluentValidation;

namespace TaskForge.Application.Tasks.Queries.GetTaskById;

public sealed class GetTaskByIdQueryValidator : AbstractValidator<GetTaskByIdQuery>
{
    public GetTaskByIdQueryValidator()
    {
        RuleFor(query => query.Id)
            .NotEmpty();
    }
}
