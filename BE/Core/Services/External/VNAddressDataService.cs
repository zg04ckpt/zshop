using Core.DTOs.Common;
using Core.DTOs.External;
using Core.DTOs.User;
using Core.Exceptions;
using Core.Interfaces.Services.External;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.External
{
    public class VNAddressDataService : IVNAddressDataService
    {
        private readonly Dictionary<int, AddressSelectItemDTO> _cities;
        private readonly Dictionary<int, AddressSelectItemDTO> _districts;
        private readonly Dictionary<int, AddressSelectItemDTO> _wards;

        public VNAddressDataService()
        {
            _cities = new();
            _districts = new();
            _wards = new();
            InitializeAsync();
        }
        public async Task InitializeAsync()
        {
            using var httpClient = new HttpClient();
            var res = await httpClient.GetAsync("https://provinces.open-api.vn/api?depth=3");
            if (res.IsSuccessStatusCode)
            {
                string jsonStringData = await res.Content.ReadAsStringAsync()
                    ?? throw new Exception("Get address data fail.");
                CityDTO[] cities = JsonConvert.DeserializeObject<CityDTO[]>(jsonStringData)
                    ?? throw new Exception("Get address data fail.");

                if (cities.Length == 0)
                    throw new InternalServerErrorException("Data is empty.");

                foreach (var city in cities)
                {
                    _cities.Add(city.Code, new AddressSelectItemDTO
                    {
                        Name = city.Name,
                        Code = city.Code,
                        ParentCode = null
                    });

                    foreach (var district in city.Districts)
                    {
                        _districts.Add(district.Code, new AddressSelectItemDTO
                        {
                            Name = district.Name,
                            Code = district.Code,
                            ParentCode = city.Code
                        });

                        foreach (var ward in district.Wards)
                        {
                            _wards.Add(ward.Code, new AddressSelectItemDTO
                            {
                                Name = ward.Name,
                                Code = ward.Code,
                                ParentCode = district.Code
                            });
                        }
                    }
                }

            }
            throw new Exception("Get address data fail.");
        }

        public ApiResult<AddressSelectConfigDTO> GetConfigData()
        {
            return new ApiSuccessResult<AddressSelectConfigDTO>(new AddressSelectConfigDTO
            {
                Cities = _cities.Values.ToList(),
                Districts = _districts.Values.ToList(),
                Wards = _wards.Values.ToList(),
            });
        }

        public bool IsValidCity(string cityName, int cityCode)
        {
            return _cities.TryGetValue(cityCode, out var city)
                && city.Name == cityName;
        }

        public bool IsValidDistrict(string districtName, int districtCode)
        {
            return _districts.TryGetValue(districtCode, out var district)
                && district.Name == districtName;
        }

        public bool IsValidWard(string wardName, int wardCode)
        {
            return _wards.TryGetValue(wardCode, out var ward)
                && ward.Name == wardName;
        }
    }
}
