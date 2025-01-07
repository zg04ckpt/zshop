using Data.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.FirstName).HasMaxLength(20);
            builder.Property(x => x.LastName).HasMaxLength(50);
            builder.Property(x => x.PhoneNumber).IsRequired(false);

            builder.HasOne(x => x.Gender)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.GenderId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
