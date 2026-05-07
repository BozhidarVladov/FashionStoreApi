using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VladovClothingStore.Models;
using VladovClothingStore.Dtos;
using VladovClothingStore;

namespace VladovClothingStore.Services;

public class StoreService : IStoreService
{
    private readonly ApplicationDbContext _context;

    public StoreService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClothingReadDto>> GetAllClothesAsync()
    {
        var clothes = await _context.Clothes
            .Include(c => c.Category)
            .ToListAsync();

        return clothes.Select(c => new ClothingReadDto
        {
            Id = c.Id,
            Name = c.Name,
            Price = c.Price,
            CategoryName = c.Category != null ? c.Category.name : "No Category"
        }).ToList();
    }

    public async Task<ClothingReadDto?> GetClothingByIdAsync(int id)
    {
        var item = await _context.Clothes
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (item == null) return null;

        return new ClothingReadDto
        {
            Id = item.Id,
            Name = item.Name,
            Price = item.Price,
            CategoryName = item.Category != null ? item.Category.name : "No Category"
        };
    }

    public async Task AddClothingAsync(ClothingItem item)
    {
        _context.Clothes.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateClothingAsync(ClothingItem item)
    {
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteClothingAsync(int id)
    {
        var item = await _context.Clothes.FindAsync(id);
        if (item != null)
        {
            _context.Clothes.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}