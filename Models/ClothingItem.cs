using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace VladovClothingStore.Models
{
    public class ClothingItem
    {
        public int Id { get; set;}
        [Required(ErrorMessage = "Името е задължително!")]
        public string Name { get; set;} = string.Empty;
        [Range(0.01, 3000, ErrorMessage = "Цената трябва да е между 0.01 и 3000 евро")]
        public decimal Price { get; set;}
        public string ImageUrl {get; set;} = string.Empty;

        public int CategoryId {get; set;}

        public Category? Category { get; set;}
        public List<Tag> Tags { get; set; } = new();
        public string Description { get; set; } = string.Empty;
    }
}


