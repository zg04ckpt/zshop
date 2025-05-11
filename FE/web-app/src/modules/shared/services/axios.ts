import axios, { AxiosError, AxiosResponse } from "axios";
import { NavigateFunction } from "react-router-dom";
import { refreshTokenApi } from "../../auth";
import { setUser } from "../stores/authSlice";
import { ApiResult, AppDispatch, endLoadingStatus, showErrorToast, showInfoToast } from "..";
import { toCamelCase } from "../utilities/helper";

// instance for server api
export const serverApi = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// function to config interceptor
export const setupInterceptors = (navigate: NavigateFunction, location: any, dispatch: AppDispatch) => {
    // config request interceptor
    serverApi.interceptors.request.use(
        (config) => {
            config.withCredentials = true
            return config;
        }
    );
    serverApi.interceptors.response.use(
        (res) => {
            res.data = convertDates(res.data);
            return res;
        },
        async (error) => {
            const apiError = error as AxiosError;
            const originalRequest = apiError.config!;
            if (apiError.response?.status === 401) {
                if (originalRequest.url != '/auth/refresh') { 
                    // => this isn't a refresh token req => try refresh access token
                    const res = await refreshTokenApi();
                    if (res.isSuccess) {
                        return serverApi(originalRequest);
                    }
                } else {
                    // => refresh access token failure => require login
                    showInfoToast("Vui lòng đăng nhập để tiếp tục.");
                    dispatch(setUser(null));
                    dispatch(endLoadingStatus());
                    navigate(`/login?return_url=${encodeURIComponent(location.pathname)}`);
                    return null
                }
            } else if (apiError.response?.status === 403) {
                navigate(`/forbidden`);
            }
            // return ApiError object
            return Promise.resolve<AxiosResponse>(toCamelCase(error.response));
        }
    );
}

// Hàm kiểm tra xem chuỗi có phải định dạng ngày giờ không và convert thành Date
const isDateString = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    // Kiểm tra định dạng ISO 8601 hoặc các định dạng ngày giờ khác
    return /^\d{4}-\d{2}-\d{2}(T|\s).*$/.test(value) && !isNaN(new Date(value).getTime());
};

export const convertDates = (data: any): any => {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) {
        return data.map(item => convertDates(item));
    }
    if (typeof data === 'object') {
        const newObj: any = { ...data };
        for (const key in newObj) {
            if (Object.prototype.hasOwnProperty.call(newObj, key)) {
                if (isDateString(newObj[key])) {
                    newObj[key] = new Date(newObj[key]);
                } else {
                    newObj[key] = convertDates(newObj[key]);
                }
            }
        }
        return newObj;
    }
    return data;
};
