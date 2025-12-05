import { del, get, post, put } from "./config/axios";
import { Paginated } from "../types/api";
import { BookDetailDTO, BookDTO, BookListItemDTO, BookReviewListItemDTO, BookSearchDTO, BoughtBookListItemDTO, CategoryDTO, CategoryListItemDTO, CreateBookReviewDTO } from "../types/book";
import { endpoints } from "./config/endpoints";
import { convertToFormData, toQueryParams } from "../utils/helper";


export const getBooks = async (data: BookSearchDTO) => {
    const queryParams = toQueryParams(data);
    return await get<Paginated<BookListItemDTO>>(`${endpoints.book.root}?${queryParams}`);
}

export const getBooksForManagement = async (data: BookSearchDTO) => {
    const queryParams = toQueryParams(data);
    return await get<Paginated<BookDetailDTO>>(`${endpoints.bookManagement.root}?${queryParams}`);
};

export const getBookDetail = async (id: string) => {
    return await get<BookDetailDTO>(endpoints.book.detail(id));
};

export const createBook = async (data: BookDTO) => {
    return await post(endpoints.bookManagement.root, convertToFormData(data));
};

export const updateBook = async (id: string, data: BookDTO) => {
    return await put(endpoints.bookManagement.detail(id), convertToFormData(data));
};

export const deleteBook = async (id: string) => {
    return await del(endpoints.bookManagement.detail(id));
};

export const getTopSellBooks = async () => {
    return await get<BookListItemDTO[]>(endpoints.book.topSell);
};

export const getRandomBooks = async () => {
    return await get<BookListItemDTO[]>(endpoints.book.explorer);
};

export const getNewestBooks = async () => {
    return await get<BookListItemDTO[]>(endpoints.book.newest);
};

export const getBoughtBooks = async () => {
    return await get<BoughtBookListItemDTO[]>(endpoints.book.purchased);
};

export const getBookReviews = async (id: string, page: number, size: number) => {
    return await get<BookReviewListItemDTO[]>(endpoints.book.reviews(id, page, size));
};

export const createBookReview = async (data: CreateBookReviewDTO) => {
    return await post(endpoints.book.createReview, convertToFormData(data));
};

export const getCategories = async () => {
    return await get<CategoryListItemDTO[]>(endpoints.book.categories);
};

export const getTopCategories = async () => {
    return await get<CategoryListItemDTO[]>(endpoints.book.topCategories);
};

export const createCategory = async (data: CategoryDTO) => {
    return await post(endpoints.bookManagement.categories, convertToFormData(data));
};

export const updateCategory = async (id: number, data: CategoryDTO) => {
    return await put(endpoints.bookManagement.category(id), convertToFormData(data));
};

export const deleteCategory = async (id: number) => {
    return await del(endpoints.bookManagement.category(id));
};
