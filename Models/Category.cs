using System.Collections.Generic;

namespace VladovClothingStore.Models
{
    public class Category
    {
        public int Id {get; set;}
        public string Name { get; set;} = string.Empty;

        public List <ClothingItem> ClothingItems { get; set;} = new List<ClothingItem> ();
    }
}