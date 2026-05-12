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
[Authorize] // Това защитава целия контролер
public class ClothesController : ControllerBase 
{ 
    private readonly IStoreService _service; 

    public ClothesController(IStoreService service) 
    { 
        _service = service; 
    } 

    [HttpGet]
    [AllowAnonymous] // Позволява на всички да разглеждат дрехите
    public async Task<ActionResult<IEnumerable<ClothingReadDto>>> GetAll() 
    { 
        var clothes = await _service.GetAllClothesAsync(); 
        return Ok(clothes); 
    } 

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] ClothingCreateDto dto) 
    { 
        if (dto == null) return BadRequest();
        var item = new ClothingItem { Name = dto.Name, Price = dto.Price, CategoryId = dto.CategoryId };
        await _service.AddClothingAsync(item); 
        return Ok(item);
    } 
}