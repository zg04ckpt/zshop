import { useLocation, useNavigate } from "react-router-dom";
import { ApiResult, AppDispatch, RootState, setUser } from "../../shared";
import { useDispatch } from "react-redux";
import { confirmEmailApi, logoutApi, registerApi, RegisterDTO, resendConfirmEmailCodeApi } from "..";
import { useState } from "react";
import { useSelector } from "react-redux";
import { showErrorToast, showSuccessToast } from "../../shared/services/toast";

interface AuthContextType {
    apiLoading: boolean;
    // login: (data: LoginDTO) => Promise<boolean>;
    register: (data: RegisterDTO) => Promise<boolean>;
    resendEmailConfirmCode: (email: string) => Promise<boolean>;
    confirmEmail: (email: string, code: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
    const dispatch = useDispatch<AppDispatch>();
    const [apiLoading, setApiLoading] = useState<boolean>(false);

    // const login = async (data: LoginDTO): Promise<boolean> => {
    //     setApiLoading(true);
    //     clearAuth();
    //     const res = await loginApi(data);
    //     setApiLoading(false);
        
    //     if (res.isSuccess) {
    //         // Save user to local
    //         saveLocalUser(res.data!.user);
    //         saveToken(res.data!.token);
    //         // emit user state
    //         dispatch(setUser(res.data!.user));

    //         showSuccessToast(`Đăng nhập thành công, xin chào ${res.data!.user.firstName}`);
    //         return true;
    //     } else {
    //         showErrorToast(res.message ?? 'Lỗi không xác định');
    //         return false;
    //     }
    // }

    const register = async (data: RegisterDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await registerApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const resendEmailConfirmCode = async (email: string): Promise<boolean> => {
        setApiLoading(true);
        const res = await resendConfirmEmailCodeApi(email);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const confirmEmail = async (email: string, code: string): Promise<boolean> => {
        setApiLoading(true);
        const res = await confirmEmailApi({ email, code });
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const logout = async (): Promise<void> => {
        setApiLoading(true);
        const res = await logoutApi();
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
        }
        dispatch(setUser(null));
    }

    return { 
        apiLoading,
        register, resendEmailConfirmCode, confirmEmail, logout
     }
}