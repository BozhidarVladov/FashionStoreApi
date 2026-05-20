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

    public ClothesController(IStoreService service)
    {
        _service = service;
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
            CategoryId = dto.CategoryId
        };

        await _service.AddClothingAsync(item);
        return Ok(item);
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

    return Ok(new 
    { 
        message = $"Успешна покупка! Закупихте {clothing.Name} на цена {clothing.Price} лв.",
        purchaseDate = DateTime.UtcNow
    });
}
}