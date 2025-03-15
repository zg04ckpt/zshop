import { AddressDataDTO, AddressDTO, AddressItemDTO, RoleSelectItemDTO, SearchUserDTO, 
    UpdateUserProfileDTO, UserItemDTO, UserProfileDTO } from "..";
import { serverApi, ApiResult, convertToFormData, Paginated } from "../../shared";

//#region Profile
export const getProfileApi = async (): Promise<ApiResult<UserProfileDTO>> => {
    try {
        return(await serverApi.get<ApiResult<UserProfileDTO>>('/user/profile')).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const updateProfileApi = async (data: UpdateUserProfileDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.put<ApiResult>(
            '/user/profile', 
            convertToFormData(data)
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

//#endregion


//#region Shipping address
export const getAddressDataApi = async (): Promise<ApiResult<AddressDataDTO>> => {
    try {
        return (await serverApi.get<ApiResult<AddressDataDTO>>(`/user/address/config`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
} 

export const addAddressApi = async (data: AddressDTO): Promise<ApiResult> => {
    try {
        return (await serverApi.post<ApiResult>(`/user/address`, data)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getAddressesApi = async (): Promise<ApiResult<AddressItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<AddressItemDTO[]>>(`/user/address`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const removeAddressApi = async (id: string): Promise<ApiResult> => {
    try {
        return (await serverApi.delete<ApiResult>(`/user/address/${id}`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const setAddressDefaultApi = async (id: string): Promise<ApiResult> => {
    try {
        return (await serverApi.put<ApiResult>(`/user/address/${id}/set-default`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}
//#endregion


//#region Management
export const getUsersAsListItemApi = async (data: SearchUserDTO): Promise<ApiResult<Paginated<UserItemDTO>>> => {
    try {
        return (await serverApi.get<ApiResult<Paginated<UserItemDTO>>>(
            `/management/user`,
            { params: data }
        )).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}

export const getRolesOfUserApi = async (): Promise<ApiResult<RoleSelectItemDTO[]>> => {
    try {
        return (await serverApi.get<ApiResult<RoleSelectItemDTO[]>>(`/management/user/roles`)).data;
    } catch {
        return {
            isSuccess: false,
            message: 'Yêu cầu thất bại.',
        }
    }
}
//#endregion