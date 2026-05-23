using FluentAssertions;
using TaskForge.Application.Auth.Commands.SignUp;
using TaskForge.Application.Tasks.Commands.CreateTask;
using TaskForge.Application.Tasks.Commands.UpdateTask;
using TaskForge.Domain.Tasks;

namespace TaskForge.UnitTests.Application;

public sealed class TaskCommandValidatorTests
{
    [Fact]
    public void CreateTask_validator_rejects_blank_title()
    {
        var validator = new CreateTaskCommandValidator();

        var result = validator.Validate(new CreateTaskCommand("", null, TaskItemPriority.High, null));

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void UpdateTask_validator_rejects_empty_id()
    {
        var validator = new UpdateTaskCommandValidator();

        var result = validator.Validate(new UpdateTaskCommand(Guid.Empty, "Task", null, TaskItemStatus.Todo, TaskItemPriority.Low, null));

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void SignUp_validator_requires_strong_email_and_password()
    {
        var validator = new SignUpCommandValidator();

        var result = validator.Validate(new SignUpCommand("not-email", "weak"));

        result.IsValid.Should().BeFalse();
    }
}
