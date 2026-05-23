using System.Diagnostics;

namespace TaskForge.IntegrationTests;

public sealed class DockerRequiredFactAttribute : FactAttribute
{
    private static readonly Lazy<bool> DockerAvailable = new(IsDockerAvailable);

    public DockerRequiredFactAttribute()
    {
        if (!DockerAvailable.Value)
        {
            Skip = "Docker is not available; Testcontainers integration test skipped.";
        }
    }

    private static bool IsDockerAvailable()
    {
        try
        {
            using var process = Process.Start(new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = "version --format \"{{.Server.Version}}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            });

            if (process is null)
            {
                return false;
            }

            if (process.WaitForExit(3000))
            {
                return process.ExitCode == 0;
            }

            process.Kill(entireProcessTree: true);
            return false;
        }
        catch
        {
            return false;
        }
    }
}
