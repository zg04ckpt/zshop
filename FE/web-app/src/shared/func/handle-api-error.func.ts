import { AxiosError } from "axios";
import { ApiResult } from "../model/api-result.model";
import { toast } from "react-toastify";

export const handleServerApiError = (navigate: Function, err: any) => {
    debugger
    if (err.status == 401) {
        navigate('/login');
    }
    const apiError = err.response?.data;
    if(apiError.Errors) console.error(apiError.Errors);

    if(apiError.Message) 
        toast.error(apiError.Message);
    else 
        toast.error("Lỗi không xác định.");
}