import { use, useEffect, useState } from "react"
import { LocalUser, LoginRequest, LoginResponse, RegisterRequest } from "./auth.model";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { useDispatch } from "react-redux";
import { updateUser } from "./auth.slice";
import { AuthService } from "./auth.service";
import { toast } from "react-toastify";
import { handleServerApiError } from "../../shared/configs/axios.config";

export const useAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const authService = new AuthService();

    const login = async (data: LoginRequest): Promise<boolean> => {
        try {
            const res = await authService.login(data);

            // Save user to local
            authService.saveLocalUser(res!.user);
            authService.saveToken(res!.token);
        
            // emit user state
            dispatch(updateUser());

            toast.success(`Xin chào ${res!.user.firstName}`);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const navigateToLoginPage = () => {
        navigate(`/login?return_url=${location.pathname.substring(1)}`);
    }

    const register = async (data: RegisterRequest): Promise<boolean> => {
        try {
            await authService.register(data);
            // Change to confirm email status
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const resendEmailConfirmCode = async (email: string): Promise<boolean> => {
        try {
            await authService.resendConfirmEmailCode(email);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    } 

    const confirmEmail = async (email: string, code: string): Promise<boolean> => {
        try {
            await authService.confirmEmail({email, code});
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const navigateToRegisterPage = () => {
        navigate(`/register?return_url=${location.pathname.substring(1)}`);
    }

    const logout = async (): Promise<boolean> => {
        try {
            await authService.logout();
            // emit user state
            dispatch(updateUser());

            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    return { 
        login, navigateToLoginPage, 
        register, resendEmailConfirmCode, confirmEmail, navigateToRegisterPage,
        logout
     }
}

// export const useRegister = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const dispatch: AppDispatch = useDispatch();
//     const authService = new AuthService();

//     const register = async (data: RegisterRequest): Promise<boolean> => {
//         try {
//             await authService.register(data);
//             // Change to confirm email status
//             return true;
//         } catch (err: any) {
//             handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
//             return false;
//         }
//     }

//     const resendEmailConfirmCode = async (email: string): Promise<boolean> => {
//         try {
//             await authService.resendConfirmEmailCode(email);
//             return true;
//         } catch (err: any) {
//             handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
//             return false;
//         }
//     } 

//     const confirmEmail = async (email: string, code: string): Promise<boolean> => {
//         try {
//             await authService.confirmEmail({email, code});
//             return true;
//         } catch (err: any) {
//             handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
//             return false;
//         }
//     }

//     const navigateToRegisterPage = () => {
//         navigate(`/register?return_url=${location.pathname.substring(1)}`);
//     }

//     return { register, resendEmailConfirmCode, confirmEmail, navigateToRegisterPage }
// }

// export const useLogout = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const dispatch: AppDispatch = useDispatch();
//     const authService = new AuthService();

//     const logout = async (): Promise<void> => {
//         try {
//             await authService.logout();
//             // emit user state
//             dispatch(updateUser());
//             toast.info("Đã đăng xuất");

//             // back to home
//             navigate('/');
//         } catch (err: any) {
//             handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
//         }
//     }

//     return { logout }
// }