using FluentValidation;

namespace TaskForge.Application.Tasks.Commands.UpdateTask;

public sealed class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    public UpdateTaskCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Title)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(command => command.Description)
            .MaximumLength(1000);

        RuleFor(command => command.Status)
            .IsInEnum();

        RuleFor(command => command.Priority)
            .IsInEnum();
    }
}
