import { PermPhoneMsg } from "@mui/icons-material";
import { AddressItemDTO } from "./user";
import { Paginated } from "./api";
import { VoucherDetailDTO } from "./voucher";

export interface OrderDTO {
    id: string;
    items: {
        bookId: string;
        title: string;
        quantity: number;
        price: number;
    }[];
    voucherId: string|null;
    addressId: string|null;
    paymentMethod: PaymentMethod;
}

export type OrderStatus = 'Created'|'Placed'|'Accepted'|'InProgress'|'Shipping'|'Delivered'|'Cancelled';
export type PaymentStatus = 'Unpaid'|'Paid'|'Failed';
export type PaymentMethod = 'CashOnDelivery'|'VNPay';
export type TransactionStatus = 'Processing'|'Success'|'Success';

export interface TransactionDetailDTO {
    id: string;
    orderId: string;
    createdAt: Date;
    status: TransactionStatus;
    note: string|null;
    amount: number
}

export interface OrderHistoryListItemDTO
{
    id: string;
    updatedAt: Date;
    orderDate: Date;
    totalAmount: number;
    currency: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
}

export type OrderHistoryDetailDTO = OrderHistoryListItemDTO & {
    items: {
        bookId: string;
        title: string;
        quantity: number;
        price: number;
    }[]
    userId: string;
    totalDiscount: number;
    address: AddressItemDTO;
    paymentMethod: PaymentMethod;
    voucher: VoucherDetailDTO|null;
    transactions: TransactionDetailDTO[];
}

export interface CancelOrderRequest {
    orderId: string;
    reason: string;
}

export interface CancelOrderRequestListItemDTO
{
    id: number;
    orderId: string;
    amount: number;
    currency: string;
    reason: string;
    createdAt: Date;
}

export interface SystemOrderSearchDTO {
    page: number;
    size: number;
    status: OrderStatus|null;
    startDate: Date;
    endDate: Date;
}


export interface SystemOrdersDTO extends Paginated<OrderHistoryListItemDTO> {
    totalOrderAmount: number;
    totalPaidAmount: number;
}