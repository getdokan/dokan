import apiFetch from '@wordpress/api-fetch';
import { Category, Product, QueryParams } from './types';
import { actions } from './actions';
import { getQueryId } from './utils';

export const resolvers = {
    getItem:
        ( id: number ) =>
        async ( { dispatch }: { dispatch } ) => {
            try {
                const response = await apiFetch< Product >( {
                    path: `/dokan/v2/products/${ id }`,
                } );

                return dispatch( actions.setItems( { [ id ]: response } ) );
            } catch ( error ) {
                return dispatch( actions.setError( error as Error ) );
            }
        },

    getItems:
        ( query: QueryParams = {} ) =>
        async ( { dispatch }: { dispatch } ) => {
            const queryId = getQueryId( query );

            dispatch( actions.setLoading( true ) );
            try {
                const response = await apiFetch< Response >( {
                    path:
                        '/dokan/v2/products?' +
                        new URLSearchParams(
                            query as Record< string, string >
                        ).toString(),
                    parse: false,
                } );

                const data = ( await response.json() ) as Product[];
                const totalItems = parseInt(
                    response.headers.get( 'X-WP-Total' ) || '0',
                    10
                );
                const totalPages = parseInt(
                    response.headers.get( 'X-WP-TotalPages' ) || '0',
                    10
                );

                const normalizedItems: Record< number, Product > = {};
                const ids = data.map( ( item ) => {
                    normalizedItems[ item.id ] = item;
                    return item.id;
                } );

                dispatch( actions.setItems( normalizedItems ) );
                dispatch(
                    actions.setQuery( queryId, ids, totalItems, totalPages )
                );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
            } finally {
                dispatch( actions.setLoading( false ) );
            }
        },

    getCategories:
        ( query: QueryParams = {} ) =>
        async ( { dispatch }: { dispatch } ) => {
            const queryId = getQueryId( query );

            dispatch( actions.setCategoriesLoading( true ) );
            try {
                const response = await apiFetch< Response >( {
                    path:
                        '/dokan/v1/product-categories?' +
                        new URLSearchParams(
                            query as Record< string, string >
                        ).toString(),
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
                const ids = data.map( ( category ) => {
                    normalizedCategories[ category.id ] = category;
                    return category.id;
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
};
