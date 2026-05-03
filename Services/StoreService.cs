using FashionStoreApi.Models;

namespace FashionStoreApi.Services
{
    public class StoreService : IStoreService
    {
        private List<ClothingItem> _items = new List<ClothingItem>
        {
            new ClothingItem { Id = 1, Name = "Черна Тениска", Category = "Тениски", Price = 25.00, StockQuantity = 50 },
            new ClothingItem { Id = 2, Name = "Дънково Яке", Category = "Якета", Price = 85.50, StockQuantity = 12 }
        };

        public List<ClothingItem> GetAll() => _items;

        public ClothingItem GetById(int id) => _items.FirstOrDefault(i => i.Id == id);

        public void Add(ClothingItem item) 
        {
            item.Id = _items.Any() ? _items.Max(i => i.Id) + 1 : 1;
            _items.Add(item);
        }

        public bool Delete(int id)
        {
            var item = GetById(id);
            if (item == null) return false;
            _items.Remove(item);
            return true;
        }
    }
}