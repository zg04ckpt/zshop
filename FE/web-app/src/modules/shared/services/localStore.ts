import { stringify } from "qs"

export const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
}

export const getFromLocal = (key: string) => {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    return null;
}

export const deleteFromLocal = (key: string) => {
    localStorage.removeItem(key);
}