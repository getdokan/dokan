import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';
import { Category, QueryParams } from './types';
import { actions } from './actions';

export const resolvers = {
    getItems:
        ( query: QueryParams = {} ) =>
        async ( { dispatch } ) => {
            dispatch( actions.setCategoriesLoading( true ) );
            try {
                const path = addQueryArgs(
                    '/dokan/v1/products/categories',
                    query as Record< string, string >
                );
                const queryId = JSON.stringify( getQueryArgs( path ) );

                const response = await apiFetch< Response >( {
                    path,
                    parse: false,
                } );

                const data = ( await response.json() ) as Category[];
                const totalItems = parseInt(
                    response.headers.get( 'X-WP-Total' ) || '0',
                    10
                );
                const totalPages = parseInt(
                    response.headers.get( 'X-WP-TotalPages' ) || '0',
                    10
                );

                const normalizedCategories: Record< number, Category > = {};
                const ids = data?.map( ( category ) => {
                    normalizedCategories[ category.id ] = category;
                    return category?.id;
                } );

                dispatch( actions.setCategories( normalizedCategories ) );
                dispatch(
                    actions.setCategoryQuery(
                        queryId,
                        ids,
                        totalItems,
                        totalPages
                    )
                );
            } catch ( error ) {
                dispatch( actions.setCategoryError( error as Error ) );
            } finally {
                dispatch( actions.setCategoriesLoading( false ) );
            }
        },
    getItem:
        ( id: number ) =>
        async ( { dispatch } ) => {
            try {
                const response = await apiFetch< Category >( {
                    path: `/dokan/v1/products/categories/${ id }`,
                } );

                return dispatch(
                    actions.setCategories( { [ id ]: response } )
                );
            } catch ( error ) {
                return dispatch( actions.setCategoryError( error as Error ) );
            }
        },
};
