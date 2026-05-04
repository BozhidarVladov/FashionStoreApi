using Microsoft.EntityFrameworkCore;

namespace VladovClothingStore;

public class StoreService : IStoreService
{
    private readonly ApplicationDbContext _context;
    public StoreService(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<ClothingItem>> GetAllItemsAsync() => await _context.Clothes.ToListAsync();

    public async Task<ClothingItem?> GetItemByIdAsync(int id) => await _context.Clothes.FindAsync(id);
    public async Task AddItemAsync(ClothingItem item) { _context.Clothes.Add(item); await _context.SaveChangesAsync(); }
    public async Task UpdateItemAsync(ClothingItem item) 
    { 
        _context.Clothes.Update(item); 
        await _context.SaveChangesAsync(); 
    }
    public async Task DeleteItemAsync(int id) 
    { 
        var item = await _context.Clothes.FindAsync(id); 
        if (item != null) { _context.Clothes.Remove(item); await _context.SaveChangesAsync(); }
    }
}