import apiFetch from '@wordpress/api-fetch';
import { Product, QueryParams } from './types';
import { actions } from './actions';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';

export const resolvers = {
    getItem:
        ( id: number ) =>
        async ( { dispatch } ) => {
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
        async ( { dispatch } ) => {
            dispatch( actions.setLoading( true ) );
            try {
                const path = addQueryArgs( '/dokan/v2/products', query );
                const queryId = JSON.stringify( getQueryArgs( path ) );
                const response = await apiFetch< Response >( {
                    path,
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
};
