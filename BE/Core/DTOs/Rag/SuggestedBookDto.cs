using System;

namespace Core.DTOs.Rag
{
    public class SuggestedBookDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
    }
}
