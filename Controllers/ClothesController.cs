using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VladovClothingStore.Models;
using VladovClothingStore.Dtos;
using VladovClothingStore.Services;
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
}