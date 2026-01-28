import { del, get, post, put } from "./config/axios";
import { Paginated } from "../types/api";
import { BookToReviewListItemDTO } from "../types/book";
import { 
    OrderDTO, 
    OrderHistoryListItemDTO, 
    OrderHistoryDetailDTO, 
    CancelOrderRequest,
    CancelOrderRequestListItemDTO,
    SystemOrderSearchDTO,
    SystemOrdersDTO,
    OrderStatus
} from "../types/order";
import { endpoints } from "./config/endpoints";
import { toQueryParams } from "../utils/helper";

export const getBooksInOrder = async (orderId: string) => {
    return await get<BookToReviewListItemDTO[]>(endpoints.order.booksInOrder(orderId));
};

export const getOrderHistory = async (page: number, size: number) => {
    return await get<Paginated<OrderHistoryListItemDTO>>(`${endpoints.order.history}?pageIndex=${page}&pageSize=${size}`);
};

export const getOrderHistoryDetail = async (orderId: string) => {
    return await get<OrderHistoryDetailDTO>(endpoints.order.historyDetail(orderId));
};

export const createOrder = async (bookId: string) => {
    return await post<string>(endpoints.order.create(bookId), {});
};

export const confirmOrder = async (orderId: string) => {
    return await get<OrderDTO>(endpoints.order.confirm(orderId));
};

export const payOrder = async (orderId: string, data: OrderDTO) => {
    return await post<string>(endpoints.order.pay(orderId), data);
};

export const cancelOrder = async (data: CancelOrderRequest) => {
    return await post<string>(endpoints.order.cancel(data.orderId), { reason: data.reason });
};

export const getAllCancelOrderRequests = async (page: number) => {
    return await get<Paginated<CancelOrderRequestListItemDTO>>(`${endpoints.orderManagement.cancelRequests}?page=${page}`);
};

export const acceptOrRejectCancelOrderRequest = async (requestId: number, isAccept: boolean) => {
    return await del(endpoints.orderManagement.cancelRequest(requestId, isAccept));
};

export const getSystemOrders = async (data: SystemOrderSearchDTO) => {
    const queryParams = toQueryParams(data);
    return await get<SystemOrdersDTO>(`${endpoints.orderManagement.root}?${queryParams}`);
};

export const setOrderStatus = async (orderId: string, status: OrderStatus) => {
    return await put(endpoints.orderManagement.setStatus(orderId), { status });
};
