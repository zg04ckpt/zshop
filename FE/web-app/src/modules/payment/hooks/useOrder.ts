import { useState } from "react";
import { createOrderApi, confirmOrderApi, OrderDTO, payOrderApi } from "..";
import { showErrorToast } from "../../shared";

interface OrderContextType {
    orderApiLoading: boolean;
    createNewOrder: (bookId: string) => Promise<string|null>;
    confirmOrder: (orderId: string) => Promise<OrderDTO|null>;
    payOrder: (orderId: string, data: OrderDTO) => Promise<string|null>;
}

export const useOrder = (): OrderContextType => {
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

    return {
        orderApiLoading,
        createNewOrder,
        confirmOrder,
        payOrder
    }
}