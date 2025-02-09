import { data } from "react-router-dom";
import { serverApi } from "../../shared/configs/axios.config";
import { ApiResult } from "../../shared/model/api-result.model";
import { JwtToken, LocalUser, LoginRequest, LoginResponse } from "./model";

export class AuthService {
    login = async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await serverApi.post<ApiResult<LoginResponse>>("/auth/login", data);
        return res.data.data!;
    }

    logout = async (): Promise<void> => {
        await serverApi.post<ApiResult>(`/auth/logout`);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
}
