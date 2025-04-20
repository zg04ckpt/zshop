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
    public class OrderDetailConfiguration : IEntityTypeConfiguration<OrderDetail>
    {
        public void Configure(EntityTypeBuilder<OrderDetail> builder)
        {
            builder.ToTable("OrderDetails");
            builder.HasKey(x => new { x.OrderId, x.BookId });
            builder.Property(e => e.Price).HasColumnType("decimal(18,2)");
            builder.HasOne(e => e.Order)
                .WithMany(e => e.OrderDetails)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.Book)
                .WithMany(e => e.OrderDetails)
                .HasForeignKey(e => e.BookId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
