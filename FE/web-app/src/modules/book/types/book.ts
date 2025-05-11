import { BasePaging } from "../../shared";

export interface CategoryDTO
{
    name: string;
    thumbnail: File|null;
    parentId: number|null;
}

export interface CategoryListItemDTO
{
    id: number;
    name: string;
    thumbnail: string;
    parentId: number|null;
    parentName: number|null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategorySelectItemDTO
{
    id: number;
    name: string;
}

export interface BookDTO
{
    cover: File|null;
    name: string;
    author: string;
    publisher: string;
    publishYear: number;
    pageCount: number;
    language: string;
    price: number;
    stock: number;
    description: string;
    categoryIds: number[];
    images: {
        id: number|null,
        image: File|null
    }[]
}

export interface BookListItemDTO
{
    id: string;
    cover: string;
    name: string;
    price: number;
    currency: string;
    updatedAt: Date;
    avgRate: number;
    soldCount: number;
    stockCount: number;
    categories: string[];
}

export interface BoughtBookListItemDTO extends BookListItemDTO {
    purchaseCount: number;
    lastPurchasedAt: Date;
}

export interface BookToReviewListItemDTO 
{
    bookId: string;
    bookName: string;
    price: number;
    quantity: number;
    cover: string;
}

export interface BookReviewListItemDTO
{
    userId: string;
    userName: string;
    userAvatarUrl: string;
    createdAt: Date;
    rate: number;
    content: string;
    imageUrls: string[];
}

export interface CreateBookReviewDTO
{
    bookId: string;
    content: string;
    images: File[];
    rate: number;
}

export interface BookSearchDTO extends BasePaging
{
    name: string;
    minPrice: number|null;
    maxPrice: number|null;
    sortBy: string;
    order: string;
    categoryIds: number[];
}

export interface BookDetailDTO
{
    id: string;
    name: string;
    cover: string;
    author: string;
    categories: string[];
    images: {
        id: number,
        imageUrl: string
    }[];
    publisher: string;
    publishYear: number;
    pageCount: number;
    language: string;
    stockCount: number;
    currency: string;
    description: string;
    soldCount: number;
    price: number;
    avgRate: number;
    createdAt: Date;
    updatedAt: Date;
}