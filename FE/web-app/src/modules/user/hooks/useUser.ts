import { useState } from "react";
import { addAddressApi, AddressDataDTO, AddressDTO, AddressItemDTO, getAddressDataApi, getAddressesApi, getProfileApi, getRolesOfUserApi, getUsersAsListItemApi, removeAddressApi, RoleSelectItemDTO, SearchUserDTO, setAddressDefaultApi, updateProfileApi, UpdateUserProfileDTO, UserItemDTO, UserProfileDTO } from "..";
import { AppDispatch, Paginated, setUser, showErrorToast, showSuccessToast } from "../../shared";
import { useDispatch } from "react-redux";

interface UserContextType {
    apiLoading: boolean;
    getProfile: () => Promise<UserProfileDTO|null>;
    updateProfile: (data: UpdateUserProfileDTO) => Promise<boolean>;
    getDefaultAddressData: () => Promise<AddressDataDTO|null>;
    getAddresses: () => Promise<AddressItemDTO[]>;
    addAddress: (data: AddressDTO) => Promise<boolean>;
    removeAddress: (id: string) => Promise<boolean>;
    setDefaultAddress: (id: string) => Promise<boolean>;
    getUsersAsList: (data: SearchUserDTO) => Promise<Paginated<UserItemDTO>|null>;
    getRolesOfUser: () => Promise<RoleSelectItemDTO[]>;
}

export const useUser = (): UserContextType => {
    const [apiLoading, setApiLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    const getProfile = async (): Promise<UserProfileDTO|null> => {
        setApiLoading(true);
        const res = await getProfileApi();
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const updateProfile = async (data: UpdateUserProfileDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await updateProfileApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const getDefaultAddressData = async (): Promise<AddressDataDTO|null> => {
        setApiLoading(true);
        const res = await getAddressDataApi();
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getAddresses = async (): Promise<AddressItemDTO[]> => {
        setApiLoading(true);
        const res = await getAddressesApi();
        setApiLoading(false);
        if (res.isSuccess) {
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return [];
        }
    }

    const addAddress = async (data: AddressDTO): Promise<boolean> => {
        setApiLoading(true);
        const res = await addAddressApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const removeAddress = async (id: string): Promise<boolean> => {
        setApiLoading(true);
        const res = await removeAddressApi(id);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const setDefaultAddress = async (id: string): Promise<boolean> => {
        setApiLoading(true);
        const res = await setAddressDefaultApi(id);
        setApiLoading(false);
        if (res.isSuccess) {
            showSuccessToast(res.message ?? "Thành công.");
            return true;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return false;
        }
    }

    const getUsersAsList = async (data: SearchUserDTO): Promise<Paginated<UserItemDTO>|null> => {
        setApiLoading(true);
        const res = await getUsersAsListItemApi(data);
        setApiLoading(false);
        if (res.isSuccess) {
            // showSuccessToast(res.message ?? "Thành công.");
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return null;
        }
    }

    const getRolesOfUser = async (): Promise<RoleSelectItemDTO[]> => {
        setApiLoading(true);
        const res = await getRolesOfUserApi();
        setApiLoading(false);
        if (res.isSuccess) {
            // showSuccessToast(res.message ?? "Thành công.");
            return res.data!;
        } else {
            showErrorToast(res.message ?? 'Lỗi không xác định');
            return [];
        }
    }

    return {
        apiLoading,
        addAddress, getAddresses, getDefaultAddressData, removeAddress, setDefaultAddress,
        getProfile, getRolesOfUser, updateProfile, getUsersAsList
    }
}