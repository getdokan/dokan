import { useSelect } from '@wordpress/data';
import productCategoryStore from '@dokan/stores/product-categories';
import { Category } from '@dokan/definitions/dokan-product-categories';

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
            categories: select( productCategoryStore ).getItems( query ),
            totalItems:
                select( productCategoryStore ).getCategoryQueryTotalCount(
                    query
                ),
            totalPages:
                select( productCategoryStore ).getCategoryQueryTotalPages(
                    query
                ),
            isLoading: select( productCategoryStore ).isCategoriesLoading(),
            error: select( productCategoryStore ).getCategoryError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useCategory( id: number ): CategoryHookData {
    return useSelect(
        ( select ) => ( {
            category: select( productCategoryStore ).getItem( id ),
            isLoading: select( productCategoryStore ).isCategoriesLoading(),
            error: select( productCategoryStore ).getCategoryError(),
        } ),
        [ id ]
    );
}
