using Microsoft.EntityFrameworkCore;

namespace VladovClothingStore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    public DbSet<ClothingItem> Clothes { get; set; }
}