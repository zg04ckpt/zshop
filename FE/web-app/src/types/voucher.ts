export interface VoucherDetailDTO {
    id: string,
    name: string,
    code: string,
    discountType: 'Percentage'|'Amount',
    status: 'Created'|'Active'|'Inactive'|'Expired',
    discount: number,
    maxDiscount: number,
    quantity: number|null,
    remainingQuantity: number|null,
    validFrom: Date,
    validUtil: Date
}

export interface VoucherListItemDTO {
    id: string,
    name: string,
}

export interface CreateVoucherDTO {
    name: string,
    discountType: 'Percentage'|'Amount',
    discount: number,
    maxDiscount: number,
    quantity: number|null,
    remainingQuantity: number|null,
    validFrom: Date,
    duration: string
}

export interface SearchVoucherDTO {
    name: string|null,
    code: string|null,
    start: Date,
    end: Date
}