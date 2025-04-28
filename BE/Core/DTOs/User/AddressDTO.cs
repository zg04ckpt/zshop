using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class AddressDTO
    {
        [Required(ErrorMessage = "Tên thành phố/tỉnh trống.")]
        public string City { get; set; }

        [Required(ErrorMessage = "Mã thành phố/tỉnh trống.")]
        public int CityCode { get; set; }

        [Required(ErrorMessage = "Tên quận/huyện trống.")]
        public string District { get; set; }

        [Required(ErrorMessage = "Mã quận/huyện trống.")]
        public int DistrictCode { get; set; }

        [Required(ErrorMessage = "Tên phường/xã/thị trấn trống.")]
        public string Ward { get; set; }

        [Required(ErrorMessage = "Mã phường/xã/thị trấn trống.")]
        public int WardCode { get; set; }

        [Required(ErrorMessage = "Địa chỉ chi tiết trống")]
        public string Detail { get; set; }

        [Required(ErrorMessage = "Số điện thoại người nhận trống.")]
        [Phone(ErrorMessage = "Không đúng định dạng số điện thoại.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Tên người nhận trống")]
        public string ReceiverName { get; set; }
    }
}
