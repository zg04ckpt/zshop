import { use, useEffect, useState } from "react"
import { LocalUser, LoginRequest, LoginResponse } from "./model";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { useDispatch } from "react-redux";
import { updateUser } from "./auth.slice";
import { AuthService } from "./auth.service";
import { toast } from "react-toastify";
import { handleServerApiError } from "../../shared/configs/axios.config";

export const useLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();
    const authService = new AuthService();

    const login = async (data: LoginRequest, returnUrl: string): Promise<void> => {
        try {
            setLoading(true);
            const res = await authService.login(data);

            // Save user to local
            authService.saveLocalUser(res!.user);
            authService.saveToken(res!.token);
        
            // emit user state
            dispatch(updateUser());

            toast.success(`Xin chào ${res!.user.firstName}`);
            // back to origin page
            navigate(`/${returnUrl}`)
        } catch (err: any) {
            handleServerApiError(navigate, err);
        } finally {
            setLoading(false);
        }
    }

    const navigateToLoginPage = () => {
        navigate(`/login?return_url=${location.pathname.substring(1)}`);
    }

    return { login, loading, navigateToLoginPage }
}

export const useLogout = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const authService = new AuthService();

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
            // emit user state
            dispatch(updateUser());
            toast.info("Đã đăng xuất");

            // back to home
            navigate('/');
        } catch (err: any) {
            handleServerApiError(navigate, err);
        }
    }

    return { logout }
}