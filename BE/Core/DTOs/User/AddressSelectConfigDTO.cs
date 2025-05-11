using Core.DTOs.External;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class AddressSelectConfigDTO
    {
        public List<AddressSelectItemDTO> Cities { get; set; }
        public List<AddressSelectItemDTO> Districts { get; set; }
        public List<AddressSelectItemDTO> Wards { get; set; }
    }

    public class AddressSelectItemDTO
    {
        public string Name { get; set; }
        public int Code { get; set; }
        public int? ParentCode { get; set; }
    }
}
