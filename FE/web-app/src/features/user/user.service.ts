import { data } from "react-router-dom";
import { api, serverApi } from "../../shared/configs/axios.config";
import { convertToFormData, stringToDate } from "../../shared/helper";
import { ApiResult } from "../../shared/model/api-result.model";
import { LocalUser } from "../auth/auth.model";
import { AddressDataDTO, AddressDTO, AddressItemDTO, RoleSelectItemDTO, SearchUserDTO, UpdateUserProfileDTO, UserItemDTO, UserProfileDTO } from "./user.model";
import { BasePaging, Paginated } from "../../shared/model/base-paging.model";

export class UserService {
    //#region Profile
    getProfile = async (): Promise<UserProfileDTO> => {
        const res = await serverApi.get<ApiResult<UserProfileDTO>>('/user/profile');
        let data = res.data.data!;
        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }
        return data;
    }

    updateProfile = async (data: UpdateUserProfileDTO): Promise<void> => {
        debugger
        const formData = convertToFormData(data);
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        await serverApi.put<ApiResult>('/user/profile', formData);
    }

    //#endregion

    //#region Shipping address
    getAddressData = async (): Promise<AddressDataDTO> => {
        const res = await serverApi.get<ApiResult<AddressDataDTO>>(`/user/address/config`);
        return res.data.data!;
    } 

    addAddress = async (data: AddressDTO): Promise<void> => {
        await serverApi.post<ApiResult>(`/user/address`, data);
    }

    getAddresses = async (): Promise<AddressItemDTO[]> => {
        const res = await serverApi.get<ApiResult<AddressItemDTO[]>>(`/user/address`);
        return res.data.data!;
    }

    // updateAddress = async (id: string, data: AddressDTO): Promise<void> => {
    //     await serverApi.put<ApiResult>(`/user/address/${id}`, data);
    // }

    removeAddress = async (id: string): Promise<void> => {
        await serverApi.delete<ApiResult>(`/user/address/${id}`);
    }

    setAddressDefault = async (id: string): Promise<void> => {
        await serverApi.put<ApiResult>(`/user/address/${id}/set-default`);
    }
    //#endregion


    //#region Management
    getUsersAsListItem = async (data: SearchUserDTO): Promise<Paginated<UserItemDTO>> => {
        const res = await serverApi.get<ApiResult<Paginated<UserItemDTO>>>(
            `/management/user`,
            { params: data }
        );
        const users = res.data.data!;
        users.data.forEach(e => e.lastLogin = new Date(e.lastLogin));
        return res.data.data!;
    }

    getRolesOfUser = async (): Promise<RoleSelectItemDTO[]> => {
        const res = await serverApi.get<ApiResult<RoleSelectItemDTO[]>>(`/management/user/roles`);
        return res.data.data!;
    }
    //#endregion
}