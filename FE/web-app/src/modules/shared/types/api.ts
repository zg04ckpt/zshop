export interface ApiResult<T=void> {
    isSuccess: boolean;
    message: string|null;
    data?: T|null;
    errors?: any;
}

export interface BasePaging
{
    page: number;
    size: number;
}

export interface Paginated<T>
{
    totalRecord: number;
    totalPage: number;
    data: T[];
}