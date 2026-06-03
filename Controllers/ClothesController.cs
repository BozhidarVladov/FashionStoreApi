using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VladovClothingStore.Models;
using VladovClothingStore.Dtos;
using System;
using VladovClothingStore.Services;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VladovClothingStore.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ClothesController : ControllerBase
{
    private readonly IStoreService _service;
    private readonly IEmailService _emailService;

    public ClothesController(IStoreService service, IEmailService emailService)
    {
        _service = service;
        _emailService = emailService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ClothingReadDto>>> GetAll()
    {
        var clothes = await _service.GetAllClothesAsync();
        return Ok(clothes);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] ClothingCreateDto dto)
    {
        if (dto == null)
            return BadRequest();

        var item = new ClothingItem
        {
            Name = dto.Name,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            ImageUrl = dto.ImageUrl,
            Description = dto.Description
        };

        await _service.AddClothingAsync(item);
        return Ok(item);
    }

[HttpPut("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Update(int id, [FromBody] ClothingUpdateDto dto)
{
    if (dto == null)
        return BadRequest("Данните са невалидни.");
        
    var itemToUpdate = new ClothingItem
    {
        Id = id,
        Name = dto.Name,
        Price = dto.Price,
        CategoryId = dto.CategoryId,
        ImageUrl = dto.ImageUrl,
        Description = dto.Description
    };

    try
    {
        await _service.UpdateClothingAsync(itemToUpdate);
        return Ok(new { message = "Продуктът е обновен успешно!" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Грешка при обновяване в базата данни.", details = ex.Message });
    }
}

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteClothingAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/buy")]
    [Authorize]
    public async Task<IActionResult> BuyClothing(int id)
    {
        var clothes = await _service.GetAllClothesAsync();
        var clothing = clothes.FirstOrDefault(c => c.Id == id);

        if (clothing == null)
        {
            return NotFound(new { message = $"Дреха с ID {id} не беше намерена." });
        }
        var userEmail = User.Identity?.Name ?? "bovkadov@gmail.com"; 
        
        string subject = $"Потвърждение за поръчка #{Guid.NewGuid().ToString().Substring(0, 8)}";
        string messageBody = $@"
            <h1>Благодарим ви за покупката в Vladov Clothing Store!</h1>
            <p>Успешно закупихте: <strong>{clothing.Name}</strong></p>
            <p>Цена: <strong>{clothing.Price} лв.</strong></p>
            <br/>
            <p>Поздрави,<br/>Екипът на Vladov Clothing Store</p>";

        await _emailService.SendEmailAsync(userEmail, subject, messageBody);

        return Ok(new 
        { 
            message = $"Успешна покупка! Закупихте {clothing.Name} на цена {clothing.Price} лв.",
            purchaseDate = DateTime.UtcNow
        });
    }
}