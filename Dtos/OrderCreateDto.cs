using System.Collections.Generic;

namespace VladovClothingStore.Dtos
{
    public class OrderCreateDto
    {
        public string UserEmail { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty; 
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Наложен платеж";

        public List<OrderItemCreateDto> Items { get; set; } = new();
    }
}