import { serverApi } from "../../shared/configs/axios.config";
import { ApiResult } from "../../shared/model/api-result.model";
import { ConfirmEmailRequest, JwtToken, LocalUser, LoginRequest, LoginResponse, RegisterRequest } from "./auth.model";

export class AuthService {

    register = async (data: RegisterRequest): Promise<void> => {
        await serverApi.post<ApiResult<void>>("/auth/register", data);
    }

    confirmEmail = async (data: ConfirmEmailRequest): Promise<void> => {
        await serverApi.post<ApiResult<void>>("/auth/confirm-email", data);
    }

    resendConfirmEmailCode = async (email: string): Promise<void> => {
        await serverApi.post<ApiResult<void>>("/auth/resend-confirm-mail-auth-code", { email: email });
    }

    login = async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await serverApi.post<ApiResult<LoginResponse>>("/auth/login", data);
        return res.data.data!;
    }

    logout = async (): Promise<void> => {
        await serverApi.post<ApiResult>(`/auth/logout`);
        this.clearAuth();
    }

    refreshToken = async (): Promise<boolean> => {
        const token = this.getToken();
        const res = await serverApi.post<ApiResult<JwtToken>>("/auth/refresh", {
            accessToken: token!.accessToken,
            refreshToken: token!.refreshToken
        });
        if (res.data.isSuccess) {
            this.saveToken(res.data.data!);
            return true;
        }
        return false;
    }

    saveLocalUser = (data: LocalUser) => {
        localStorage.setItem('user', JSON.stringify(data));
    }

    getLocalUser = (): LocalUser|null => {
        const data = localStorage.getItem('user');
        return data? JSON.parse(data) as LocalUser : null;
    }

    saveToken = (data: JwtToken) => {
        localStorage.setItem('token', JSON.stringify(data));
    }

    getToken = (): JwtToken|null => {
        const data = localStorage.getItem('token');
        return data? JSON.parse(data) as JwtToken : null;
    }

    clearAuth = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
}
