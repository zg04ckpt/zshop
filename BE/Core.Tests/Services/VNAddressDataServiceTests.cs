using Core.DTOs.External;
using Core.Services.External;
using FluentAssertions;
using Newtonsoft.Json;
using Xunit;

namespace Core.Tests.Services.External
{
    public class VNAddressDataServiceTests : IDisposable
    {
        private readonly string _testPath;
        private readonly string _testDir;

        public VNAddressDataServiceTests()
        {
            _testDir = Path.Combine(AppContext.BaseDirectory, "resources");
            if (!Directory.Exists(_testDir))
            {
                Directory.CreateDirectory(_testDir);
            }
            _testPath = Path.Combine(_testDir, "VNMap.json");

            var cities = new CityDTO[]
            {
                new CityDTO
                {
                    Name = "City",
                    Code = 1,
                    Districts = new DistrictDTO[]
                    {
                        new DistrictDTO
                        {
                            Name = "District",
                            Code = 1,
                            Wards = new WardDTO[]
                            {
                                new WardDTO { Name = "Ward", Code = 1 }
                            }
                        }
                    }
                }
            };
            File.WriteAllText(_testPath, JsonConvert.SerializeObject(cities));
        }

        public void Dispose()
        {
            if (File.Exists(_testPath))
            {
                File.Delete(_testPath);
            }
        }

        [Fact]
        public async Task InitializeAsync_ShouldLoadData()
        {
            // Arrange
            var service = new VNAddressDataService();
            // Wait for it to finish initialization
            await Task.Delay(1000);

            // Act
            var config = service.GetConfigData();

            // Assert
            config.Data.Cities.Should().HaveCount(1);
            config.Data.Districts.Should().HaveCount(1);
            config.Data.Wards.Should().HaveCount(1);
        }

        [Fact]
        public async Task IsValidCity_ShouldReturnTrue_WhenValid()
        {
            // Arrange
            var service = new VNAddressDataService();
            await Task.Delay(1000);

            // Act
            var result = service.IsValidCity("City", 1);
            var invalid = service.IsValidCity("City", 2);

            // Assert
            result.Should().BeTrue();
            invalid.Should().BeFalse();
        }

        [Fact]
        public async Task IsValidDistrict_ShouldReturnTrue_WhenValid()
        {
            // Arrange
            var service = new VNAddressDataService();
            await Task.Delay(1000);

            // Act
            var result = service.IsValidDistrict("District", 1);
            var invalid = service.IsValidDistrict("District", 2);

            // Assert
            result.Should().BeTrue();
            invalid.Should().BeFalse();
        }

        [Fact]
        public async Task IsValidWard_ShouldReturnTrue_WhenValid()
        {
            // Arrange
            var service = new VNAddressDataService();
            await Task.Delay(1000);

            // Act
            var result = service.IsValidWard("Ward", 1);
            var invalid = service.IsValidWard("Ward", 2);

            // Assert
            result.Should().BeTrue();
            invalid.Should().BeFalse();
        }
    }
}
