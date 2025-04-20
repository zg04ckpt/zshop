import { useState } from "react";
import { createBookApi, createNewCategoryApi, deleteBookApi, getBookDetailApi, getBooksAsListApi, getCategoriesAsListItemApi, removeCategoryApi, updateBookApi, updateCategoryApi } from "../services/bookApi";
import { BookDetailDTO, BookDTO, BookListItemDTO, BookSearchDTO, CategoryDTO, CategoryListItemDTO } from "..";
import { Paginated, showErrorToast, showSuccessToast } from "../../shared";

interface BookContextType {
    apiLoading: boolean;
    getCategoriesAsListItem: () => Promise<CategoryListItemDTO[]>;
    createNewCategory:  (data: CategoryDTO) => Promise<boolean>;
    updateCategory: (id: number, data: CategoryDTO) => Promise<boolean>;
    removeCategory: (id: number) => Promise<boolean>;
    getBooksAsListItem: (data: BookSearchDTO) => Promise<Paginated<BookListItemDTO>|null>;
    createNewBook: (data: BookDTO) => Promise<boolean>;
    updateBook: (id: string, data: BookDTO) => Promise<boolean>;
    removeBook: (id: string) => Promise<boolean>;
    getBookDetail: (id: string) => Promise<BookDetailDTO|null>;
}

export const useBook = (): BookContextType => {
    const [apiLoading, setApiLoading] = useState<boolean>(false);

    const getCategoriesAsListItem = async (): Promise<CategoryListItemDTO[]> => {
        setApiLoading(true);
        const res = await getCategoriesAsListItemApi();
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            // showErrorToast(res.message ?? 'Lỗi không xác định');
            return [];
        }
    }

    const createNewCategory = async (data: CategoryDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await createNewCategoryApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const updateCategory = async (id: number, data: CategoryDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await updateCategoryApi(id, data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const removeCategory = async (id: number): Promise<boolean> => {
        setApiLoading(true);
        const res = await removeCategoryApi(id);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const getBooksAsListItem = async (data: BookSearchDTO): Promise<Paginated<BookListItemDTO>|null> => {
        setApiLoading(true);
        const res = await getBooksAsListApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getBookDetail = async (id: string): Promise<BookDetailDTO|null> => {
        setApiLoading(true);
        const res = await getBookDetailApi(id);
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            return null;
        }
    }


    const createNewBook = async (data: BookDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await createBookApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const updateBook = async (id: string, data: BookDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await updateBookApi(id, data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const removeBook = async (id: string): Promise<boolean> => {
        setApiLoading(true);
        const res = await deleteBookApi(id);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    return {
        apiLoading,
        getCategoriesAsListItem, createNewCategory, updateCategory, removeCategory, 
        getBooksAsListItem, createNewBook, updateBook, removeBook, getBookDetail
    }
}