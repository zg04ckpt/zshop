export interface LoginRequest {
    email: string;
    password: string;
}

export interface JwtToken {
    accessToken: string;
    refreshToken: string;
    type: string;
    expireAt: Date;
}

export interface RefreshTokenRequest {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: LocalUser;
    token: JwtToken;
}

export interface LocalUser {
    userId: string;
    firstName: string;
    lastName: string;
    userName: string;
    avatarUrl: string|null;
    roles: string[];
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface ConfirmEmailRequest {
    email: string;
    code: string;
}