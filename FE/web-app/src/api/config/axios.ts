import axios, { AxiosError, AxiosResponse } from "axios";
import { convertDates } from "../../utils/date";
import { ApiResult } from "../../types/api";
import { refreshToken } from "../auth";
import { showInfoToast } from "../../utils";
import { endLoadingStatus, setUser } from "../../stores";
import { toCamelCase } from "../../utils/helper";

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL,
	withCredentials: true,
});


export const get = async <T = void>(url: string): Promise<ApiResult<T>> => {
	try {
		return (await axiosInstance.get<ApiResult<T>>(url)).data;
	} catch (error: any) {
		return {
			isSuccess: false,
			message: error?.data?.message || "Yêu cầu thất bại.",
			errors: error?.data?.errors
		};
	}
};


export const post = async <T = void>(url: string, data: any): Promise<ApiResult<T>> => {
	try {
		return (await axiosInstance.post<ApiResult<T>>(url, data)).data;
	} catch (error: any) {
		return {
			isSuccess: false,
			message: error?.data?.message || "Yêu cầu thất bại.",
			errors: error?.data?.errors
		};
	}
};


export const put = async <T = void>(url: string, data: any): Promise<ApiResult<T>> => {
	try {
		return (await axiosInstance.put<ApiResult<T>>(url, data)).data;
	} catch (error: any) {
		return {
			isSuccess: false,
			message: error?.data?.message || "Yêu cầu thất bại.",
			errors: error?.data?.errors
		};
	}
};


export const del = async <T = void>(url: string): Promise<ApiResult<T>> => {
	try {
		return (await axiosInstance.delete<ApiResult<T>>(url)).data;
	} catch (error: any) {
		return {
			isSuccess: false,
			message: error?.data?.message || "Yêu cầu thất bại.",
			errors: error?.data?.errors
		};
	}
};


export const setupInterceptors = (navigate: any, location: any, dispatch: any) => {

	// Request interceptor
	axiosInstance.interceptors.request.use((config) => {
		config.withCredentials = true;
		return config;
	});

	// Response interceptor
	axiosInstance.interceptors.response.use(
		(res) => {
			res.data = convertDates(res.data);
			return res;
		},
		async (error: AxiosError) => {
			const apiError = error as AxiosError;
			const originalRequest = apiError.config!;

			if (apiError.response?.status === 403) {
				navigate("/forbidden");
				return
			}

			if (apiError.response?.status === 401) {
				if (originalRequest.url !== "/auth/refresh") {
					if ((await refreshToken()).isSuccess) {
						return axiosInstance(originalRequest);
					}
				} else {
					showInfoToast("Vui lòng đăng nhập để tiếp tục.");
                    dispatch(setUser(null));
                    dispatch(endLoadingStatus());
                    navigate(`/login?return_url=${encodeURIComponent(location.pathname)}`);
                    return null
				}
			}

			return Promise.resolve<AxiosResponse>(toCamelCase(error.response));
		}
	);
};

