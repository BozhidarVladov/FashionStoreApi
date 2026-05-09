using Microsoft.EntityFrameworkCore;
using VladovClothingStore.Models;

namespace VladovClothingStore;

public class ApplicationDbContext : DbContext
{
    public DbSet<Category> Categories { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    public DbSet<ClothingItem> Clothes { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<User> Users { get; set; }
}