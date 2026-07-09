using Core.Configurations;
using Core.DTOs.Backup;
using Core.DTOs.Common;
using Core.Exceptions;
using Core.Providers;
using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Core.Tests.Services
{
    public class MySqlBackupServiceTests : IDisposable
    {
        private readonly Mock<IDbConnectionInfoProvider> _infoProviderMock;
        private readonly Mock<ILogger<MySqlBackupService>> _loggerMock;
        private readonly IOptions<BackupConfig> _backupConfig;
        private readonly MySqlBackupService _backupService;
        private readonly string _backupDir;

        public MySqlBackupServiceTests()
        {
            _infoProviderMock = new Mock<IDbConnectionInfoProvider>();
            _loggerMock = new Mock<ILogger<MySqlBackupService>>();

            _backupConfig = Options.Create(new BackupConfig
            {
                BackupPath = "TestBackups"
            });

            _backupDir = Path.Combine(AppContext.BaseDirectory, "TestBackups");
            if (!Directory.Exists(_backupDir))
            {
                Directory.CreateDirectory(_backupDir);
            }

            _backupService = new MySqlBackupService(_backupConfig, _infoProviderMock.Object, _loggerMock.Object);
        }

        public void Dispose()
        {
            if (Directory.Exists(_backupDir))
            {
                Directory.Delete(_backupDir, true);
            }
        }

        [Fact]
        public async Task ApplySnapshot_ShouldThrowBadRequest_WhenSnapshotDoesNotExist()
        {
            // Act & Assert
            var act = async () => await _backupService.ApplySnapshot("invalid_snapshot.sql");
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Snapshot không tồn tại");
        }

        [Fact]
        public async Task DeleteSnapshot_ShouldReturnSuccess()
        {
            // Act
            var result = await _backupService.DeleteSnapshot("some_snapshot.sql");

            // Assert
            result.Should().BeOfType<ApiSuccessResult<string>>();
            result.Data.Should().Be("some_snapshot.sql");
        }

        [Fact]
        public async Task GetAllSnapshots_ShouldReturnEmpty_WhenNoFiles()
        {
            // Act
            var result = await _backupService.GetAllSnapshots();

            // Assert
            result.Should().BeOfType<ApiSuccessResult<BackupInfoDTO[]>>();
            result.Data.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllSnapshots_ShouldReturnFiles()
        {
            // Arrange
            var filePath = Path.Combine(_backupDir, "test_backup.sql");
            await File.WriteAllTextAsync(filePath, "dummy content");

            try
            {
                // Act
                var result = await _backupService.GetAllSnapshots();

                // Assert
                result.Should().BeOfType<ApiSuccessResult<BackupInfoDTO[]>>();
                result.Data.Should().HaveCount(1);
                result.Data[0].Name.Should().Be("test_backup");
            }
            finally
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }
        }
    }
}
