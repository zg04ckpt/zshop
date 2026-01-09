import { del, get, post } from "./config/axios";
import { CartDTO, PayCartDTO } from "../types/cart";
import { endpoints } from "./config/endpoints";

export const getCart = async () => {
    return await get<CartDTO>(endpoints.cart.root);
};

export const addBookToCart = async (bookId: string) => {
    return await post(endpoints.cart.items, { bookId });
};

export const removeBookFromCart = async (bookId: string) => {
    return await del(endpoints.cart.item(bookId));
};

export const payCart = async (data: PayCartDTO) => {
    return await post<string>(endpoints.cart.pay, data);
};
