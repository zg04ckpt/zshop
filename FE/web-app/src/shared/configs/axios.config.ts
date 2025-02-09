import axios, { Axios, AxiosError, AxiosInstance } from "axios";
import { ApiResult } from "../model/api-result.model";
import { useNavigate } from "react-router-dom";
import React from "react";
import { toast } from "react-toastify";
import { AuthService } from "../../features/auth/auth.service";

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

export const handleServerApiError = (navigate: Function, err: any) => {
    
    if (err.status == 401) {
        toast.info("Vui lòng đăng nhập để tiếp tục.");
        navigate('/login');
        return;
    }
    const apiError = err.response?.data;
    if(apiError.Errors) console.error(apiError.Errors);

    if(apiError.Message) 
        toast.error(apiError.Message);
    else 
        toast.error("Lỗi không xác định.");
}