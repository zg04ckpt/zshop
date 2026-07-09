using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Entities.ChatFeature;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Services;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Core.Tests.Services
{
    public class ChatServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IConversationRepository> _conversationRepositoryMock;
        private readonly Mock<IRepository<Message>> _messageRepositoryMock;
        private readonly ChatConnnectionStoreService _store;
        private readonly ChatService _chatService;

        public ChatServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _conversationRepositoryMock = new Mock<IConversationRepository>();
            _messageRepositoryMock = new Mock<IRepository<Message>>();
            
            _store = new ChatConnnectionStoreService();

            _unitOfWorkMock.Setup(u => u.Conversations).Returns(_conversationRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<Conversation>()).Returns(_conversationRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<Message>()).Returns(_messageRepositoryMock.Object);

            _chatService = new ChatService(_unitOfWorkMock.Object, _store);
        }

        [Fact]
        public async Task SendMessageAsync_ShouldThrowBadRequest_WhenConversationDoesNotExist()
        {
            // Arrange
            var conversationId = Guid.NewGuid();
            _conversationRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Conversation, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            var act = async () => await _chatService.SendMessageAsync(conversationId, "Hello", MessageType.User);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Hội thoại không tồn tại");
        }

        [Fact]
        public async Task SendMessageAsync_ShouldReturnMessage_WhenConversationExists()
        {
            // Arrange
            var conversationId = Guid.NewGuid();
            _conversationRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Conversation, bool>>>()))
                .ReturnsAsync(true);

            // Act
            var result = await _chatService.SendMessageAsync(conversationId, "Hello", MessageType.User);

            // Assert
            result.Should().NotBeNull();
            result.Content.Should().Be("Hello");
            result.Type.Should().Be(MessageType.User);
            _messageRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Message>()), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task StartConversationAsync_ShouldThrowBadRequest_WhenNameAndUserIdAreNull()
        {
            // Act & Assert
            var act = async () => await _chatService.StartConversationAsync(null, null);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Hội thoại cần bắt đầu với tên khách hàng/mã user");
        }

        [Fact]
        public async Task StartConversationAsync_ShouldReturnExistingConversation_WhenUserIdExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var existingConversationDto = new ConversationDTO { Id = Guid.NewGuid(), UserId = userId };
            
            _conversationRepositoryMock.Setup(x => x.GetFirstAsync(
                It.IsAny<Expression<Func<Conversation, bool>>>(), 
                It.IsAny<Expression<Func<Conversation, ConversationDTO>>>()))
                .ReturnsAsync(existingConversationDto);

            // Act
            var result = await _chatService.StartConversationAsync(null, userId);

            // Assert
            result.Should().BeOfType<ApiSuccessResult<ConversationDTO>>();
            result.Data.Should().Be(existingConversationDto);
            _conversationRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Conversation>()), Times.Never);
        }
    }
}
