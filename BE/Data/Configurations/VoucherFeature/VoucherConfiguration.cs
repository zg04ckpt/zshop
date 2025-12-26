using Core.Entities.VoucherFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.VoucherFeature
{
    public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.ToTable("Vouchers");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(100);
            builder.Property(x => x.Code).HasMaxLength(50);
            builder.Property(x => x.DiscountType).HasConversion<string>();
            builder.Property(x => x.Discount).HasColumnType("decimal(18,2)");
            builder.Property(x => x.MaxDiscount).HasColumnType("decimal(18,2)");

            builder.HasMany(v => v.AppliedOrders)
                .WithOne(o => o.Voucher)
                .HasForeignKey(o => o.VoucherId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
