using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskForge.Domain.Tasks;
using TaskForge.Infrastructure.Authentication;

namespace TaskForge.Infrastructure.Persistence.Configurations;

public sealed class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("TaskItems");

        builder.HasKey(task => task.Id);

        builder.Property(task => task.OwnerUserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(task => task.Title)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(task => task.Description)
            .HasMaxLength(1000);

        builder.Property(task => task.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(task => task.Priority)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(task => task.CreatedAtUtc)
            .IsRequired();

        builder.Property(task => task.UpdatedAtUtc)
            .IsRequired();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(task => task.OwnerUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(task => !task.IsDeleted);
        builder.HasIndex(task => new { task.OwnerUserId, task.Status });
        builder.HasIndex(task => new { task.OwnerUserId, task.Priority });
        builder.HasIndex(task => new { task.OwnerUserId, task.DueDate });
    }
}
