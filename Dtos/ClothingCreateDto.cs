using System.ComponentModel.DataAnnotations;

namespace VladovClothingStore.Dtos
{
    public class ClothingCreateDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2,ErrorMessage = "Името трябва да е между 2 и 100 символа")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 10000,ErrorMessage = "Цената трябва да е между 0.01 и 10000 евро")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Трябва да посочите валидна категория!")]
        public int CategoryId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}