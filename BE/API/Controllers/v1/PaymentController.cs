using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.Entities.PaymentFeature;
using Core.Enums;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/payment")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IBookService _bookService;

        public PaymentController(
            IPaymentService paymentService, 
            IBookService bookService)
        {
            _paymentService = paymentService;
            _bookService = bookService;
        }

        [HttpGet("orders/{orderId}/confirm")]
        public async Task<IActionResult> ConfirmOrder(string orderId)
        {
            return Ok(await _paymentService.GetUnConfirmedOrder(orderId, User));
        }

        [HttpGet("orders/{orderId}/books")]
        public async Task<IActionResult> GetBooksInOrder(string orderId)
        {
            return Ok(await _bookService.GetListBookToReview(orderId, User));
        }

        [HttpPost("orders/{orderId}/cancel")]
        public async Task<IActionResult> UserCancelOrder(string orderId, [FromBody] CancelOrderRequestDTO data)
        {
            return Ok(await _paymentService.CancelOrder(orderId, data, User));
        }

        //update transaction status
        [HttpGet("/IPN")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateVNPayTransactionStatus()
        {
            try
            {
                var queryParams = Request.Query.ToDictionary(e => e.Key, e => e.Value.ToString());
                return new JsonResult(await _paymentService.UpdateVNPayTransactionStatus(queryParams));
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Lỗi khi xử lý IPN VNPay");
                return new JsonResult("{\"RspCode\":\"99\",\"Message\":\"Lỗi máy chủ\"}");
            }
        }

        [HttpGet("vnp-result")]
        [AllowAnonymous]
        public async Task<IActionResult> ShowVNPaymentResult()
        {
            var queryParams = Request.Query.ToDictionary(e => e.Key, e => e.Value.ToString());
            return Content(await _paymentService.GetVNPayTransactionResult(queryParams), "text/html");
        }

        [HttpGet("/payment/order-success")]
        [AllowAnonymous]
        public async Task<IActionResult> ShowCashOnDeliveryOrderSuccess(string orderId)
        {
            return Content(await _paymentService.GetCashOnDeliveryOrderSuccess(orderId), "text/html");
        }

        [HttpGet("orders/history")]
        public async Task<IActionResult> GetOrdersHistory([FromQuery] OrderHistorySearchDTO data)
        {
            return Ok(await _paymentService.GetOrderHistory(data, User));
        }

        [HttpGet("orders/history/{orderId}/detail")]
        public async Task<IActionResult> GetOrderHistoryDetail(string orderId)
        {
            return Ok(await _paymentService.GetOrderHistoryDetail(orderId, User));
        }

        [HttpPost("orders")]
        public async Task<IActionResult> MakeOrder(string bookId)
        {
            return Ok(await _paymentService.CreateOrderFromBook(bookId, User));
        }

        [HttpPost("orders/{orderId}/pay")]
        public async Task<IActionResult> PayOrder(string orderId, [FromBody] OrderDTO data)
        {
            string ipAddr = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? HttpContext.Connection.RemoteIpAddress!.ToString();
            if (data.PaymentMethod == PaymentMethod.VNPay)
            {
                return Ok(await _paymentService.PayByVNPay(orderId, data, ipAddr, User));
            }
            else
            {
                return Ok(await _paymentService.CashOnDelivery(orderId, data, User));
            }
        }
    }
}
