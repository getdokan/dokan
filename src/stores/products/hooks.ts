import { Category, Product, QueryParams, Select } from './types';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from './constants';

export interface ProductsHookReturn {
    products: Product[] | undefined;
    totalItems: number | undefined;
    totalPages: number | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface ProductHookReturn {
    product: Product | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface CategoriesHookReturn {
    categories: Category[] | undefined;
    totalItems: number | undefined;
    totalPages: number | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface CategoryHookReturn {
    category: Category | undefined;
    isLoading: boolean;
    error: Error | null;
}
