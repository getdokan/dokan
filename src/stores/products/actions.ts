import apiFetch from '@wordpress/api-fetch';
import { Product } from '../../definitions/dokan-product';

export const SET_ITEMS = 'SET_ITEMS';
export const SET_QUERY = 'SET_QUERY';
export const SET_ERROR = 'SET_ERROR';
export const SET_LOADING = 'SET_LOADING';

interface SetItemsAction {
    type: typeof SET_ITEMS;
    items: Record< number, Product >;
}

interface SetQueryAction {
    type: typeof SET_QUERY;
    queryId: string;
    ids: number[];
    totalCount: number;
    totalPages: number;
}

interface SetErrorAction {
    type: typeof SET_ERROR;
    error: Error;
}

interface SetLoadingAction {
    type: typeof SET_LOADING;
    isLoading: boolean;
}

export type ActionTypes =
    | SetItemsAction
    | SetQueryAction
    | SetErrorAction
    | SetLoadingAction;

interface BatchResponse {
    update?: Array< Record< string, any > >;
    delete?: Array< Record< string, any > >;
}

export const actions = {
    setItems: ( items: Record< number, Product > ): SetItemsAction => ( {
        type: SET_ITEMS,
        items,
    } ),

    setQuery: (
        queryId: string,
        ids: number[],
        totalCount: number,
        totalPages: number
    ): SetQueryAction => ( {
        type: SET_QUERY,
        queryId,
        ids,
        totalCount,
        totalPages,
    } ),

    setError: ( error: Error ): SetErrorAction => ( {
        type: SET_ERROR,
        error,
    } ),

    setLoading: ( isLoading: boolean ): SetLoadingAction => ( {
        type: SET_LOADING,
        isLoading,
    } ),

    batchUpdateProducts(
        productIds: number[],
        data: Record< string, any >
    ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        update: productIds.map( ( id ) => ( {
                            id,
                            ...data,
                        } ) ),
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    batchDeleteProducts( productIds: number[] ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        delete: productIds,
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    batchUpdateProductsStatus( productIds: number[], status: string ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        update: productIds.map( ( id ) => ( {
                            id,
                            status,
                        } ) ),
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },
};
