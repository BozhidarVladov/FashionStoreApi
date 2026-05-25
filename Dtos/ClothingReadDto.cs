namespace VladovClothingStore.Dtos
{
    public class ClothingReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string ImageUrl {get; set;} = string.Empty;
    }
}