using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.BookFeature
{
    public class ReviewMediaConfiguration : IEntityTypeConfiguration<ReviewMedia>
    {
        public void Configure(EntityTypeBuilder<ReviewMedia> builder)
        {
            builder.ToTable("ReviewMedias");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.MediaType).HasConversion<string>();
            builder.HasOne(x => x.Review)
                .WithMany(x => x.ReviewMedias)
                .HasForeignKey(x => x.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
