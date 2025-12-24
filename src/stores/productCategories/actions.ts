import { Category } from './types';

export const SET_CATEGORIES = 'SET_CATEGORIES';
export const SET_CATEGORY_QUERY = 'SET_CATEGORY_QUERY';
export const SET_CATEGORY_ERROR = 'SET_CATEGORY_ERROR';
export const SET_CATEGORIES_LOADING = 'SET_CATEGORIES_LOADING';

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
    | SetCategoriesAction
    | SetCategoryQueryAction
    | SetCategoryErrorAction
    | SetCategoriesLoadingAction;
export const actions = {
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
