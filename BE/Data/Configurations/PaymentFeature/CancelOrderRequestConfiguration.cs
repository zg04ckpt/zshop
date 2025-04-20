using Core.Entities.PaymentFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Configurations.PaymentFeature
{
    public class CancelOrderRequestConfiguration : IEntityTypeConfiguration<CancelOrderRequest>
    {
        public void Configure(EntityTypeBuilder<CancelOrderRequest> builder)
        {
            builder.ToTable("CancelOrderRequests");
            builder.HasKey(x => x.Id);
            builder.HasOne(x => x.Order)
                .WithMany(x => x.CancelOrderRequests)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
