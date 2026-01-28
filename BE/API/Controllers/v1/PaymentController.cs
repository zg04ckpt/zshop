using Core.DTOs.Order;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v{version:apiVersion}/payment")]
    [ApiController]
    [Authorize]
    [ApiVersion("1.0")]
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
                var result = await _paymentService.UpdateVNPayTransactionStatus(queryParams);
                Console.WriteLine("-> Xử lý cập nhật trạng thái VNPay:" + result);
                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("-> Lỗi xử lý cập nhật trạng thái VNPay:" + ex.Message);
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
            return Ok(await _paymentService.Pay(orderId, data, User, ipAddr));
        }

        #region Manage
        [HttpGet("manage/orders")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> GetSystemOrders([FromQuery] SystemOrderSearchDTO data)
        {
            data.StartDate = Helper.ConvertFromUtcToLocalTime(data.StartDate);
            data.EndDate = Helper.ConvertFromUtcToLocalTime(data.EndDate);
            return Ok(await _paymentService.GetAllSystemOrder(data));
        }

        [HttpPut("manage/orders/{id}/status")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] SetOrderStatusDTO data)
        {
            return Ok(await _paymentService.SetOrderStatus(id, data));
        }

        [HttpGet("manage/cancel-order-requests")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> GetAllCancelRequests([FromQuery] int page)
        {
            return Ok(await _paymentService.GetAllCancelOrderRequest(page));
        }

        [HttpDelete("manage/cancel-order-requests/{requestId}")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> AcceptOrRejectCancelOrderRequest(int requestId, bool isAccepted)
        {
            return Ok(await _paymentService.AcceptOrRejectOrderCancelling(requestId, isAccepted));
        }
        #endregion
    }
}
