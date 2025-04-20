using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Core.Interfaces.Services.External;
using Core.Utilities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.External
{
    public class StorageService : IStorageService
    {
        private readonly Cloudinary _cloudinary;

        public StorageService()
        {
            _cloudinary = new Cloudinary(new Account
            {
                Cloud = EnvHelper.GetCloudinaryCloundName(),
                ApiKey = EnvHelper.GetCloudinaryApiKey(),
                ApiSecret = EnvHelper.GetCloudinaryApiSecret()
            });
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> GetHtmlTemplate(string templateFileName)
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Resources", "Templates", templateFileName);
            return await File.ReadAllTextAsync(path);
        }

        public async Task<bool> RemoveImage(string imageUrl)
        {
            string publicId = "zshop/images/" + Path.GetFileNameWithoutExtension(imageUrl);
            var result = await _cloudinary.DeleteResourcesAsync(ResourceType.Image, publicId);
            return result.StatusCode == System.Net.HttpStatusCode.OK;
        }

        public async Task<string?> SaveImage(IFormFile file)
        {
            if (file.Length == 0) return null;
            using var fileStream = file.OpenReadStream();
            var uploadParam = new ImageUploadParams
            {
                Folder = "zshop/images",
                File = new FileDescription(file.Name, fileStream)
            };

            var result = await _cloudinary.UploadAsync(uploadParam);
            return result.SecureUrl.ToString();
        }
    }
}
