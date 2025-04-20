using Core.Entities.PaymentFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Configurations.Payment
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");
            builder.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            builder.Property(e => e.OrderStatus).HasConversion<string>();
            builder.Property(e => e.PaymentStatus).HasConversion<string>();
            builder.Property(e => e.PaymentMethod).HasConversion<string>();
            builder.Property(e => e.AddressId).IsRequired(false);
            builder.HasOne(e => e.Customer)
                .WithMany(e => e.Orders)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);
            builder.HasOne(e => e.Address)
                .WithMany(e => e.Orders)
                .HasForeignKey(e => e.AddressId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
