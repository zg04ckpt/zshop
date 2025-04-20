using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.External
{
    public class CityDTO
    {
        public string Name { get; set; }
        public int Code { get; set; }
        public string Codename { get; set; }
        public string DivisionType { get; set; }
        public int PhoneCode { get; set; }
        public DistrictDTO[] Districts { get; set; }
    }
    public class DistrictDTO
    {
        public string Name { get; set; }
        public int Code { get; set; }
        public string Codename { get; set; }
        public string DivisionType { get; set; }
        public string ShortCodename { get; set; }
        public WardDTO[] Wards { get; set; }
    }

    public class WardDTO
    {
        public string Name { get; set; }
        public int Code { get; set; }
        public string Codename { get; set; }
        public string DivisionType { get; set; }
        public string ShortCodename { get; set; }
    }
}

