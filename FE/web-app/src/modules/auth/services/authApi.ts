import { ConfirmEmailDTO, LocalUser, LoginDTO, RegisterDTO, ResetPasswordDTO } from "..";
import { ApiResult, serverApi } from "../../shared";

export const registerApi = async (data: RegisterDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>("/auth/register", data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const confirmEmailApi = async (data: ConfirmEmailDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>("/auth/confirm-email", data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const resendConfirmEmailCodeApi = async (email: string): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult<void>>(
            "/auth/resend-confirm-mail-auth-code", 
            { email: email }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const loginApi = async (data: LoginDTO): Promise<ApiResult<LocalUser>> => {
    try {
        return (await serverApi.post<ApiResult<LocalUser>>(
            "/auth/login", data
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const loginWithGoogleApi = async () => {
    const returnUrl = `${window.location.origin}/google-login-callback`;
    window.location.href = 
        `${process.env.REACT_APP_API_BASE_URL}/auth/google/login?returnUrl=${encodeURIComponent(returnUrl)}`;
};

export const getLoginInfo = async (): Promise<ApiResult<LocalUser>> => {
    try {
        return (await serverApi.get<ApiResult<LocalUser>>(
            "/auth/login/info")).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const logoutApi = async (): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(`/auth/logout`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const refreshTokenApi = async (): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>("/auth/refresh")).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const sendResetPassCodeApi = async (email: string): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult<void>>(
            "/auth/send-reset-pass-auth-code", 
            { email: email }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};

export const resetPassApi = async (data: ResetPasswordDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult<void>>(
            "/auth/reset-password", 
            data
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
};