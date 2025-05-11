﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IRedisService
    {
        Task<string?> Get(string type, string key);
        Task<long> GetTTL(string type, string key);
        Task<bool> Set(string type, string key, string value, TimeSpan ttl);
        Task<bool> UpdateAndKeepTTL(string type, string key, string value);
        Task<bool> Delete(string type, string key);
        Task<bool> IsExists(string type, string key);

        // Object
        Task<T?> GetObject<T>(string type, string key);
        Task<bool> SetObject(string type, string key, object value, TimeSpan ttl);   
    }
}
