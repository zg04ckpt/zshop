using Core.Entities.BookFeature;
using Core.Enums;
using Core.Interfaces.Repositories;

namespace Data.Repositories
{
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {
        public ReviewRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddReviewMedia(Guid reviewId, string source, MediaType mediaType)
        {
            await _context.Set<ReviewMedia>().AddAsync(new ReviewMedia
            {
                ReviewId = reviewId,
                SourceUrl = source,
                MediaType = mediaType
            });
        }
    }
}
