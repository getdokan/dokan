import { useSelect } from '@wordpress/data';
import productStore from '@dokan/stores/product-categories';

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
        ( select ) => ( {
            categories: select( productStore ).getItems( query ),
            totalItems:
                select( productStore ).getCategoryQueryTotalCount( query ),
            totalPages:
                select( productStore ).getCategoryQueryTotalPages( query ),
            isLoading: select( productStore ).isCategoriesLoading(),
            error: select( productStore ).getCategoryError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useCategory( id: number ): CategoryHookData {
    return useSelect(
        ( select ) => ( {
            category: select( productStore ).getItem( id ),
            isLoading: select( productStore ).isCategoriesLoading(),
            error: select( productStore ).getCategoryError(),
        } ),
        [ id ]
    );
}
