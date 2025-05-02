using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Entities.System;
using Data.Configurations;
using Data.Configurations.BookFeature;
using Data.Configurations.Payment;
using Data.Configurations.PaymentFeature;
using Data.Configurations.System;
using Microsoft.EntityFrameworkCore;

namespace Data
{
    public class AppDbContext : DbContext
    {
        // System
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        // BookFeature
        public DbSet<Book> Books { get; set; }
        public DbSet<BookImage> BookImages { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<BookCategory> BookCategories { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewMedia> ReviewMedias { get; set; }

        // Payment
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<CancelOrderRequest> CancelOrders { get; set; }         
        public DbSet<Cart> Carts { get; set; }         
        public DbSet<CartItem> CartItems { get; set; }         

        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new AddressConfiguration());
            modelBuilder.ApplyConfiguration(new RoleConfiguration());
            modelBuilder.ApplyConfiguration(new UserRoleConfiguration());

            modelBuilder.ApplyConfiguration(new BookConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
            modelBuilder.ApplyConfiguration(new BookCategoryConfiguration());
            modelBuilder.ApplyConfiguration(new ReviewConfiguration());
            modelBuilder.ApplyConfiguration(new ReviewMediaConfiguration());

            modelBuilder.ApplyConfiguration(new OrderConfiguration());
            modelBuilder.ApplyConfiguration(new OrderDetailConfiguration());
            modelBuilder.ApplyConfiguration(new TransactionConfiguration());
            modelBuilder.ApplyConfiguration(new CancelOrderRequestConfiguration());
            modelBuilder.ApplyConfiguration(new CartConfiguration());
            modelBuilder.ApplyConfiguration(new CartItemConfiguration());
        }
    }
}
