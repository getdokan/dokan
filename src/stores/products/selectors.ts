import { Category, Product, QueryParams, State } from './types';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';

export const selectors = {
    getItem: ( state: State, id: number ): Product | undefined =>
        state.items[ id ],

    getItems: (
        state: State,
        query: QueryParams = {}
    ): Product[] | undefined => {
        // const queryId = getQueryId( query );
        const path = addQueryArgs( '/dokan/v2/products', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        const queryResult = state.queries[ queryId ];

        if ( ! queryResult ) {
            return undefined;
        }

        return queryResult.ids
            .map( ( id ) => state.items[ id ] )
            .filter( Boolean );
    },

    getQueryTotalCount: (
        state: State,
        query: QueryParams = {}
    ): number | undefined => {
        const path = addQueryArgs( '/dokan/v2/products', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        return state.queries[ queryId ]?.totalCount;
    },

    getQueryTotalPages: (
        state: State,
        query: QueryParams = {}
    ): number | undefined => {
        // const queryId = getQueryId( query );
        const path = addQueryArgs( '/dokan/v2/products', query );
        const queryId = JSON.stringify( getQueryArgs( path ) );
        return state.queries[ queryId ]?.totalPages;
    },

    isLoading: ( state: State ): boolean => state.isLoading,

    getError: ( state: State ): Error | null => state.error,

    // Category selectors
    getCategory: ( state: State, id: number ): Category | undefined =>
        state.categories[ id ],

    getCategories: (
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
