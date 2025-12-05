import { ConfirmEmailDTO, LocalUser, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../types/auth";
import { post, get } from "./config/axios";
import { endpoints } from "./config/endpoints";


export const register = async (data: RegisterDTO) => {
	return await post(endpoints.auth.register, data)
};

export const confirmEmail = async (data: ConfirmEmailDTO) => {
	return await post(endpoints.auth.confirmEmail, data);
};

export const resendConfirmEmailCode = async (email: string) => {
	return await post(endpoints.auth.requestResendConfirmEmailCode, { email });
};

export const login = async (data: LoginDTO) => {
	return await post<LocalUser>(endpoints.auth.login, data);
};

export const loginWithGoogle = async () => {
	const returnUrl = `${window.location.origin}/google-login-callback`;
	window.location.href = `${process.env.REACT_APP_API_BASE_URL}${endpoints.auth.googleLogin(returnUrl)}`;
};

export const getLoginInfo = async () => {
	return await get<LocalUser>(endpoints.auth.loginInfo);
};

export const logout = async () => {
	return await post(endpoints.auth.logout, {});
};

export const refreshToken = async () => {
	return await post(endpoints.auth.refresh, {});
};

export const requestSendResetPasswordCode = async (email: string) => {
	return await post(endpoints.auth.requestResendConfirmEmailCode, { email });
};

export const resetPassword = async (data: ResetPasswordDTO) => {
	return await post(endpoints.auth.resetPassword, data);
};
