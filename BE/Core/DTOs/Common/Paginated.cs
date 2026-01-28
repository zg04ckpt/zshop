namespace Core.DTOs.Common
{
    public class Paginated<T>
    {
        public int TotalItems { get; set; }
        public int TotalPages => TotalItems / PageSize + (TotalItems % PageSize > 0 ? 1 : 0);
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public IEnumerable<T> Items { get; set; }
    }
}
