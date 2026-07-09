using Core.Configurations;
using Core.DTOs.Backup;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Core.Tests.Services
{
    public class SqlServerBackupServiceTests : IDisposable
    {
        private readonly Mock<IBackupRepository> _backupRepoMock;
        private readonly Mock<IOptions<BackupConfig>> _configMock;
        private readonly string _testBackupPath;
        private readonly SqlServerBackupService _service;

        public SqlServerBackupServiceTests()
        {
            _backupRepoMock = new Mock<IBackupRepository>();
            _configMock = new Mock<IOptions<BackupConfig>>();

            var config = new BackupConfig { BackupPath = "TestBackups_SqlServer" };
            _configMock.Setup(x => x.Value).Returns(config);

            _testBackupPath = Path.Combine(AppContext.BaseDirectory, config.BackupPath);

            // Clean up before test if exists
            if (File.Exists(_testBackupPath))
            {
                File.Delete(_testBackupPath);
            }
            if (Directory.Exists(_testBackupPath))
            {
                Directory.Delete(_testBackupPath, true);
            }

            _service = new SqlServerBackupService(_backupRepoMock.Object, _configMock.Object);
        }

        public void Dispose()
        {
            if (Directory.Exists(_testBackupPath))
            {
                Directory.Delete(_testBackupPath, true);
            }
        }

        [Fact]
        public async Task ApplySnapshot_ShouldThrowException_WhenFileNotExists()
        {
            // Act
            var act = async () => await _service.ApplySnapshot("missing.bak");

            // Assert
            await act.Should().ThrowAsync<BadRequestException>();
        }

        [Fact]
        public async Task ApplySnapshot_ShouldCallRepo_WhenFileExists()
        {
            // Arrange
            var fileName = "test.bak";
            var filePath = Path.Combine(_testBackupPath, fileName);
            await File.WriteAllTextAsync(filePath, "test");

            // Act
            var result = await _service.ApplySnapshot(fileName);

            // Assert
            result.Data.Should().Be(fileName);
            _backupRepoMock.Verify(x => x.ApplySnapshot(fileName), Times.Once);
        }

        [Fact]
        public async Task CreateSnapshot_ShouldCallRepo()
        {
            // Arrange
            var req = new RequestCreateSnapshotDTO { Name = "test" };

            // Act
            var result = await _service.CreateSnapshot(req);

            // Assert
            result.Data.Should().StartWith("test_");
            _backupRepoMock.Verify(x => x.CreateSnapshot(It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task DeleteSnapshot_ShouldThrowException_WhenFileNotExists()
        {
            // Act
            var act = async () => await _service.DeleteSnapshot("missing.bak");

            // Assert
            await act.Should().ThrowAsync<BadRequestException>();
        }

        [Fact]
        public async Task DeleteSnapshot_ShouldCallRepo_WhenFileExists()
        {
            // Arrange
            var fileName = "test.bak";
            var filePath = Path.Combine(_testBackupPath, fileName);
            await File.WriteAllTextAsync(filePath, "test");

            // Act
            var result = await _service.DeleteSnapshot(fileName);

            // Assert
            result.Data.Should().Be(fileName);
            _backupRepoMock.Verify(x => x.DeleteSnapshot(fileName), Times.Once);
        }

        [Fact]
        public async Task GetAllSnapshots_ShouldReturnList()
        {
            // Arrange
            var fileName = "test.bak";
            var filePath = Path.Combine(_testBackupPath, fileName);
            await File.WriteAllTextAsync(filePath, "test");

            // Act
            var result = await _service.GetAllSnapshots();

            // Assert
            result.Data.Should().NotBeNull();
            result.Data.Length.Should().Be(1);
            result.Data[0].Name.Should().Be("test"); // Without extension
        }
    }
}
