import { use, useEffect, useState } from "react"
import { LocalUser, LoginRequest, LoginResponse } from "./model";
import { handleServerApiError } from "../../shared/func/handle-api-error.func";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { useDispatch } from "react-redux";
import { updateUser } from "./auth.slice";
import { AuthService } from "./auth.service";

export const useLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();
    const authService = new AuthService();

    const login = async (data: LoginRequest): Promise<LocalUser | null> => {
        try {
            setLoading(true);
            const res = await authService.login(data);

            // Save user to local
            authService.saveLocalUser(res!.user);
            authService.saveToken(res!.token);
        
            // emit user state
            dispatch(updateUser());

            return res!.user;
        } catch (err: any) {
            handleServerApiError(navigate, err);
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { login, loading }
}