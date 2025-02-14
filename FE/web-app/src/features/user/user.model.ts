export interface UserProfileDTO {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    genderId: number;
    dateOfBirth: Date|null;
    avatarUrl: string|null;
}

export interface UpdateUserProfileDTO {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    genderId: number;
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