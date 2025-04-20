import { NavigateFunction } from "react-router-dom";
import { ApiResult } from "../types/api";
import axios, { AxiosResponse } from "axios";
import QueryString from "qs";
import { format } from "date-fns"
import { parseISO } from "date-fns/parseISO";

export function toCamelCase(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => toCamelCase(item));
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Lấy key mới: chuyển chữ cái đầu từ in hoa sang in thường
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            newObj[camelKey] = toCamelCase(obj[key]);
        }
    }
    return newObj;
}


export const backToOrigin = (navigate: NavigateFunction, returnUrl: string | null) => {
    if (returnUrl)
        navigate('/' + returnUrl);
    else if (window.history.length > 1)
        navigate(-1);
    else
        navigate('/');
}

export const convertToFormData = (data: any): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if(value) {
            if (value instanceof Array) {
                value.forEach((e, i) => {
                    addPropToFormData(formData, `${key}`, e);
                });
            } else {
                addPropToFormData(formData, key, value);
            }
        }
    });
    return formData;
}

const addPropToFormData = (formData: FormData, key: string, value: any) => {
    if (value instanceof File) {
        formData.append(key, value);
    } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
    } else {
        formData.append(key, value.toString());
    }
}

export const dateToInputValue = (date: Date|null|undefined): string => {
    debugger
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

export const stringToDate = (date: string): Date|null => {
    if (!date) return null;
    return new Date(date);
}

export const objectToHttpParam = (data: object) => {
    return QueryString.stringify(data);
}

export const convertDateToTimeSpan = (date: Date): string => {
    const now = Date.now();
    const past = date.getTime();
    const duration = (now - past) / 1000;

    if (duration < 60) {
        return Math.floor(duration) + " giây trước";
    } else if (duration < 3600) {
        return Math.floor(duration / 60) + " phút trước";
    } else if (duration < 86400) {
        return Math.floor(duration / 3600) + " giờ trước";
    } else if (duration < 2592000) { // 30 ngày
        return Math.floor(duration / 86400) + " ngày trước";
    } else if (duration < 31536000) { // 365 ngày
        return Math.floor(duration / 2592000) + " tháng trước";
    } else {
        return Math.floor(duration / 31536000) + " năm trước";
    }
};

export const formatDate = (val: any, pattern: string) => {
    if (!val) return null;
    return format(new Date(val), pattern);
}

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

export const scrollToObject = (selector: string, offset: number = 80) => {
    const element = document.querySelector(selector);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}



export const defaultImageUrl = process.env.REACT_APP_DEFAULT_IMAGE_URL