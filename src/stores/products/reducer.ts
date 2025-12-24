import { State } from './types';
import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_ERROR,
    SET_ITEMS,
    SET_LOADING,
    SET_QUERY,
} from './actions';

export const reducer = (
    state: State = DEFAULT_STATE,
    action: ActionTypes
): State => {
    switch ( action.type ) {
        case SET_ITEMS:
            return {
                ...state,
                items: {
                    ...state.items,
                    ...action.items,
                },
                error: null,
            };

        case SET_QUERY:
            return {
                ...state,
                queries: {
                    ...state.queries,
                    [ action.queryId ]: {
                        ids: action.ids,
                        totalCount: action.totalCount,
                        totalPages: action.totalPages,
                    },
                },
                error: null,
            };

        case SET_ERROR:
            return {
                ...state,
                error: action.error,
            };

        case SET_LOADING:
            return {
                ...state,
                isLoading: action.isLoading,
            };

        default:
            return state;
    }
};
