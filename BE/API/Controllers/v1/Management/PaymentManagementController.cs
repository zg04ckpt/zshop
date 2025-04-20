using Core.DTOs.Order;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1.Management
{
    [Route("api/v1/management/payment")]
    [ApiController]
    [Authorize(Policy = "OnlyAdmin")]
    public class PaymentManagementController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentManagementController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetSystemOrders([FromQuery] SystemOrderSearchDTO data)
        {
            data.StartDate = Helper.ConvertFromUtcToLocalTime(data.StartDate);
            data.EndDate = Helper.ConvertFromUtcToLocalTime(data.EndDate);
            return Ok(await _paymentService.GetAllSystemOrder(data));
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] SetOrderStatusDTO data)
        {
            return Ok(await _paymentService.SetOrderStatus(id, data));
        }

        [HttpGet("cancel-order-requests")]
        public async Task<IActionResult> GetAllCancelRequests([FromQuery]int page)
        {
            return Ok(await _paymentService.GetAllCancelOrderRequest(page));
        }

        [HttpDelete("cancel-order-requests/{requestId}")]
        public async Task<IActionResult> AcceptOrRejectCancelOrderRequest(int requestId, bool isAccepted)
        {
            return Ok(await _paymentService.AcceptOrRejectOrderCancelling(requestId, isAccepted));
        }
    }
}
