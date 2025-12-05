import { del, get, post, put } from "./config/axios";
import { Paginated } from "../types/api";
import { 
    UserProfileDTO, 
    UpdateUserProfileDTO, 
    AddressDataDTO,
    AddressDTO,
    AddressItemDTO,
    SearchUserDTO,
    UserItemDTO,
    RoleSelectItemDTO
} from "../types/user";
import { endpoints } from "./config/endpoints";
import { convertToFormData, toQueryParams } from "../utils/helper";

export const getProfile = async () => {
    return await get<UserProfileDTO>(endpoints.user.profile);
};

export const updateProfile = async (data: UpdateUserProfileDTO) => {
    return await put(endpoints.user.profile, convertToFormData(data));
};

export const getAddressData = async () => {
    return await get<AddressDataDTO>(endpoints.user.addressConfig);
};

export const getAddresses = async () => {
    return await get<AddressItemDTO[]>(endpoints.user.address);
};

export const addAddress = async (data: AddressDTO) => {
    return await post(endpoints.user.address, data);
};

export const removeAddress = async (id: string) => {
    return await del(endpoints.user.addressDetail(id));
};

export const setAddressDefault = async (id: string) => {
    return await put(endpoints.user.addressSetDefault(id), {});
};

export const getUsers = async (data: SearchUserDTO) => {
    const queryParams = toQueryParams(data);
    return await get<Paginated<UserItemDTO>>(`${endpoints.userManagement.root}?${queryParams}`);
};

export const getRoles = async () => {
    return await get<RoleSelectItemDTO[]>(endpoints.userManagement.roles);
};
