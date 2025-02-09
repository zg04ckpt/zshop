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