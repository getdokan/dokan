import { Product } from './types';

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
};
