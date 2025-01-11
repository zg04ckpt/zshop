using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.Impl
{
    public class StorageService : IStorageService
    {
        public async Task<string> GetHtmlTemplate(string templateFileName)
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Resources", "Templates", templateFileName);
            return await File.ReadAllTextAsync(path);
        }
    }
}
