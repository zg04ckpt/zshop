import { format } from 'date-fns';

export const convertToFormData = (data: any): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if(value) {
            if (value instanceof Array) {
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
    } else {
        formData.append(key, value.toString());
    }
}

export const dateToInputValue = (date: Date|null|undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

export const stringToDate = (date: string): Date|null => {
    if (!date) return null;
    return new Date(date);
}