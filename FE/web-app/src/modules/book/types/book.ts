import { BasePaging } from "../../shared";

export interface CategoryDTO
{
    name: string;
    thumbnail: File|null;
    parentId: number;
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
    publishDate: Date|null;
    language: string;
    price: number;
    description: string;
    categoryIds: number[];
}

export interface BookListItemDTO
{
    id: string;
    cover: string;
    name: string;
    author: string;
    language: string;
    price: number;
    currency: string;
    avgRate: number;
    description: string;
    soldCount: number;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    categories: string[];
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
    publishDate: string;
    language: string;
    currency: string;
    description: string;
    soldCount: number;
    price: number;
    avgRate: number;
}