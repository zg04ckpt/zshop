import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { AuthService } from "../auth/auth.service";
import { UserService } from "../user/user.service";
import { BookDTO, BookListItemDTO, BookSearchDTO, CategoryDTO, CategoryListItemDTO } from "./book.model";
import { BookService } from "./book.service"
import { handleServerApiError } from "../../shared/configs/axios.config";
import { Paginated } from "../../shared/model/base-paging.model";

const useBook = () => {
    const bookService = new BookService();

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const userService = new UserService();
    const authService = new AuthService();

    const getCategoriesAsListItem = async (): Promise<CategoryListItemDTO[]> => {
        try {
            return await bookService.getCategoriesAsListItem();
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return [];
        }
    }

    const createNewCategory = async (data: CategoryDTO): Promise<boolean> => {
        try {
           await bookService.createNewCategory(data);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const updateCategory = async (id: number, data: CategoryDTO): Promise<boolean> => {
        try {
           await bookService.updateCategory(id, data);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const removeCategory = async (id: number): Promise<boolean> => {
        try {
           await bookService.removeCategory(id);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const getBooksAsListItem = async (data: BookSearchDTO): Promise<Paginated<BookListItemDTO>|null> => {
        try {
            return await bookService.getBooksAsList(data);
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return null;
        }
    }

    const createNewBook = async (data: BookDTO): Promise<boolean> => {
        try {
           await bookService.createBook(data);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const updateBook = async (id: string, data: BookDTO): Promise<boolean> => {
        try {
           await bookService.updateBook(id, data);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const removeBook = async (id: string): Promise<boolean> => {
        try {
           await bookService.deleteBook(id);
           return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    return {
        getCategoriesAsListItem, createNewCategory, updateCategory, removeCategory,
        getBooksAsListItem, createNewBook, updateBook, removeBook
    }
}

export default useBook;