import qs from "qs";
import { BookDetailDTO, BookDTO, BookListItemDTO, BookReviewListItemDTO, BookSearchDTO, BoughtBookListItemDTO, CategoryDTO, CategoryListItemDTO, CreateBookReviewDTO } from "..";
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

export const getBooksAsListManagementApi = async (data: BookSearchDTO): Promise<ApiResult<Paginated<BookDetailDTO>>> => {
    try {
        return (await serverApi.get<ApiResult<Paginated<BookDetailDTO>>>(
            `/management/book`, 
            { params: data, paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })}
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const createBookReviewApi = async (data: CreateBookReviewDTO) => {
    try {
        // const formData = new FormData();
        // formData.append('bookId', data.bookId);
        // formData.append('content', data.content);
        // formData.append('rate', data.rate.toString());
        // data.images.forEach(e => {
        //     formData.append('images', e);
        // })
        return (await serverApi.post<ApiResult>(
            `/books/review`,
            convertToFormData(data)
        )).data;
    } catch (err) {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getBookReviewsApi = async (id: string, page: number, size: number): Promise<ApiResult<BookReviewListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<BookReviewListItemDTO[]>>(
            `/books/${id}/reviews?page=${page}&size=${size}`)
        ).data;
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

export const getTopSellBookApi = async (): Promise<ApiResult<BookListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<BookListItemDTO[]>>(`/books/top-sell`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getRandomBookApi = async (): Promise<ApiResult<BookListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<BookListItemDTO[]>>(`/books/explorer`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getNewestBookApi = async (): Promise<ApiResult<BookListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<BookListItemDTO[]>>(`/books/newest`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getBoughtBooksApi = async (): Promise<ApiResult<BoughtBookListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<BoughtBookListItemDTO[]>>(`/books/purchased`)).data;
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
        return (await serverApi.get<ApiResult<CategoryListItemDTO[]>>(`books/categories`)).data;
    } catch (err: any) {
        console.log(err);
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getTopCateApi = async (): Promise<ApiResult<CategoryListItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<CategoryListItemDTO[]>>(`books/categories/top-sell`)).data;
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