using Core.DTOs.Common;
using Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Data.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected readonly DbContext _context;
        protected readonly DbSet<TEntity> _dbSet;

        public Repository(DbContext context)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
        }

        public async Task AddAsync(params TEntity[] entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null)
        {
            if (predicate != null)
            {
                return await _dbSet.CountAsync(predicate);
            }
            return await _dbSet.CountAsync();
        }

        public async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }

        public async Task<IEnumerable<TResult>> GetAllAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector,
            int? pageIndex = null,
            int? pageSize = null,
            Expression<Func<TEntity, object>>? orderBy = null,
            bool? asc = null)
        {
            IQueryable<TEntity> query = _dbSet.Where(predicate);

            // Sắp xếp
            if (orderBy is not null && asc.HasValue)
            {
                if (asc.Value)
                {
                    query = query.OrderBy(orderBy);
                }
                else
                {
                    query = query.OrderByDescending(orderBy);
                }
            }

            // Phân trang
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                query = query.Skip((pageIndex.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value);
            }

            return await query.Select(selector).ToListAsync();
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync(
            Expression<Func<TEntity, bool>> predicate,
            int? pageIndex = null,
            int? pageSize = null,
            Expression<Func<TEntity, object>>? orderBy = null,
            bool? asc = null,
            params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = _dbSet.Where(predicate);

            // Sắp xếp
            if (orderBy is not null && asc.HasValue)
            {
                if (asc.Value)
                {
                    query = query.OrderBy(orderBy);
                }
                else
                {
                    query = query.OrderByDescending(orderBy);
                }
            }

            // Phân trang
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                query = query.Skip((pageIndex.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value);
            }

            if (includes.Any())
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }

            return await query.ToListAsync();
        }

        public async Task<Paginated<TResult>> GetPagingAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector,
            int pageIndex,
            int pageSize,
            Expression<Func<TEntity, object>> orderBy,
            bool asc)
        {
            IQueryable<TEntity> query = _dbSet.Where(predicate);

            // Sắp xếp
            if (asc)
            {
                query = query.OrderBy(orderBy);
            }
            else
            {
                query = query.OrderByDescending(orderBy);
            }

            // Phân trang
            var total = await query.CountAsync();
            query = query.Skip((pageIndex - 1) * pageSize).Take(pageSize);

            return new Paginated<TResult>
            {
                Items = await query.Select(selector).ToListAsync(),
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalItems = total
            };
        }

        public async Task<TResult?> GetFirstAsync<TResult>(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TResult>> selector)
        {
            IQueryable<TEntity> query = _dbSet.Where(predicate);
            return await query.Select(selector).FirstOrDefaultAsync();
        }

        public async Task<TEntity?> GetFirstAsync(
            Expression<Func<TEntity, bool>> predicate,
            params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = _dbSet.Where(predicate);

            if (includes.Any())
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }

            return await query.FirstOrDefaultAsync();
        }

        public Task UpdateAsync(params TEntity[] entities)
        {
            _dbSet.UpdateRange(entities);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(params TEntity[] entities)
        {
            _dbSet.RemoveRange(entities);
            return Task.CompletedTask;
        }
    }
}
