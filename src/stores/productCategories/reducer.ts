import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_CATEGORIES,
    SET_CATEGORIES_LOADING,
    SET_CATEGORY_ERROR,
    SET_CATEGORY_QUERY,
} from './actions';
import { State } from './types';

export const reducer = (
    state: State = DEFAULT_STATE,
    action: ActionTypes
): State => {
    switch ( action.type ) {
        case SET_CATEGORIES:
            return {
                ...state,
                categories: {
                    ...state.categories,
                    ...action.categories,
                },
                categoryError: null,
            };

        case SET_CATEGORY_QUERY:
            return {
                ...state,
                categoryQueries: {
                    ...state.categoryQueries,
                    [ action.queryId ]: {
                        ids: action.ids,
                        totalCount: action.totalCount,
                        totalPages: action.totalPages,
                    },
                },
                categoryError: null,
            };

        case SET_CATEGORY_ERROR:
            return {
                ...state,
                categoryError: action.error,
            };

        case SET_CATEGORIES_LOADING:
            return {
                ...state,
                isCategoriesLoading: action.isLoading,
            };

        default:
            return state;
    }
};
