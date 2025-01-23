// types.ts

// state.ts

// actions.ts

// selectors.ts

// resolvers.ts

// reducer.ts

// constants.ts

// index.ts
import { createReduxStore, register, useSelect } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './ resolvers';
import { STORE_NAME } from './constants';
import { actions } from './actions';
import { QueryParams, Select } from './types';
import {
    CategoriesHookReturn,
    CategoryHookReturn,
    ProductHookReturn,
    ProductsHookReturn,
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
export function useProducts( query: QueryParams = {} ): ProductsHookReturn {
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

export function useProduct( id: number ): ProductHookReturn {
    return useSelect(
        ( select: Select ) => ( {
            product: select( STORE_NAME ).getItem( id ),
            isLoading: select( STORE_NAME ).isLoading(),
            error: select( STORE_NAME ).getError(),
        } ),
        [ id ]
    );
}

export function useCategories( query: QueryParams = {} ): CategoriesHookReturn {
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

export function useCategory( id: number ): CategoryHookReturn {
    return useSelect(
        ( select: Select ) => ( {
            category: select( STORE_NAME ).getCategory( id ),
            isLoading: select( STORE_NAME ).isCategoriesLoading(),
            error: select( STORE_NAME ).getCategoryError(),
        } ),
        [ id ]
    );
}
