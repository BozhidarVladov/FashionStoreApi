using FashionStoreApi.Models;

namespace FashionStoreApi.Services
{
    public interface IStoreService
    {
        List<ClothingItem> GetAll();
        ClothingItem GetById(int id);
        void Add(ClothingItem item);
        bool Delete(int id);
    }
}