﻿using Core.Interfaces.Services;
using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class RedisService : IRedisService
    {
        private readonly IConnectionMultiplexer _redis;

        public RedisService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task<bool> Delete(string type, string key)
        {
            return await _redis.GetDatabase().KeyDeleteAsync($"{type}:{key}");
        }

        public async Task<string?> Get(string type, string key)
        {
            return await _redis.GetDatabase().StringGetAsync($"{type}:{key}");
        }

        

        public async Task<long> GetTTL(string type, string key)
        {
            TimeSpan? ttl = await _redis.GetDatabase().KeyTimeToLiveAsync($"{type}:{key}");
            if (ttl is null) return -1;
            return (long)ttl.Value.TotalSeconds;
        }

        public async Task<bool> IsExists(string type, string key)
        {
            return await _redis.GetDatabase().KeyExistsAsync($"{type}:{key}");
        }

        public async Task<bool> Set(string type, string key, string value, TimeSpan ttl)
        {
            return await _redis.GetDatabase().StringSetAsync($"{type}:{key}", value, ttl);
        }

        
        public async Task<bool> UpdateAndKeepTTL(string type, string key, string value)
        {
            var db = _redis.GetDatabase();
            var ttl = await db.KeyTimeToLiveAsync($"{type}:{key}");
            if (ttl.HasValue)
            {
                return await db.StringSetAsync($"{type}:{key}", value, ttl);
            }
            return await db.StringSetAsync($"{type}:{key}", value);
        }

        public async Task<T?> GetObject<T>(string type, string key)
        {
            var redisKey = $"{type}:{key}";
            var database = _redis.GetDatabase(0);

            var hash = await database.HashGetAllAsync(redisKey);
            if (hash.Length == 0)
            {
                return default;
            }

            var obj = Activator.CreateInstance<T>();
            var properties = obj.GetType().GetProperties();

            foreach (var property in properties)
            {
                var hashValue = hash.FirstOrDefault(h => h.Name == property.Name).Value;
                if (hashValue.HasValue)
                {
                    try
                    {
                        property.SetValue(obj, JsonConvert.DeserializeObject(hashValue, property.PropertyType));
                    }
                    catch (JsonException ex)
                    {
                        throw new Exception($"Failed to deserialize property {property.Name} from Redis.", ex);
                    }
                }
            }

            return obj;
        }
        public async Task<bool> SetObject(string type, string key, object value, TimeSpan ttl)
        {
            // Convert all prop tu HashEntry
            var properties = value.GetType().GetProperties();
            HashEntry[] hashData = properties
                .Where(p => p.GetValue(value) != null)
                .Select(p =>
                {
                    object pData = p.GetValue(value)!;
                    return new HashEntry(p.Name, JsonConvert.SerializeObject(pData));
                })
                .ToArray();
            var redisKey = $"{type}:{key}";
            var database = _redis.GetDatabase();
            await database.HashSetAsync(redisKey, hashData);
            await database.KeyExpireAsync(redisKey, ttl);
            return true;
        }
    }
}
