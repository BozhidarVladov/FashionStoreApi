using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VladovClothingStore.Dtos;
using VladovClothingStore.Services;
using Microsoft.AspNetCore.Authorization;

namespace VladovClothingStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public OrdersController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto orderDto)
        {
            if (orderDto == null)
            {
                return BadRequest("Данните за поръчката са невалидни.");
            }
            
            var result = await _storeService.CreateOrderAsync(orderDto);

            if (!result)
            {
                return BadRequest("Неуспешно създаване на поръчката. Проверете дали количката не е празна.");
            }

            return Ok(new { message = "Поръчката е приета успешно!" });
        }
    }
}