using Core.DTOs.Book;
using Core.DTOs.Cart;
using Core.DTOs.Common;
using Core.DTOs.Order;
using System.Security.Claims;

namespace Core.Interfaces.Services
{
    public interface IPaymentService
    {
        #region Pay
        Task<ApiResult<string>> CreateOrderFromBook(string bookId, ClaimsPrincipal claims);
        Task<string> CreateOrderFromCart(List<OrderItemDTO> data, ClaimsPrincipal claims);
        Task<ApiResult<OrderDTO>> GetUnConfirmedOrder(string orderId, ClaimsPrincipal claims);
        Task<ApiResult<string>> PayByVNPay(string orderId, OrderDTO data, string ip, ClaimsPrincipal claims);
        Task<ApiResult<string>> CashOnDelivery(string orderId, OrderDTO data, ClaimsPrincipal claims);
        Task<string> UpdateVNPayTransactionStatus(Dictionary<string, string> data);
        Task<string> GetVNPayTransactionResult(Dictionary<string, string> data);
        Task<string> GetCashOnDeliveryOrderSuccess(string orderId);
        #endregion

        #region Order tracking
        Task<ApiResult<Paginated<OrderHistoryListItemDTO>>> GetOrderHistory(OrderHistorySearchDTO data, ClaimsPrincipal claims);
        Task<ApiResult<SystemOrdersDTO>> GetAllSystemOrder(SystemOrderSearchDTO data);
        Task<ApiResult<OrderHistoryDetailDTO>> GetOrderHistoryDetail(string orderId, ClaimsPrincipal claims);
        Task<ApiResult> CancelOrder(string orderId, CancelOrderRequestDTO data, ClaimsPrincipal claims);
        Task<ApiResult<Paginated<CancelOrderRequestListItemDTO>>> GetAllCancelOrderRequest(int page);
        Task<ApiResult> AcceptOrRejectOrderCancelling(int requestId, bool isAccepted);
        Task<ApiResult> SetOrderStatus(string orderId, SetOrderStatusDTO data);
        #endregion
    }
}
