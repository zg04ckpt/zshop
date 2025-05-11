using Core.Entities.BookFeature;
using Core.Enums;
using Core.Interfaces.Repositories;
using Core.Repositories.Impl;

namespace Data.Repositories
{
    public class ReviewRepository : BaseRepository<Review, Guid>, IReviewRepository
    {
        public ReviewRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddReviewMedia(Guid reviewId, string source, MediaType mediaType)
        {
            await context.ReviewMedias.AddAsync(new ReviewMedia
            {
                ReviewId = reviewId,
                SourceUrl = source,
                MediaType = mediaType
            });
        }
    }
}
