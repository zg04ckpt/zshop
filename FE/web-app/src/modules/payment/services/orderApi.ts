import { data } from "react-router-dom";
import { OrderDTO } from "..";
import { ApiResult, serverApi } from "../../shared";

export const createOrderApi = async (bookId: string): Promise<ApiResult<string>> => {
    try {
        return (await serverApi.post<ApiResult<string>>(`/payment/orders?bookId=${bookId}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const confirmOrderApi = async (orderId: string): Promise<ApiResult<OrderDTO>> => {
    try {
        return (await serverApi.get<ApiResult<OrderDTO>>(`/payment/orders/${orderId}/confirm`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const payOrderApi = async (orderId: string, data: OrderDTO): Promise<ApiResult<string>> => {
    try {
        return (await serverApi.post<ApiResult<string>>(`/payment/orders/${orderId}/pay`, data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}


