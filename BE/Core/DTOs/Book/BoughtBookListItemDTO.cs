namespace Core.DTOs.Book
{
    public class BoughtBookListItemDTO : BookListItemDTO
    {
        public DateTime LastPurchasedAt { get; set; }
        public int PurchaseCount { get; set; }
    }
}
