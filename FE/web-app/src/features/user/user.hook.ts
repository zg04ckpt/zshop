import { useDispatch } from "react-redux";
import { useNavigate, useLocation, data } from "react-router-dom";
import { handleServerApiError } from "../../shared/configs/axios.config";
import { AppDispatch } from "../../shared/stores/redux-toolkit.store";
import { AddressDataDTO, AddressDTO, AddressItemDTO, UpdateUserProfileDTO, UserProfileDTO } from "./user.model";
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

    const initAddressData = async (): Promise<AddressDataDTO|null> => {
        try {
            const data = await userService.getAddressData();
            return data;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return null;
        }
    }

    const getAddresses = async (): Promise<AddressItemDTO[]> => {
        try {
            const data = await userService.getAddresses();
            return data;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return [];
        }
    }

    const addAddress = async (data: AddressDTO): Promise<boolean> => {
        try {
            await userService.addAddress(data);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    // const updateAddress = async (id: string, data: AddressDTO): Promise<boolean> => {
    //     try {
    //         await userService.updateAddress(id, data);
    //         return true;
    //     } catch (err: any) {
    //         handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
    //         return false;
    //     }
    // }

    const removeAddress = async (id: string): Promise<boolean> => {
        try {
            await userService.removeAddress(id);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    const setDefaultAddress = async (id: string): Promise<boolean> => {
        try {
            await userService.setAddressDefault(id);
            return true;
        } catch (err: any) {
            handleServerApiError(navigate, location.pathname.substring(1), err, dispatch);
            return false;
        }
    }

    return { 
        getProfile, updateProfile, updateUserLocalInfo, 
        initAddressData, getAddresses, addAddress, removeAddress, setDefaultAddress
    }
}