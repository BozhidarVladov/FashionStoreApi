namespace VladovClothingStore;

public interface IStoreService
{
    Task<IEnumerable<ClothingItem>> GetAllItemsAsync();
    Task<ClothingItem?> GetItemByIdAsync(int id);
    Task AddItemAsync(ClothingItem item);
    Task UpdateItemAsync(ClothingItem item);
    Task DeleteItemAsync(int id);
}