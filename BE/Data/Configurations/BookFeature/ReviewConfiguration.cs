using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.BookFeature
{
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.ToTable("Reviews");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Content).HasMaxLength(200);
            builder.HasOne(x => x.Book)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Reviewer)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.ReviewerId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
