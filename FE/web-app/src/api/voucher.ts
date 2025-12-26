import { CreateVoucherDTO, SearchVoucherDTO, VoucherDetailDTO } from "../types/voucher";
import { toQueryParams } from "../utils/helper";
import { del, get, post } from "./config/axios";
import { endpoints } from "./config/endpoints";
import { Paginated } from "../types/api";

export const getVouchers = async (data: SearchVoucherDTO) => {
    const queryParams = toQueryParams(data);
    return await get<Paginated<VoucherDetailDTO>>(`${endpoints.voucher.root}?${queryParams}`);
}

export const getVouchersAsList = async (data: SearchVoucherDTO) => {
    const queryParams = toQueryParams(data);
    return await get<VoucherDetailDTO>(`${endpoints.voucher.root}?${queryParams}`);
}

export const getVoucherDetail = async (id: string) => {
    return await get<VoucherDetailDTO>(endpoints.voucher.detail(id));
}

export const changeActivationVoucher = async (id: string) => {
    return await post<string>(endpoints.voucherManagement.changeActivation(id), {});
}

export const createVoucher = async (data: CreateVoucherDTO) => {
    return await post<string>(endpoints.voucherManagement.root, data);
}

export const deleteVoucher = async (id: string) => {
    return await del<string>(endpoints.voucherManagement.delete(id));
}