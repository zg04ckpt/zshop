export interface CategoryDTO
{
    name: string;
    thumbnail: File|null;
    parentId: number;
}

export interface CategoryListItemDTO
{
    id: number;
    name: string;
    thumbnail: string;
    parentId: number|null;
    parentName: number|null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategorySelectItemDTO
{
    id: number;
    name: string;
}