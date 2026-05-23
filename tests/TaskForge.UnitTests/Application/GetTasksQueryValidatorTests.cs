using FluentAssertions;
using TaskForge.Application.Tasks.Queries.GetTasks;

namespace TaskForge.UnitTests.Application;

public sealed class GetTasksQueryValidatorTests
{
    [Fact]
    public void Validator_rejects_invalid_page_number_and_page_size()
    {
        var validator = new GetTasksQueryValidator();

        var result = validator.Validate(new GetTasksQuery(PageNumber: 0, PageSize: 99));

        result.IsValid.Should().BeFalse();
        result.Errors.Select(error => error.PropertyName).Should().Contain(["PageNumber", "PageSize"]);
    }

    [Fact]
    public void Validator_rejects_due_date_range_when_start_is_after_end()
    {
        var validator = new GetTasksQueryValidator();

        var result = validator.Validate(new GetTasksQuery(
            DueFrom: new DateOnly(2026, 05, 20),
            DueTo: new DateOnly(2026, 05, 19)));

        result.IsValid.Should().BeFalse();
    }
}
