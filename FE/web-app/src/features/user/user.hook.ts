import { useDispatch } from "react-redux";
import { useNavigate, useLocation, data } from "react-router-dom";
import { handleServerApiError } from "../../shared/configs/axios.config";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { UpdateUserProfileDTO, UserProfileDTO } from "./user.model";
import { UserService } from "./user.service"
import { AuthService } from "../auth/auth.service";
import { LocalUser } from "../auth/auth.model";
import { updateUser } from "../auth/auth.slice";

export const useUser = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const userService = new UserService();
    const authService = new AuthService();

    const getProfile = async (): Promise<UserProfileDTO|null> => {
        try {
            const data = await userService.getProfile();
            return data;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return null;
        }
    }

    const updateProfile = async (data: UpdateUserProfileDTO): Promise<boolean> => {
        try {
            await userService.updateProfile(data);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const updateUserLocalInfo = (lastName: string, firstName: string, avatarUrl: string|null) => {
        const user = authService.getLocalUser()!;
        authService.saveLocalUser({
            ... user,
            lastName: lastName,
            firstName: firstName,
            avatarUrl: avatarUrl
        });
        dispatch(updateUser());
    }

    return { getProfile, updateProfile, updateTopBar: updateUserLocalInfo }
}