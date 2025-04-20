import { CartDTO, PayCartDTO } from "..";
import { ApiResult, serverApi } from "../../shared";

export const getCartApi = async (): Promise<ApiResult<CartDTO>> => {
    try {
        return (await serverApi.get<ApiResult<CartDTO>>(`/cart`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const addBookToCartApi = async (bookId: string): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(`/cart/items`, { bookId })).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const payCartApi = async (data: PayCartDTO): Promise<ApiResult<string>> => {
    try {
        return (await serverApi.post<ApiResult<string>>(`/cart/pay`, data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const removeBookFromCartApi = async (bookId: string): Promise<ApiResult> => {
    try {
        return (await serverApi.delete<ApiResult>(`/cart/items/${bookId}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}