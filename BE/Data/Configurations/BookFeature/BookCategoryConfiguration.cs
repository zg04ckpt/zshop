using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Configurations.BookFeature
{
    public class BookCategoryConfiguration : IEntityTypeConfiguration<BookCategory>
    {
        public void Configure(EntityTypeBuilder<BookCategory> builder)
        {
            builder.ToTable("BookCategories");
            builder.HasKey(x => new { x.CategoryId, x.BookId });
            builder.HasOne(x => x.Category)
                .WithMany(x => x.BookCategories)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Book)
                .WithMany(x => x.BookCategories)
                .HasForeignKey(x => x.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
