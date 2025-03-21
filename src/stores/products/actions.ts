import { Product, Category } from './types';

export const SET_ITEMS = 'SET_ITEMS';
export const SET_QUERY = 'SET_QUERY';
export const SET_ERROR = 'SET_ERROR';
export const SET_LOADING = 'SET_LOADING';
export const SET_CATEGORIES = 'SET_CATEGORIES';
export const SET_CATEGORY_QUERY = 'SET_CATEGORY_QUERY';
export const SET_CATEGORY_ERROR = 'SET_CATEGORY_ERROR';
export const SET_CATEGORIES_LOADING = 'SET_CATEGORIES_LOADING';

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

interface SetCategoriesAction {
    type: typeof SET_CATEGORIES;
    categories: Record< number, Category >;
}

interface SetCategoryQueryAction {
    type: typeof SET_CATEGORY_QUERY;
    queryId: string;
    ids: number[];
    totalCount: number;
    totalPages: number;
}

interface SetCategoryErrorAction {
    type: typeof SET_CATEGORY_ERROR;
    error: Error;
}

interface SetCategoriesLoadingAction {
    type: typeof SET_CATEGORIES_LOADING;
    isLoading: boolean;
}

export type ActionTypes =
    | SetItemsAction
    | SetQueryAction
    | SetErrorAction
    | SetLoadingAction
    | SetCategoriesAction
    | SetCategoryQueryAction
    | SetCategoryErrorAction
    | SetCategoriesLoadingAction;

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

    setCategories: (
        categories: Record< number, Category >
    ): SetCategoriesAction => ( {
        type: SET_CATEGORIES,
        categories,
    } ),

    setCategoryQuery: (
        queryId: string,
        ids: number[],
        totalCount: number,
        totalPages: number
    ): SetCategoryQueryAction => ( {
        type: SET_CATEGORY_QUERY,
        queryId,
        ids,
        totalCount,
        totalPages,
    } ),

    setCategoryError: ( error: Error ): SetCategoryErrorAction => ( {
        type: SET_CATEGORY_ERROR,
        error,
    } ),

    setCategoriesLoading: (
        isLoading: boolean
    ): SetCategoriesLoadingAction => ( {
        type: SET_CATEGORIES_LOADING,
        isLoading,
    } ),
};
