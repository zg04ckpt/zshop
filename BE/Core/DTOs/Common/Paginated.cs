namespace Core.DTOs.Common
{
    public class Paginated<T>
    {
        public int TotalRecord { get; set; }
        public int TotalPage { get; set; }
        public T[] Data { get; set; }
    }
}
