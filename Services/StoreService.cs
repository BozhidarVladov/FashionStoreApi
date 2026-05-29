using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VladovClothingStore.Models;
using VladovClothingStore.Dtos;
using VladovClothingStore;

namespace VladovClothingStore.Services;

public class StoreService : IStoreService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public StoreService(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<List<ClothingReadDto>> GetAllClothesAsync()
    {
        var clothes = await _context.Clothes
            .Include(c => c.Category)
            .ToListAsync();

        return clothes.Select(c => new ClothingReadDto
        {
            Id = c.Id,
            Name = c.Name,
            Price = c.Price,
            CategoryName = c.Category != null ? c.Category.Name : "No Category",
            ImageUrl = c.ImageUrl,
            Description = c.Description
        }).ToList();
    }

    public async Task<ClothingReadDto?> GetClothingByIdAsync(int id)
    {
        var item = await _context.Clothes
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (item == null) return null;

        return new ClothingReadDto
        {
            Id = item.Id,
            Name = item.Name,
            Price = item.Price,
            CategoryName = item.Category != null ? item.Category.Name : "No Category",
            Description = item.Description
        };
    }

    public async Task AddClothingAsync(ClothingItem item)
    {
        _context.Clothes.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateClothingAsync(ClothingItem item)
    {
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteClothingAsync(int id)
    {
        var item = await _context.Clothes.FindAsync(id);
        if (item != null)
        {
            _context.Clothes.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> CreateOrderAsync(OrderCreateDto orderDto)
    {
        if (orderDto.Items == null || orderDto.Items.Count == 0)
            return false;

        var order = new Order
        {
            UserEmail = orderDto.UserEmail,
            FullName = orderDto.FullName,
            PhoneNumber = orderDto.PhoneNumber,
            City = orderDto.City,
            DeliveryAddress = orderDto.DeliveryAddress,
            PaymentMethod = orderDto.PaymentMethod,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalPrice = 0 
        };

        decimal calculatedTotal = 0;
        
        string emailItemsHtml = "";

        foreach (var itemDto in orderDto.Items)
        {
            var clothingItem = await _context.Clothes.FindAsync(itemDto.ClothingItemId);
            if (clothingItem == null) continue;

            var orderItem = new OrderItem
            {
                ClothingItemId = itemDto.ClothingItemId,
                Size = itemDto.Size,
                Quantity = itemDto.Quantity,
                PriceAtPurchase = clothingItem.Price // 🛡️ Защита: вземаме цената директно от базата!
            };

            calculatedTotal += clothingItem.Price * itemDto.Quantity;

            order.OrderItems.Add(orderItem);

            emailItemsHtml += $@"
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px; color: #333;'>{clothingItem.Name} (<strong>Размер: {itemDto.Size}</strong>)</td>
                    <td style='padding: 10px; text-align: center; color: #555;'>x{itemDto.Quantity}</td>
                    <td style='padding: 10px; text-align: right; font-weight: bold; color: #111;'>{(clothingItem.Price * itemDto.Quantity):F2} €</td>
                </tr>";
        }

        order.TotalPrice = calculatedTotal;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        
        try
        {
            decimal shippingCost = calculatedTotal >= 100 ? 0 : 5.00m;
            decimal finalTotal = calculatedTotal + shippingCost;
            string shippingText = shippingCost == 0 ? "БЕЗПЛАТНА 🎉" : $"{shippingCost:F2} €";

            string emailBody = $@"
                <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'>
                    <div style='text-align: center; margin-bottom: 25px;'>
                        <h1 style='margin: 0; color: #111; font-size: 26px; letter-spacing: 1px;'>VLADOV CLOTHING STORE</h1>
                        <p style='color: #888; font-size: 14px;'>Благодарим ви за покупката!</p>
                    </div>

                    <div style='background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>
                        <h3 style='margin-top: 0; color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>📋 Данни за доставка</h3>
                        <p style='margin: 6px 0; font-size: 14px;'><strong>Получател:</strong> {order.FullName}</p>
                        <p style='margin: 6px 0; font-size: 14px;'><strong>Телефон:</strong> {order.PhoneNumber}</p>
                        <p style='margin: 6px 0; font-size: 14px;'><strong>Град:</strong> {order.City}</p>
                        <p style='margin: 6px 0; font-size: 14px;'><strong>Адрес:</strong> {order.DeliveryAddress}</p>
                        <p style='margin: 6px 0; font-size: 14px;'><strong>Начин на плащане:</strong> {order.PaymentMethod}</p>
                        <p style='margin: 10px 0 0 0; font-size: 13px; color: #28a745; font-weight: bold;'>🔍 Включена опция ""Преглед и тест перед плащане""!</p>
                    </div>

                    <h3 style='color: #222;'>🛒 Поръчани артикули</h3>
                    <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                        <thead>
                            <tr style='background-color: #111; color: #fff;'>
                                <th style='padding: 10px; text-align: left; font-size: 14px;'>Артикул</th>
                                <th style='padding: 10px; text-align: center; font-size: 14px;'>Кол.</th>
                                <th style='padding: 10px; text-align: right; font-size: 14px;'>Цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailItemsHtml}
                        </tbody>
                    </table>

                    <div style='border-top: 2px solid #111; padding-top: 15px; font-size: 15px;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 5px;'>
                            <span>Междинна сума:</span>
                            <span style='float: right;'>{calculatedTotal:F2} €</span>
                        </div>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
                            <span>Доставка:</span>
                            <span style='float: right; color: {(shippingCost == 0 ? "#28a745" : "#111")}; font-weight: {(shippingCost == 0 ? "bold" : "normal")};'>{shippingText}</span>
                        </div>
                        <div style='display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 1px solid #eee; padding-top: 10px; color: #111;'>
                            <span>Крайна сума:</span>
                            <span style='float: right; color: #28a745;'>{finalTotal:F2} €</span>
                        </div>
                    </div>

                    <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0 15px 0;' />
                    <p style='text-align: center; color: #999; font-size: 12px; margin: 0;'>
                        Ако имате въпроси, не се колебайте да се свържете с нас.<br/>
                        <strong>Vladov Clothing Store © 2026</strong>
                    </p>
                </div>";

            await _emailService.SendEmailAsync(order.UserEmail, $"Успешна поръчка № VLD-{new Random().Next(100000, 999999)} 🚀", emailBody);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Имейл Грешка]: Известването не се изпрати: {ex.Message}");
        }

        return true;
    }
}