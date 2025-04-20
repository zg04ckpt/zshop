using Core.DTOs.Common;
using Core.DTOs.External;
using Core.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services.External
{
    public interface IVNAddressDataService
    {
        ApiResult<AddressSelectConfigDTO> GetConfigData();
        bool IsValidCity(string cityName, int cityCode);
        bool IsValidDistrict(string districtName, int districtCode);
        bool IsValidWard(string wardName, int wardCode);
    }
}
