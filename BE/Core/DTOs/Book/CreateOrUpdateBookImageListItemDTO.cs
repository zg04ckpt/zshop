using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class CreateOrUpdateBookImageListItemDTO
    {
        public int Id { get; set; }
        public IFormFile? Image { get; set; }
    }
}
