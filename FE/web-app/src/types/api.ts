export interface ApiResult<T = void> {
	isSuccess: boolean;
	message: string | null;
	data?: T | null;
	errors?: any;
}

export interface CallApiError {
	type?: string;
	title?: string;
	status: number;
	message?: string;
}

export interface ApiResult<T=void> {
    isSuccess: boolean;
    message: string|null;
    data?: T|null;
    errors?: any;
}

export interface PagingRequest
{
    pageIndex: number;
    pageSize: number;
}

export interface Paginated<T>
{
    totalItems: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
    items: T[];
}