import { createReduxStore, register, useSelect } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './ resolvers';
import { STORE_NAME } from './constants';
import { actions } from './actions';
import { QueryParams, Select } from './types';
import {
    CategoriesHookData,
    CategoryHookData,
    ProductHookData,
    ProductsHookData,
} from './hooks';

const store = createReduxStore( STORE_NAME, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

register( store );

export * from './types';

// Update hook return types
export function useProducts( query: QueryParams = {} ): ProductsHookData {
    return useSelect(
        ( select: Select ) => ( {
            products: select( STORE_NAME ).getItems( query ),
            totalItems: select( STORE_NAME ).getQueryTotalCount( query ),
            totalPages: select( STORE_NAME ).getQueryTotalPages( query ),
            isLoading: select( STORE_NAME ).isLoading(),
            error: select( STORE_NAME ).getError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useProduct( id: number ): ProductHookData {
    return useSelect(
        ( select: Select ) => ( {
            product: select( STORE_NAME ).getItem( id ),
            isLoading: select( STORE_NAME ).isLoading(),
            error: select( STORE_NAME ).getError(),
        } ),
        [ id ]
    );
}

export function useCategories( query: QueryParams = {} ): CategoriesHookData {
    return useSelect(
        ( select: Select ) => ( {
            categories: select( STORE_NAME ).getCategories( query ),
            totalItems:
                select( STORE_NAME ).getCategoryQueryTotalCount( query ),
            totalPages:
                select( STORE_NAME ).getCategoryQueryTotalPages( query ),
            isLoading: select( STORE_NAME ).isCategoriesLoading(),
            error: select( STORE_NAME ).getCategoryError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useCategory( id: number ): CategoryHookData {
    return useSelect(
        ( select: Select ) => ( {
            category: select( STORE_NAME ).getCategory( id ),
            isLoading: select( STORE_NAME ).isCategoriesLoading(),
            error: select( STORE_NAME ).getCategoryError(),
        } ),
        [ id ]
    );
}

export const PRODUCTS_STORE_NAME = STORE_NAME;
