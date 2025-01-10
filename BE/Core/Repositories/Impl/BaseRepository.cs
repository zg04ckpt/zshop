using Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Repositories.Impl
{
    public class BaseRepository<TEntity, TKey> : IBaseRepository<TEntity, TKey> where TEntity : class
    {
        protected readonly AppDbContext context;

        protected BaseRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task Add(TEntity entity)
        {
            await context.Set<TEntity>().AddAsync(entity);
        }

        public void Delete(TEntity entity)
        {
            context.Set<TEntity>().Remove(entity);
        }

        public IQueryable<TEntity> GetAll()
        {
            return context.Set<TEntity>();
        }

        public IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>> lamda)
        {
            return context.Set<TEntity>().Where(lamda);
        }

        public async Task<TEntity?> Get(TKey id)
        {
            return await context.Set<TEntity>().FindAsync(id);
        }

        public async Task<TEntity?> Get(Expression<Func<TEntity, bool>> lamda)
        {
            return await context.Set<TEntity>().FirstOrDefaultAsync(lamda);
        }

        public IQueryable<TEntity> GetQuery()
        {
            return context.Set<TEntity>();
        }

        public async Task<bool> IsExists(Expression<Func<TEntity, bool>> lamda)
        {
            return await context.Set<TEntity>().AsNoTracking().AnyAsync(lamda);
        }

        public async Task Save()
        {
            await context.SaveChangesAsync();
        }

        public void Update(TEntity entity)
        {
            context.Set<TEntity>().Update(entity);
        }
    }
}
