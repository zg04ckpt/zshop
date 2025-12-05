import { pull } from "lodash";
import { CreateVoucherDTO, SearchVoucherDTO, VoucherDetailDTO } from "../types/voucher";
import { toQueryParams } from "../utils/helper";
import { get, post } from "./config/axios";
import { endpoints } from "./config/endpoints";

export const getVouchers = async (data: SearchVoucherDTO) => {
    const queryParams = toQueryParams(data);
    return await get<VoucherDetailDTO>(`${endpoints.voucherManagement.root}?${queryParams}`);
}

export const getVouchersAsList = async (data: SearchVoucherDTO) => {
    const queryParams = toQueryParams(data);
    return await get<VoucherDetailDTO>(`${endpoints.voucher.root}?${queryParams}`);
}

export const getVoucherDetail = async (id: string) => {
    return await get<VoucherDetailDTO>(endpoints.voucher.detail(id));
}

export const deactivateVoucher = async (id: string) => {
    return await post<string>(endpoints.voucherManagement.deactivate(id), {});
}

export const createVoucher = async (data: CreateVoucherDTO) => {
    return await post<string>(endpoints.voucherManagement.root, data);
}

