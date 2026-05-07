using System;

namespace VladovClothingStore.Models
{
    public class ClothingItem
    {
        public int Id { get; set;}
        public string Name { get; set;} = string.Empty;
        public decimal Price { get; set;}

        public int CategoryId {get; set;}

        public Category? Category { get; set;}
    }
}


