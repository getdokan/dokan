import { State, QueryParams, Product, Category } from './types';
import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_CATEGORIES,
    SET_CATEGORIES_LOADING,
    SET_CATEGORY_ERROR,
    SET_CATEGORY_QUERY,
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
