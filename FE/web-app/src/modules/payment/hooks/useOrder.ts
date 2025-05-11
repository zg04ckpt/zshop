import { useState } from "react";
import { createOrderApi, confirmOrderApi, OrderDTO, payOrderApi, OrderHistoryListItemDTO, getOrderHistoryApi, OrderHistoryDetailDTO, getOrderHistoryDetailApi, CancelOrderRequest, cancelOrderApi, getAllCancelOrderRequestApi, CancelOrderRequestListItemDTO, acceptOrRejectCancelOrderRequestApi, SystemOrderSearchDTO, SystemOrdersDTO, getSystemOrderApi, OrderStatus, setOrderStatusApi } from "..";
import { Paginated, showErrorToast } from "../../shared";

interface OrderContextType {
    orderApiLoading: boolean;
    getOrderHistory: (page: number, size: number) => Promise<Paginated<OrderHistoryListItemDTO>|null>;
    getOrderHistoryDetail: (orderId: string) => Promise<OrderHistoryDetailDTO|null>;
    createNewOrder: (bookId: string) => Promise<string|null>;
    confirmOrder: (orderId: string) => Promise<OrderDTO|null>;
    payOrder: (orderId: string, data: OrderDTO) => Promise<string|null>;
}

export const useOrder = () => {
    const [orderApiLoading, setApiLoading] = useState<boolean>(false);

    const createNewOrder = async (bookId: string): Promise<string|null> => {
        setApiLoading(true);
        const res = await createOrderApi(bookId);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const confirmOrder = async (orderId: string): Promise<OrderDTO|null> => {
        setApiLoading(false);
        const res = await confirmOrderApi(orderId);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const payOrder = async (orderId: string, data: OrderDTO): Promise<string|null> => {
        setApiLoading(false);
        const res = await payOrderApi(orderId, data);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getOrderHistory = async (page: number, size: number): Promise<Paginated<OrderHistoryListItemDTO>|null> => {
        setApiLoading(false);
        const res = await getOrderHistoryApi(page, size);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getOrderHistoryDetail = async (orderId: string): Promise<OrderHistoryDetailDTO|null> => {
        setApiLoading(false);
        const res = await getOrderHistoryDetailApi(orderId);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const cancelOrder = async (data: CancelOrderRequest): Promise<string|null> => {
        setApiLoading(false);
        const res = await cancelOrderApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.message!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getListCancelOrderRequest = async (page: number): Promise<Paginated<CancelOrderRequestListItemDTO>|null> => {
        setApiLoading(false);
        const res = await getAllCancelOrderRequestApi(page);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const allowCancelOrderRequest = async (requestId: number, isAccept: boolean): Promise<boolean> => {
        setApiLoading(false);
        const res = await acceptOrRejectCancelOrderRequestApi(requestId, isAccept);
        setApiLoading(false);
        if (res.isSuccess) {
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const getSystemOrders = async (data: SystemOrderSearchDTO): Promise<SystemOrdersDTO|null> => {
        setApiLoading(false);
        const res = await getSystemOrderApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
        setApiLoading(false);
        const res = await setOrderStatusApi(orderId, status);
        setApiLoading(false);
        if (res.isSuccess) {
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    return {
        getOrderHistory,
        getOrderHistoryDetail,
        orderApiLoading,
        createNewOrder,
        confirmOrder,
        payOrder,
        cancelOrder,
        getListCancelOrderRequest,
        allowCancelOrderRequest,
        getSystemOrders,
        updateOrderStatus
    }
}