using Core.Entities.BookFeature;
using Core.Enums;

namespace Core.Interfaces.Repositories
{
    public interface IReviewRepository : IRepository<Review, Guid>
    {
        Task AddReviewMedia(Guid reviewId, string source, MediaType mediaType);
    }
}
