using Core.DTOs.Rag;
using Core.Entities.BookFeature;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Services;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Core.Tests.Services
{
    public class RagOrchestratorServiceTests
    {
        private readonly Mock<IRagAiService> _aiServiceMock;
        private readonly Mock<IVectorDbService> _vectorDbServiceMock;
        private readonly Mock<IUnitOfWork> _uowMock;
        
        private readonly Mock<IRepository<Book>> _bookRepoMock;
        private readonly Mock<IRepository<Category>> _categoryRepoMock;
        private readonly Mock<IRepository<BookVectorSync>> _syncRepoMock;

        private readonly RagOrchestratorService _service;

        public RagOrchestratorServiceTests()
        {
            _aiServiceMock = new Mock<IRagAiService>();
            _vectorDbServiceMock = new Mock<IVectorDbService>();
            _uowMock = new Mock<IUnitOfWork>();

            _bookRepoMock = new Mock<IRepository<Book>>();
            _categoryRepoMock = new Mock<IRepository<Category>>();
            _syncRepoMock = new Mock<IRepository<BookVectorSync>>();

            _uowMock.Setup(u => u.Repository<Book>()).Returns(_bookRepoMock.Object);
            _uowMock.Setup(u => u.Repository<Category>()).Returns(_categoryRepoMock.Object);
            _uowMock.Setup(u => u.Repository<BookVectorSync>()).Returns(_syncRepoMock.Object);

            _service = new RagOrchestratorService(
                _aiServiceMock.Object, 
                _vectorDbServiceMock.Object, 
                _uowMock.Object);
        }

        [Fact]
        public async Task SyncBooksAsync_ShouldReturnEarly_WhenListIsEmpty()
        {
            // Act
            await _service.SyncBooksAsync(new List<Guid>());

            // Assert
            _vectorDbServiceMock.Verify(x => x.EnsureCollectionExistsAsync(), Times.Never);
        }

        [Fact]
        public async Task SyncBooksAsync_ShouldGenerateAndUpsertVectors()
        {
            // Arrange
            var bookId = Guid.NewGuid();
            var bookIds = new List<Guid> { bookId };
            var books = new List<Book>
            {
                new Book { Id = bookId, Name = "Test Book", Author = "Author", Price = 100, Currency = "VND", Description = "Desc" }
            };

            _bookRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<Book, bool>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<Book, object>>>(), It.IsAny<bool?>(), It.IsAny<Expression<Func<Book, object>>[]>()))
                .ReturnsAsync(books);
                
            _categoryRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<Category, bool>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<Category, object>>>(), It.IsAny<bool?>(), It.IsAny<Expression<Func<Category, object>>[]>()))
                .ReturnsAsync(new List<Category>());

            _aiServiceMock.Setup(x => x.GetEmbeddingAsync(It.IsAny<string>()))
                .ReturnsAsync(new float[] { 0.1f, 0.2f });

            // Act
            await _service.SyncBooksAsync(bookIds);

            // Assert
            _vectorDbServiceMock.Verify(x => x.EnsureCollectionExistsAsync(), Times.Once);
            _vectorDbServiceMock.Verify(x => x.UpsertVectorAsync(bookId, It.IsAny<ReadOnlyMemory<float>>(), It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task ChatWithRagAsync_ShouldReturnResponse()
        {
            // Arrange
            var bookId = Guid.NewGuid();
            var keywordVector = new float[] { 0.5f, 0.5f };
            
            _aiServiceMock.Setup(x => x.ExtractKeywordsAsync(It.IsAny<string>()))
                .ReturnsAsync("keyword");
            _aiServiceMock.Setup(x => x.GetEmbeddingAsync("keyword"))
                .ReturnsAsync(keywordVector);
                
            _vectorDbServiceMock.Setup(x => x.SearchSimilarAsync(It.IsAny<ReadOnlyMemory<float>>(), 3, 0.5f))
                .ReturnsAsync(new List<Guid> { bookId });

            var books = new List<Book>
            {
                new Book { Id = bookId, Name = "Test Book", Price = 1000, Currency = "VND", Description = "Desc", Cover = "img.png" }
            };
            
            _bookRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<Book, bool>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<Book, object>>>(), It.IsAny<bool?>(), It.IsAny<Expression<Func<Book, object>>[]>()))
                .ReturnsAsync(books);

            _aiServiceMock.Setup(x => x.GenerateAnswerAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync("This is AI answer");

            // Act
            var result = await _service.ChatWithRagAsync("Hello");

            // Assert
            result.Should().NotBeNull();
            result.AiMessage.Should().Be("This is AI answer");
            result.SuggestedBooks.Should().HaveCount(1);
            result.SuggestedBooks[0].Id.Should().Be(bookId);
            result.SuggestedBooks[0].Name.Should().Be("Test Book");
        }
        
        [Fact]
        public async Task RunAutoSyncBatchAsync_ShouldDeleteVectors_WhenBooksAreHardDeleted()
        {
            // Arrange
            var deletedBookId = Guid.NewGuid();
            
            var allSyncs = new List<BookVectorSync>
            {
                new BookVectorSync { BookId = deletedBookId }
            };
            var allBooks = new List<Book>(); // Empty, meaning book was deleted

            _syncRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<BookVectorSync, bool>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<BookVectorSync, object>>>(), It.IsAny<bool?>(), It.IsAny<Expression<Func<BookVectorSync, object>>[]>()))
                .ReturnsAsync(allSyncs);
            _bookRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<Book, bool>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<Book, object>>>(), It.IsAny<bool?>(), It.IsAny<Expression<Func<Book, object>>[]>()))
                .ReturnsAsync(allBooks);

            // Act
            await _service.RunAutoSyncBatchAsync();

            // Assert
            _vectorDbServiceMock.Verify(x => x.DeleteVectorsAsync(It.Is<List<Guid>>(l => l.Contains(deletedBookId))), Times.Once);
            _syncRepoMock.Verify(x => x.DeleteAsync(It.IsAny<BookVectorSync>()), Times.Once);
            _uowMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }
    }
}
