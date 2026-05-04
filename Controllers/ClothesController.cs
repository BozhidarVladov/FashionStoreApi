using Microsoft.AspNetCore.Mvc;
using VladovClothingStore;

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
    public async Task<ActionResult<IEnumerable<ClothingItem>>> GetAll()
    {
        return Ok(await _service.GetAllItemsAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClothingItem>> GetById(int id)
    {
        var item = await _service.GetItemByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult> Add(ClothingItem item)
    {
        await _service.AddItemAsync(item);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, ClothingItem item)
    {
        if (id != item.Id) return BadRequest();
        
        var existing = await _service.GetItemByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.UpdateItemAsync(item);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _service.GetItemByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.DeleteItemAsync(id);
        return NoContent();
    }
}