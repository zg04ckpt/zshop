import { NavigateFunction } from "react-router-dom";
import QueryString from "qs";
import { format } from "date-fns"

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
        if (value !== null && value !== undefined) { 
            if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                value.forEach((file: File) => {
                    formData.append(key, file);
                });
            } else if (Array.isArray(value)) {
                value.forEach((e, i) => {
                    addPropToFormData(formData, `${key}[${i}]`, e);
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
    } else if (typeof value === 'object') {
        addObjectToFormData(formData, key, value);
    } else {
        formData.append(key, value.toString());
    }
}

const addObjectToFormData = (formData: FormData, key: string, data: any) => {
    Object.keys(data).forEach(childKey => {
        const value = data[childKey];
        if(value) {
            if (value instanceof Array) {
                value.forEach((e, i)  => {
                    addPropToFormData(formData, `${key}.${childKey}`, e);
                });
            } else {
                addPropToFormData(formData, `${key}.${childKey}`, value);
            }
        }
    });
}

export const dateToInputValue = (date: Date|null|undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

export const stringToDate = (date: string): Date | null => {
    if (!date) return null;
    const [day, month, year] = date.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
};

export const objectToHttpParam = (data: object) => {
    return QueryString.stringify(data);
}

export const convertDateToTimeSpan = (date: Date): string => {
    const now = Date.now();
    const past = new Date(date).getTime();
    const duration = (now - past) / 1000;
    debugger
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
    
    try {
        // Handle different date formats
        let dateObj: Date;
        
        if (val instanceof Date) {
            dateObj = val;
        } else if (typeof val === 'string' || typeof val === 'number') {
            dateObj = new Date(val);
        } else {
            return null;
        }
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return null;
        }
        
        return format(dateObj, pattern);
    } catch (error) {
        console.error('Error formatting date:', error, 'Value:', val);
        return null;
    }
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

// Hàm kiểm tra xem chuỗi có phải định dạng ngày giờ không và convert thành Date
const isDateString = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    // Kiểm tra định dạng ISO 8601 hoặc các định dạng ngày giờ khác
    return /^\d{4}-\d{2}-\d{2}(T|\s).*$/.test(value) && !isNaN(new Date(value).getTime());
};

export const convertDates = (data: any): any => {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) {
        return data.map(item => convertDates(item));
    }
    if (typeof data === 'object') {
        const newObj: any = { ...data };
        for (const key in newObj) {
            if (Object.prototype.hasOwnProperty.call(newObj, key)) {
                if (isDateString(newObj[key])) {
                    newObj[key] = new Date(newObj[key]);
                } else {
                    newObj[key] = convertDates(newObj[key]);
                }
            }
        }
        return newObj;
    }
    return data;
};

export function toQueryParams(obj: Record<string, any>, prefix = ''): string {
    const query = new URLSearchParams();

    const add = (key: string, value: any) => {
        if (value === null || value === undefined) return;
        if (value instanceof Date) {
            query.append(key, value.toISOString());
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(v => add(key, v)); // flatten array
        } else if (typeof value === 'object') {
            // nếu muốn support nested object
            Object.keys(value).forEach(subKey => {
                add(`${key}[${subKey}]`, value[subKey]);
            });
        } else {
            query.append(key, value.toString());
        }
    };

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        add(prefix ? `${prefix}[${key}]` : key, value);
    });

    return query.toString();
}


export const defaultImageUrl = process.env.REACT_APP_DEFAULT_IMAGE_URL