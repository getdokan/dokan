import { createReduxStore, register, useSelect } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { STORE_NAME } from './constants';
import { actions } from './actions';
import { resolvers } from './resolvers';
import { QueryParams, Select } from './types';
import { CategoriesHookData, CategoryHookData } from './hooks';

const store = createReduxStore( STORE_NAME, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

register( store );

export * from './types';

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

export const CATEGORY_STORE_NAME = STORE_NAME;
