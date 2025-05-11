import { data } from "react-router-dom";
import { CancelOrderRequest, CancelOrderRequestListItemDTO, OrderDTO, OrderHistoryDetailDTO, 
    OrderHistoryListItemDTO, OrderStatus, SystemOrdersDTO, SystemOrderSearchDTO } from "..";
import { ApiResult, convertToFormData, objectToHttpParam, Paginated, serverApi } from "../../shared";
import QueryString from "qs";
import { BookToReviewListItemDTO } from "../../book";

export const getBooksInOrderApi = async (orderId: string) => {
    try {
        return (await serverApi.get<ApiResult<BookToReviewListItemDTO[]>>(
            `/payment/orders/${orderId}/books`
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getOrderHistoryApi = async (page: number , size: number) => {
    try {
        return (await serverApi.get<ApiResult<Paginated<OrderHistoryListItemDTO>>>(
            `/payment/orders/history`,
            { params: { page, size } }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getOrderHistoryDetailApi = async (orderId: string) => {
    try {
        return (await serverApi.get<ApiResult<OrderHistoryDetailDTO>>(
            `/payment/orders/history/${orderId}/detail`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

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

export const cancelOrderApi = async (data: CancelOrderRequest): Promise<ApiResult<string>> => {
    try {
        return (await serverApi.post<ApiResult<string>>(
            `/payment/orders/${data.orderId}/cancel`, {reason: data.reason})).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getAllCancelOrderRequestApi = async (page: number) => {
    try {
        return (await serverApi.get<ApiResult<Paginated<CancelOrderRequestListItemDTO>>>(
            `management/payment/cancel-order-requests?page=${page}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const acceptOrRejectCancelOrderRequestApi = async (requestId: number, isAccept: boolean) => {
    try {
        return (await serverApi.delete<ApiResult>(
            `management/payment/cancel-order-requests/${requestId}?isAccepted=${isAccept}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getSystemOrderApi = async (data: SystemOrderSearchDTO) => {
    try {
        return (await serverApi.get<ApiResult<SystemOrdersDTO>>(
            `management/payment/orders`,
            { params: data, paramsSerializer: p => QueryString.stringify(p, { skipNulls: true }) }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const setOrderStatusApi = async (orderId: string, status: OrderStatus) => {
    try {
        return (await serverApi.put<ApiResult>(
            `management/payment/orders/${orderId}/status`,
            {
                status: status
            }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}


