import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiResult } from "../../types/api";
import { logout, refreshToken } from "../auth";
import { showInfoToast, showSuccessToast } from "../../utils";
import { endLoadingStatus, RootState, setUser, store, useAppContext } from "../../stores";
import { toCamelCase } from "../../utils/helper";
import { LocalUser } from "../../types/auth";
import { useSelector } from "react-redux";
import { getFromLocal, saveToLocal } from "../../utils/localStore";

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


export const setupInterceptors = (navigate: any, location: any, dispatch: any, context: any) => {
	

	// Request interceptor
	axiosInstance.interceptors.request.use((config) => {
		config.withCredentials = true;
		return config;
	});

	// Response interceptor
	axiosInstance.interceptors.response.use(
		(res) => {
			return res;
		},
		async (error: AxiosError) => {
			const apiError = error as AxiosError;
			const originalRequest = apiError.config!;
			debugger
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
					const isLoggedIn = getFromLocal("isLoggedIn") as boolean;
					let mess = "Phiên đăng nhập đã hết hạn? Bạn có muốn đăng nhập lại không?";
					if (!isLoggedIn) {
						mess = "Đăng nhập để tiếp tục?"
					}
					debugger
                    dispatch(setUser(null));
                    dispatch(endLoadingStatus());
					context?.showConfirmDialog({
						message: mess,
						onConfirm: () => {
                    		navigate(`/login?return_url=${encodeURIComponent(location.pathname)}`);
							showInfoToast("Vui lòng đăng nhập để tiếp tục.");
						},
						onReject: async () => {
							await logout();
							showSuccessToast("Đã đăng xuất");
							saveToLocal("isLoggedIn", false);
							navigate("/");
						}
					});
                    return null;
				}
			}

			return Promise.resolve<AxiosResponse>(toCamelCase(error.response));
		}
	);
};

