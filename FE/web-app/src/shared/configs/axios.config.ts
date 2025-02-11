import axios, { Axios, AxiosError, AxiosInstance } from "axios";
import { ApiResult } from "../model/api-result.model";
import { NavigateFunction, useNavigate } from "react-router-dom";
import React from "react";
import { toast } from "react-toastify";
import { AuthService } from "../../features/auth/auth.service";
import { config } from "dotenv";
import { useDispatch } from "react-redux";
import { updateUser } from "../../features/auth/auth.slice";
import { AppDispatch } from "../stores/redux-toolkit.store";

// instance for other api providers
export const api = axios.create();

// instance for server api
export const serverApi = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// config server api interceptor
serverApi.interceptors.request.use(
    config => {
        console.log(1);
        
        const token = new AuthService().getToken();
        if(token) {
            config.headers = config.headers || {};
            config.headers["Authorization"] = `${token.type} ${token.accessToken}`
        }
        return config;
    }
);

serverApi.interceptors.response.use(
    res => res,
    async error => {
        const apiError = error as AxiosError;
        const authService = new AuthService();
        const originalRequest = apiError.config!;
        //try refresh token if this isn't refresh token request and unauthorized
        if (apiError.response?.status === 401 && originalRequest.url != '/auth/refresh') {
            const refreshSuccess = await authService.refreshToken();
            // resend original request with new access token if refresh succeed
            const token = authService.getToken()!;
            originalRequest.headers["Authorization"] = `${token.type} ${token.accessToken}`
            if (refreshSuccess) return serverApi(originalRequest);
        }

        return Promise.reject(error);
    }
)

export const handleServerApiError = (navigate: NavigateFunction, returnUrl: string, err: any, dispatch: AppDispatch) => {
    const authService = new AuthService();

    if (err.status == 401) {
        toast.info("Vui lòng đăng nhập để tiếp tục.");
        
        // update user state (for refresh token failure);
        authService.clearAuth();
        dispatch(updateUser());

        navigate(`/login?return_url=${returnUrl}`);
        return;
    }
    const apiError = err.response?.data;
    if(apiError?.Errors) console.error(apiError.Errors);

    if(apiError?.Message) 
        toast.error(apiError.Message);
    else 
        toast.error("Lỗi không xác định.");
}