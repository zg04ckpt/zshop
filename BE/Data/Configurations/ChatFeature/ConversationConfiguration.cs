using Core.Entities.ChatFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.ChatFeature
{
    public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
    {
        public void Configure(EntityTypeBuilder<Conversation> builder)
        {
            builder.ToTable("Conversations");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.CustomerName).HasMaxLength(255);
            builder.HasIndex(x => x.UserId);
        }
    }
}
