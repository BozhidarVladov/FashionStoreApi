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
    [Authorize(Roles = "Admin")] 
    public async Task<ActionResult> Add(ClothingCreateDto dto) 
    { 
        var item = new ClothingItem 
        {
            Name = dto.Name,
            Price = dto.Price,
            CategoryId = dto.CategoryId
        };

        await _service.AddClothingAsync(item); 
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item); 
    } 

    [HttpPut("{id}")] 
    [Authorize(Roles = "Admin")] 
    public async Task<ActionResult> Update(int id, ClothingCreateDto dto) 
    { 
        var existing = await _service.GetClothingByIdAsync(id); 
        if (existing == null) return NotFound(); 

        var itemToUpdate = new ClothingItem 
        { 
            Id = id, 
            Name = dto.Name, 
            Price = dto.Price, 
            CategoryId = dto.CategoryId 
        };

        await _service.UpdateClothingAsync(itemToUpdate); 
        return NoContent(); 
    } 

    [HttpDelete("{id}")] 
    [Authorize(Roles = "Admin")] 
    public async Task<ActionResult> Delete(int id) 
    { 
        var existing = await _service.GetClothingByIdAsync(id); 
        if (existing == null) return NotFound(); 

        await _service.DeleteClothingAsync(id); 
        return NoContent(); 
    } 
}