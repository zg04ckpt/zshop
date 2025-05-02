export interface LoginDTO {
    email: string;
    password: string;
}

export interface JwtTokenDTO {
    accessToken: string;
    refreshToken: string;
    type: string;
    expireAt: Date;
}

export interface RefreshTokenDTO {
    accessToken: string;
    refreshToken: string;
}


export interface LocalUser {
    userId: string;
    firstName: string;
    lastName: string;
    userName: string;
    avatarUrl: string|null;
    roles: string[];
}

export interface RegisterDTO {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface ConfirmEmailDTO {
    email: string;
    code: string;
}