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