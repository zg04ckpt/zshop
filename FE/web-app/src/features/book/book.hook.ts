import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { AuthService } from "../auth/auth.service";
import { UserService } from "../user/user.service";
import { CategoryDTO, CategoryListItemDTO } from "./book.model";
import { BookService } from "./book.service"
import { handleServerApiError } from "../../shared/configs/axios.config";

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

    return {
        getCategoriesAsListItem, createNewCategory, updateCategory, removeCategory
    }
}

export default useBook;