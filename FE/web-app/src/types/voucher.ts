import { BasePaging } from "./api"

export enum DiscountType {
    Percentage = 'Percentage',
    Amount = 'Amount'
}

export enum VoucherStatus {
    Created = 'Created',   
    Effective = 'Effective',
    Expired = 'Expired'
}

export interface VoucherDetailDTO {
    id: string,
    name: string,
    code: string,
    discountType: DiscountType,
    status: VoucherStatus,
    discount: number,
    maxDiscount: number,
    quantity: number|null,
    isActive: boolean,
    remainingQuantity: number|null,
    validFrom: Date,
    validUntil: Date
}

export interface VoucherListItemDTO {
    id: string,
    name: string,
}

export interface CreateVoucherDTO {
    name: string,
    discountType: DiscountType,
    discount: number,
    maxDiscount: number,
    quantity: number|null,
    validFrom: string,
    duration: string
}

export interface SearchVoucherDTO extends BasePaging {
    name: string|null,
    code: string|null,
    start: Date|null,
    end: Date|null
}