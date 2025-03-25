import { useSelect } from '@wordpress/data';
import { Select, storeName } from '@dokan/stores/product-categories';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    count: number;
    thumbnail: string;
    link: string;
}

export interface QueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    order?: 'asc' | 'desc';
    orderby?: string;

    [ key: string ]: any;
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

export function useCategories( query: QueryParams = {} ): CategoriesHookData {
    return useSelect(
        ( select: Select ) => ( {
            categories: select( storeName ).getCategories( query ),
            totalItems: select( storeName ).getCategoryQueryTotalCount( query ),
            totalPages: select( storeName ).getCategoryQueryTotalPages( query ),
            isLoading: select( storeName ).isCategoriesLoading(),
            error: select( storeName ).getCategoryError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useCategory( id: number ): CategoryHookData {
    return useSelect(
        ( select: Select ) => ( {
            category: select( storeName ).getCategory( id ),
            isLoading: select( storeName ).isCategoriesLoading(),
            error: select( storeName ).getCategoryError(),
        } ),
        [ id ]
    );
}
