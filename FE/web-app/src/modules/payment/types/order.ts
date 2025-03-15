export interface OrderDTO {
    id: string;
    items: {
        bookId: string;
        title: string;
        quantity: number;
        price: number;
    }[];
    addressId: string|null;
    paymentMethod: 'CashOnDelivery'|'VNPay';
}