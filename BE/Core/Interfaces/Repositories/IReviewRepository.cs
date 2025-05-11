using Core.Entities.BookFeature;
using Core.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface IReviewRepository : IBaseRepository<Review, Guid>
    {
        Task AddReviewMedia(Guid reviewId, string source, MediaType mediaType);
    }
}
