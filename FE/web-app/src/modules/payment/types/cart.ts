export interface CartListItemDTO
{
    bookId: string;
    bookTitle: string;
    quantity: number;
    price: number;
    bookCover: string
}

export interface CartDTO
{
    id: string;
    updatedAt: Date;
    items: CartListItemDTO[];
}

export interface PayCartDTO {
    items: {
        bookId: string;
        quantity: number;
    } []
}