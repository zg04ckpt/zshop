import qs from "qs";
import { BookDetailDTO, BookDTO, BookListItemDTO, BookSearchDTO, CategoryDTO, CategoryListItemDTO } from "..";
import { serverApi, ApiResult, convertToFormData, Paginated } from "../../shared";

//#region Book
export const getBooksAsListApi = async (data: BookSearchDTO): Promise<ApiResult<Paginated<BookListItemDTO>>> => {
    try {
        return (await serverApi.get<ApiResult<Paginated<BookListItemDTO>>>(
            `/books`, 
            { params: data, paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })}
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getBookDetailApi = async (id: string): Promise<ApiResult<BookDetailDTO>> => {
    try {
        return (await serverApi.get<ApiResult<BookDetailDTO>>(`/books/${id}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const createBookApi = async (data: BookDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(
            `/management/book`, 
            convertToFormData(data)
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const updateBookApi = async (id: string, data: BookDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.put<ApiResult>(
            `/management/book/${id}`, 
            convertToFormData(data)
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const deleteBookApi = async (id: string): Promise<ApiResult> => {
    try {
        return (await serverApi.delete<ApiResult>(`/management/book/${id}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}


//#endregion


//#region Category
export const getCategoriesAsListItemApi = async (): Promise<ApiResult<CategoryListItemDTO[]>> => {
    try {
        debugger
        return (await serverApi.get<ApiResult<CategoryListItemDTO[]>>(`/management/book/categories`)).data;
    } catch (err: any) {
        console.log(err);
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const createNewCategoryApi = async (data: CategoryDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(
            `/management/book/categories`, 
            convertToFormData(data)
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const updateCategoryApi = async (id: number, data: CategoryDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.put<ApiResult>(
            `/management/book/categories/${id}`, 
            convertToFormData(data)
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const removeCategoryApi = async (id: number): Promise<ApiResult> => {
    try {
        return (await serverApi.delete<ApiResult>(`/management/book/categories/${id}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}
//#endregion