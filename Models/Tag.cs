using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VladovClothingStore.Models
{
    public class Tag
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Името на тага е задължително!")]
        public string Name { get; set; } = string.Empty;

        public List<ClothingItem> ClothingItems { get; set; } = new();
    }
}