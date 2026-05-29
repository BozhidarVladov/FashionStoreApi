namespace VladovClothingStore.Dtos
{
    public class OrderItemCreateDto
    {
        public int ClothingItemId { get; set; }
        public string Size { get; set; } = "M";
        public int Quantity { get; set; }
    }
}