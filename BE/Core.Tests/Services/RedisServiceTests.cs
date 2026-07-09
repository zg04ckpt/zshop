using Core.Services;
using FluentAssertions;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace Core.Tests.Services
{
    public class RedisServiceTests
    {
        private readonly Mock<IConnectionMultiplexer> _multiplexerMock;
        private readonly Mock<IDatabase> _dbMock;
        private readonly RedisService _redisService;

        public RedisServiceTests()
        {
            _multiplexerMock = new Mock<IConnectionMultiplexer>();
            _dbMock = new Mock<IDatabase>();

            _multiplexerMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                .Returns(_dbMock.Object);

            _redisService = new RedisService(_multiplexerMock.Object);
        }

        [Fact]
        public async Task Delete_ShouldReturnTrue_WhenSuccess()
        {
            // Arrange
            _dbMock.Setup(x => x.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await _redisService.Delete("type", "key");

            // Assert
            result.Should().BeTrue();
            _dbMock.Verify(x => x.KeyDeleteAsync(It.Is<RedisKey>(k => k == "type:key"), CommandFlags.None), Times.Once);
        }

        [Fact]
        public async Task Get_ShouldReturnValue()
        {
            // Arrange
            _dbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync("value");

            // Act
            var result = await _redisService.Get("type", "key");

            // Assert
            result.Should().Be("value");
        }

        [Fact]
        public async Task Set_ShouldReturnTrue()
        {
            // Arrange
            _dbMock.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);
            _dbMock.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await _redisService.Set("type", "key", "value", TimeSpan.FromMinutes(5));

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task ExistsAsync_ShouldReturnTrue()
        {
            // Arrange
            _dbMock.Setup(x => x.KeyExistsAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await _redisService.ExistsAsync("type", "key");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task GetTTL_ShouldReturnSeconds()
        {
            // Arrange
            _dbMock.Setup(x => x.KeyTimeToLiveAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(TimeSpan.FromSeconds(10));

            // Act
            var result = await _redisService.GetTTL("type", "key");

            // Assert
            result.Should().Be(10);
        }

        public class TestObj
        {
            public string Name { get; set; }
        }

        [Fact]
        public async Task GetObject_ShouldReturnObj()
        {
            // Arrange
            var hashEntries = new HashEntry[]
            {
                new HashEntry("Name", "\"TestName\"") // serialized string
            };

            _dbMock.Setup(x => x.HashGetAllAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(hashEntries);

            // Act
            var result = await _redisService.GetObject<TestObj>("type", "key");

            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be("TestName");
        }

        [Fact]
        public async Task SetObject_ShouldReturnTrue()
        {
            // Arrange
            _dbMock.Setup(x => x.HashSetAsync(It.IsAny<RedisKey>(), It.IsAny<HashEntry[]>(), It.IsAny<CommandFlags>()))
                .Returns(Task.CompletedTask);
            _dbMock.Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);
            _dbMock.Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var obj = new TestObj { Name = "Test" };
            var result = await _redisService.SetObject("type", "key", obj, TimeSpan.FromMinutes(5));

            // Assert
            result.Should().BeTrue();
            _dbMock.Verify(x => x.HashSetAsync(It.IsAny<RedisKey>(), It.IsAny<HashEntry[]>(), CommandFlags.None), Times.Once);
        }
    }
}
