using System.ComponentModel.DataAnnotations;

namespace VladovClothingStore.Dtos
{
    public class ClothingCreateDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 100000)]
        public decimal Price { get; set; }

        [Required]
        public int CategoryId { get; set; }
    }
}