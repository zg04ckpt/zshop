using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Common
{
    public class Paginated<T>
    {
        public int TotalRecord { get; set; }
        public int TotalPage { get; set; }
        public T[] Data { get; set; }
    }
}
