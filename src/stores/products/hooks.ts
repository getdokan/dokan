import { Category, Product } from './types';

export interface ProductsHookData {
    products: Product[] | undefined;
    totalItems: number | undefined;
    totalPages: number | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface ProductHookData {
    product: Product | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface CategoriesHookData {
    categories: Category[] | undefined;
    totalItems: number | undefined;
    totalPages: number | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface CategoryHookData {
    category: Category | undefined;
    isLoading: boolean;
    error: Error | null;
}
