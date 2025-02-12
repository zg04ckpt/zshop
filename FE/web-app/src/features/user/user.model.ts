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