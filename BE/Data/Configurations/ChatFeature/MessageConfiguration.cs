using Core.Entities.ChatFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.ChatFeature
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.ToTable("Messages");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Content).HasMaxLength(1000);
            builder.Property(x => x.Type).HasConversion<string>();
            builder.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConvertsationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.ConvertsationId, x.Timestamp });
        }
    }
}
