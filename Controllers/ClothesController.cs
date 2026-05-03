using Microsoft.AspNetCore.Mvc;
using FashionStoreApi.Models;
using FashionStoreApi.Services;

namespace FashionStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClothesController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public ClothesController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpGet]
        public ActionResult<List<ClothingItem>> GetAll() => Ok(_storeService.GetAll());

        [HttpGet("{id}")]
        public ActionResult<ClothingItem> Get(int id)
        {
            var item = _storeService.GetById(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public IActionResult Create(ClothingItem item)
        {
            _storeService.Add(item);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_storeService.Delete(id)) return NotFound();
            return NoContent();
        }
    }
}