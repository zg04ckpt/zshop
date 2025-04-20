using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface IBaseRepository<TEntity, TKey> where TEntity : class
    {
        Task Add(TEntity entity);
        Task AddRange(IEnumerable<TEntity> entities);
        void Update(TEntity entity);
        void UpdateRange(IEnumerable<TEntity> entities);
        void Delete(TEntity entity);
        IQueryable<TEntity> GetAll();
        IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>> lamda);
        Task<TEntity?> Get(TKey id);
        Task<TEntity?> Get(Expression<Func<TEntity, bool>> lamda);
        IQueryable<TEntity> GetQuery();
        Task<bool> IsExists(Expression<Func<TEntity, bool>> lamda);
        Task Save();
    }
}
