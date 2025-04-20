import { BasePaging } from "../../shared";

export type Gender = 'Male'|'Female'|'Other'

export interface UserProfileDTO {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    gender: Gender;
    dateOfBirth: Date|null;
    avatarUrl: string|null;
}

export interface UpdateUserProfileDTO {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: Gender;
    dateOfBirth: Date|null;
    newAvatar: File|null;
}

export interface AddressSelectItemDTO {
    code: number,
    name: string,
    parentCode: number|null;
}

export interface AddressDataDTO {
    cities: AddressSelectItemDTO[];
    districts: AddressSelectItemDTO[];
    wards: AddressSelectItemDTO[];
}

export interface AddressDTO {
    city: string,
    cityCode: number,
    district: string,
    districtCode: number,
    ward: string,
    wardCode: number,
    detail: string,
    phoneNumber: string,
    receiverName: string
}

export type AddressItemDTO = AddressDTO & {
    id: string,
    isDefault: boolean
}

// Management
export interface SearchUserDTO extends BasePaging
{
    name: string;
    userName: string;
    email: string;
    roleId: number;
    isActivated: boolean;
}

export interface UserItemDTO
{
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    userName: string;
    isActivated: boolean;
    lastLogin: Date;
    roles: string[];
}

export interface RoleSelectItemDTO {
    id: number;
    name: string;
}