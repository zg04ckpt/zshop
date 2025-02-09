export interface ApiResult<T=void> {
    isSuccess: boolean;
    message: string|null;
    data?: T|null;
    errors?: any;
}