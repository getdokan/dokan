import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import {
    Category,
    QueryParams,
    State,
} from '@dokan/definitions/dokan-product-categories';

export const selectors = {
    // Category selectors
    getItem: ( state: State, id: number ): Category | undefined =>
        state.categories[ id ],

    getItems: (
        state: State,
        query: QueryParams = {}
    ): Category[] | undefined => {
        const path = addQueryArgs( '/dokan/v2/categories', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        const queryResult = state.categoryQueries[ queryId ];

        if ( ! queryResult ) {
            return undefined;
        }

        return queryResult.ids
            .map( ( id ) => state.categories[ id ] )
            .filter( Boolean );
    },

    getCategoryQueryTotalCount: (
        state: State,
        query: QueryParams = {}
    ): number | undefined => {
        const path = addQueryArgs( '/dokan/v2/categories', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        return state.categoryQueries[ queryId ]?.totalCount;
    },

    getCategoryQueryTotalPages: (
        state: State,
        query: QueryParams = {}
    ): number | undefined => {
        const path = addQueryArgs( '/dokan/v2/categories', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        return state.categoryQueries[ queryId ]?.totalPages;
    },

    isCategoriesLoading: ( state: State ): boolean => state.isCategoriesLoading,

    getCategoryError: ( state: State ): Error | null => state.categoryError,
};
