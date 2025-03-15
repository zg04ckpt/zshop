import { JwtTokenDTO, LocalUser } from "..";

export const saveLocalUser = (data: LocalUser) => {
    localStorage.setItem('user', JSON.stringify(data));
}

export const getLocalUser = (): LocalUser|null => {
    const data = localStorage.getItem('user');
    return data? JSON.parse(data) as LocalUser : null;
}

export const saveToken = (data: JwtTokenDTO) => {
    localStorage.setItem('token', JSON.stringify(data));
}

export const getToken = (): JwtTokenDTO|null => {
    const data = localStorage.getItem('token');
    return data? JSON.parse(data) as JwtTokenDTO : null;
}

export const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}