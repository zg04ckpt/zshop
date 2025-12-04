using Core.Entities.VoucherFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.VoucherFeature
{
    public class VoucherUsageConfiguration : IEntityTypeConfiguration<VoucherUsage>
    {
        public void Configure(EntityTypeBuilder<VoucherUsage> builder)
        {
            builder.ToTable("VoucherUsages");
            builder.HasKey(x => new { x.OrderId, x.VoucherId });

            builder.HasOne(x => x.Voucher)
                .WithMany(v => v.Usages)
                .HasForeignKey(x => x.VoucherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Order)
                .WithMany(o => o.UsedVouchers)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
