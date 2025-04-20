using Core.Entities.PaymentFeature;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations.PaymentFeature
{
    public class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Carts");
            builder.HasKey(e => e.Id);

            builder.HasOne(e => e.User)
                .WithOne(e => e.Cart)
                .HasForeignKey<Cart>(e => e.UserId);
        }
    }
}
