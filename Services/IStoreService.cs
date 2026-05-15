using System.Collections.Generic;
using System.Threading.Tasks;
using VladovClothingStore.Models;
using VladovClothingStore.Dtos;

namespace VladovClothingStore.Services{
public interface IStoreService
{
    Task <List<ClothingReadDto>> GetAllClothesAsync();
    Task<ClothingReadDto?> GetClothingByIdAsync(int id);

    Task AddClothingAsync(ClothingItem item);
    Task UpdateClothingAsync(ClothingItem item);
    Task DeleteClothingAsync(int id);
}
}