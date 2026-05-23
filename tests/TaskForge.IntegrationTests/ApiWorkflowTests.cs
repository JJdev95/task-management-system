using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using TaskForge.Application.Auth;
using TaskForge.Application.Common.Models;
using TaskForge.Application.Tasks;
using TaskForge.Domain.Tasks;

namespace TaskForge.IntegrationTests;

public sealed class ApiWorkflowTests(TaskForgeApiFactory factory) : IClassFixture<TaskForgeApiFactory>
{
    [DockerRequiredFact]
    public async Task Protected_tasks_endpoint_rejects_anonymous_users()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [DockerRequiredFact]
    public async Task User_can_signup_login_create_filter_refresh_change_password_and_signout()
    {
        var client = factory.CreateClient();
        var email = $"user-{Guid.NewGuid():N}@taskforge.local";
        const string password = "TaskForge123";

        var signUpResponse = await client.PostAsJsonAsync("/api/auth/signup", new
        {
            email,
            password
        });

        signUpResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdUser = await signUpResponse.Content.ReadFromJsonAsync<AuthUserDto>();
        createdUser!.Email.Should().Be(email);

        var token = await LoginAsync(client, email, password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

        var currentUser = await client.GetFromJsonAsync<AuthUserDto>("/api/auth/me");
        currentUser!.Id.Should().NotBeNullOrWhiteSpace();
        currentUser.Email.Should().Be(email);

        var createResponse = await client.PostAsJsonAsync("/api/tasks", new
        {
            title = "Finish TaskForge",
            description = "Exercise the task API.",
            priority = TaskItemPriority.Critical,
            dueDate = "2026-05-21"
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();
        createdTask!.Title.Should().Be("Finish TaskForge");

        var taskDetail = await client.GetFromJsonAsync<TaskDto>($"/api/tasks/{createdTask.Id}");
        taskDetail!.Id.Should().Be(createdTask.Id);
        taskDetail.Title.Should().Be(createdTask.Title);

        var list = await client.GetFromJsonAsync<PaginatedList<TaskDto>>("/api/tasks?pageNumber=1&pageSize=10&priority=Critical&search=TaskForge");
        list!.Items.Should().ContainSingle(task => task.Id == createdTask.Id);

        var refreshResponse = await client.PostAsJsonAsync("/api/auth/refresh", new
        {
            refreshToken = token.RefreshToken
        });
        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var changePasswordResponse = await client.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = password,
            newPassword = "TaskForge124"
        });
        changePasswordResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var signOutResponse = await client.PostAsync("/api/auth/signout", content: null);
        signOutResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [DockerRequiredFact]
    public async Task User_cannot_delete_another_users_task()
    {
        var owner = factory.CreateClient();
        var ownerToken = await SignUpAndLoginAsync(owner);
        owner.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerToken.AccessToken);

        var createResponse = await owner.PostAsJsonAsync("/api/tasks", new
        {
            title = "Private task",
            description = "Only the owner can delete this.",
            priority = TaskItemPriority.High
        });

        var task = await createResponse.Content.ReadFromJsonAsync<TaskDto>();

        var intruder = factory.CreateClient();
        var intruderToken = await SignUpAndLoginAsync(intruder);
        intruder.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", intruderToken.AccessToken);

        var detailResponse = await intruder.GetAsync($"/api/tasks/{task!.Id}");
        detailResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var deleteResponse = await intruder.DeleteAsync($"/api/tasks/{task!.Id}");

        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private static async Task<TokenResponse> SignUpAndLoginAsync(HttpClient client)
    {
        var email = $"user-{Guid.NewGuid():N}@taskforge.local";
        const string password = "TaskForge123";

        var signUpResponse = await client.PostAsJsonAsync("/api/auth/signup", new
        {
            email,
            password
        });

        signUpResponse.EnsureSuccessStatusCode();
        return await LoginAsync(client, email, password);
    }

    private static async Task<TokenResponse> LoginAsync(HttpClient client, string email, string password)
    {
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        await using var stream = await loginResponse.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return new TokenResponse(
            document.RootElement.GetProperty("accessToken").GetString()!,
            document.RootElement.GetProperty("refreshToken").GetString()!);
    }

    private sealed record TokenResponse(string AccessToken, string RefreshToken);
}
