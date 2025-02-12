import { serverApi } from "../../shared/configs/axios.config";
import { convertToFormData, stringToDate } from "../../shared/helper";
import { ApiResult } from "../../shared/model/api-result.model";
import { LocalUser } from "../auth/auth.model";
import { UpdateUserProfileDTO, UserProfileDTO } from "./user.model";

export class UserService {
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
}