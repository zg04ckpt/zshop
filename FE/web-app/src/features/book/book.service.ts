import { serverApi } from "../../shared/configs/axios.config";
import { convertToFormData } from "../../shared/helper";
import { ApiResult } from "../../shared/model/api-result.model";
import { CategoryDTO, CategoryListItemDTO } from "./book.model";

export class BookService {
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
}