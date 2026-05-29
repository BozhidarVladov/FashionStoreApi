using System;
using System.Collections.Generic;

namespace VladovClothingStore.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserEmail { get; set; } = string.Empty; 
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalPrice { get; set; }
        
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty; 
        
        public string PaymentMethod { get; set; } = "Наложен платеж";
        public string Status { get; set; } = "Pending"; 
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}