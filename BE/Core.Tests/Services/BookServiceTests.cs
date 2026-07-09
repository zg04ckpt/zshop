using Core.DTOs.Book;
using Core.DTOs.Common;
using Core.Entities.BookFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Core.Tests.Services
{
    public class BookServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IStorageService> _storageServiceMock;
        private readonly Mock<IBookRepository> _bookRepositoryMock;
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
        private readonly BookService _bookService;

        public BookServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _storageServiceMock = new Mock<IStorageService>();
            _bookRepositoryMock = new Mock<IBookRepository>();
            _categoryRepositoryMock = new Mock<ICategoryRepository>();

            _unitOfWorkMock.Setup(u => u.Books).Returns(_bookRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Categories).Returns(_categoryRepositoryMock.Object);

            _bookService = new BookService(
                _storageServiceMock.Object,
                _unitOfWorkMock.Object);
        }

        [Fact]
        public async Task CreateBook_ShouldThrowBadRequest_WhenNameExists()
        {
            // Arrange
            var dto = new BookDTO { Name = "Existing Book", CategoryIds = new int[] { 1 } };
            _bookRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Book, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            var act = async () => await _bookService.CreateBook(dto);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Tên đã tồn tại.");
        }

        [Fact]
        public async Task CreateBook_ShouldReturnSuccess_WhenDataIsValid()
        {
            // Arrange
            var coverFileMock = new Mock<IFormFile>();
            var imageFileMock = new Mock<IFormFile>();
            var dto = new BookDTO 
            { 
                Name = "New Book", 
                CategoryIds = new int[] { 1 }, 
                Cover = coverFileMock.Object,
                Images = new List<CreateOrUpdateBookImageListItemDTO> { new CreateOrUpdateBookImageListItemDTO(), new CreateOrUpdateBookImageListItemDTO(), new CreateOrUpdateBookImageListItemDTO() }
            };
            
            _bookRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Book, bool>>>()))
                .ReturnsAsync(false);
            _storageServiceMock.Setup(x => x.SaveImage(It.IsAny<IFormFile>()))
                .ReturnsAsync("http://url/image.jpg");

            // Act
            var result = await _bookService.CreateBook(dto);

            // Assert
            result.Should().BeOfType<ApiSuccessResult>();
            _bookRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Book>()), Times.Once);
            _bookRepositoryMock.Verify(x => x.AddToCategory(It.IsAny<Guid>(), dto.CategoryIds), Times.Once);
            _bookRepositoryMock.Verify(x => x.CreateOrUpdateBookImages(It.IsAny<Guid>(), dto.Images, _storageServiceMock.Object), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteBook_ShouldReturnSuccess_WhenBookExists()
        {
            // Arrange
            var bookId = Guid.NewGuid();
            var book = new Book { Id = bookId, Cover = "cover_url" };

            _bookRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Book, bool>>>()))
                .ReturnsAsync(book);
            _storageServiceMock.Setup(x => x.RemoveImage("cover_url")).ReturnsAsync(true);

            // Act
            var result = await _bookService.DeleteBook(bookId.ToString());

            // Assert
            result.Should().BeOfType<ApiSuccessResult>();
            _bookRepositoryMock.Verify(x => x.DeleteAsync(book), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
            _storageServiceMock.Verify(x => x.RemoveImage("cover_url"), Times.Once);
        }

        [Fact]
        public async Task CreateCategory_ShouldThrowBadRequest_WhenNameExists()
        {
            // Arrange
            var dto = new CategoryDTO { Name = "Category 1" };
            _categoryRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Category, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            var act = async () => await _bookService.CreateCategory(dto);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Tên danh mục đã tồn tại.");
        }
    }
}
