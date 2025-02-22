import { data } from "react-router-dom";
import { serverApi } from "../../shared/configs/axios.config";
import { convertToFormData } from "../../shared/helper";
import { ApiResult } from "../../shared/model/api-result.model";
import { Paginated } from "../../shared/model/base-paging.model";
import { BookDTO, BookListItemDTO, BookSearchDTO, CategoryDTO, CategoryListItemDTO } from "./book.model";
import qs from "qs";

export class BookService {

    getBooksAsList = async (data: BookSearchDTO): Promise<Paginated<BookListItemDTO>> => {
        const res = await serverApi.get<ApiResult<Paginated<BookListItemDTO>>>(
            `/management/book`, 
            { params: data, paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })}
        );
        const books = res.data.data!;
        books.data.forEach(e => {
            e.updatedAt = new Date(e.updatedAt);
            e.createdAt = new Date(e.createdAt);
            e.publishDate = new Date(e.publishDate);
        });
        return res.data.data!;
    }

    createBook = async (data: BookDTO): Promise<void> => {
        await serverApi.post<ApiResult>(`/management/book`, convertToFormData(data));
    }

    updateBook = async (id: string, data: BookDTO) => {
        await serverApi.put<ApiResult>(`/management/book/${id}`, convertToFormData(data));
    }

    deleteBook = async (id: string) => {
        await serverApi.delete<ApiResult>(`/management/book/${id}`);
    }

    //#region Category
    getCategoriesAsListItem = async (): Promise<CategoryListItemDTO[]> => {
        const res = await serverApi.get<ApiResult<CategoryListItemDTO[]>>(`/management/book/categories`);
        const cates = res.data.data!;
        cates.forEach(e => e.updatedAt = new Date(e.updatedAt))
        return cates
    }

    createNewCategory = async (data: CategoryDTO): Promise<void> => {
        await serverApi.post<ApiResult>(`/management/book/categories`, convertToFormData(data));
    }

    updateCategory = async (id: number, data: CategoryDTO): Promise<void> => {
        await serverApi.put<ApiResult>(`/management/book/categories/${id}`, convertToFormData(data));
    }

    removeCategory = async (id: number): Promise<void> => {
        await serverApi.delete<ApiResult>(`/management/book/categories/${id}`);
    }

    //#endregion
}