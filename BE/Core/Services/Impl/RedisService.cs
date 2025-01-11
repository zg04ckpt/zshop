using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.Impl
{
    public class RedisService : IRedisService
    {
        private readonly IConnectionMultiplexer redis;

        public RedisService(IConnectionMultiplexer redis)
        {
            this.redis = redis;
        }

        public async Task<bool> Delete(string type, string key)
        {
            return await redis.GetDatabase().KeyDeleteAsync($"{type}:{key}");
        }

        public async Task<string?> Get(string type, string key)
        {
            return await redis.GetDatabase().StringGetAsync($"{type}:{key}");
        }

        public async Task<bool> IsExists(string type, string key)
        {
            return await redis.GetDatabase().KeyExistsAsync($"{type}:{key}");
        }

        public async Task<bool> Set(string type, string key, string value, TimeSpan ttl)
        {
            return await redis.GetDatabase().StringSetAsync($"{type}:{key}", value, ttl);
        }

        public async Task<bool> UpdateAndKeepTTL(string type, string key, string value)
        {
            var db = redis.GetDatabase();
            var ttl = await db.KeyTimeToLiveAsync($"{type}:{key}");
            if (ttl.HasValue)
            {
                return await db.StringSetAsync($"{type}:{key}", value, ttl);
            }
            return await db.StringSetAsync($"{type}:{key}", value);
        }
    }
}
