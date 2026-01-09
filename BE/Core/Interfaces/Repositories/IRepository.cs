using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface IRepository<TEntity> where TEntity : class
    {
        Task<TEntity?> GetFirstAsync(
            Expression<Func<TEntity, bool>> predicate,
            params Expression<Func<TEntity, object>>[] includes);

        Task<TResult?> GetFirstAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector);

        Task<IEnumerable<TEntity>> GetAllAsync(
            Expression<Func<TEntity, bool>> predicate,
            int? pageIndex = null,
            int? pageSize = null,
            Expression<Func<TEntity, object>>? orderBy = null,
            bool? asc = null,
            params Expression<Func<TEntity, object>>[] includes);

        Task<IEnumerable<TResult>> GetAllAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector,
            int? pageIndex = null,
            int? pageSize = null,
            Expression<Func<TEntity, object>>? orderBy = null,
            bool? asc = null);

        Task<Paginated<TResult>> GetPagingAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector,
            int pageIndex,
            int pageSize,
            Expression<Func<TEntity, object>> orderBy,
            bool asc);

        Task<bool> ExistsAsync(
            Expression<Func<TEntity, bool>> predicate);
        Task<int> CountAsync(
            Expression<Func<TEntity, bool>>? predicate = null);

        Task AddAsync(params TEntity[] entities);
        Task UpdateAsync(params TEntity[] entities);
        Task DeleteAsync(params TEntity[] entities);
    }
}
