import { ConfirmEmailDTO, getToken, JwtTokenDTO, LoginDTO, LoginResponseDTO, RegisterDTO } from "..";
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
}

export const confirmEmailApi = async (data: ConfirmEmailDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>("/auth/confirm-email", data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

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
}

export const loginApi = async (data: LoginDTO): Promise<ApiResult<LoginResponseDTO>> => {
    try {
        return (await serverApi.post<ApiResult<LoginResponseDTO>>("/auth/login", data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const logoutApi = async (): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(`/auth/logout`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const refreshTokenApi = async (): Promise<ApiResult<JwtTokenDTO>> => {
    try {
        const token = getToken();
        return (await serverApi.post<ApiResult<JwtTokenDTO>>("/auth/refresh", {
            accessToken: token!.accessToken,
            refreshToken: token!.refreshToken
        })).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}