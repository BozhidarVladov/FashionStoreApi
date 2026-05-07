using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<IEnumerable<ClothingReadDto>>> GetAll()
    {
        var clothes = await _service.GetAllClothesAsync();
        return Ok(clothes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClothingReadDto>> GetById(int id)
    {
        var item = await _service.GetClothingByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult> Add(ClothingItem item)
    {
        await _service.AddClothingAsync(item);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, ClothingItem item)
    {
        if (id != item.Id) return BadRequest();
        
        var existing = await _service.GetClothingByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.UpdateClothingAsync(item);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _service.GetClothingByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.DeleteClothingAsync(id);
        return NoContent();
    }
}