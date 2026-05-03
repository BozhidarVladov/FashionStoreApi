namespace FashionStoreApi.Models
{
    public class ClothingItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public double Price { get; set; }
        public int StockQuantity { get; set; }
    }
}