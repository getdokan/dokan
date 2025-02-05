import { State } from './types';

export const DEFAULT_STATE: State = {
    items: {},
    queries: {},
    categories: {},
    categoryQueries: {},
    isLoading: false,
    isCategoriesLoading: false,
    error: null,
    categoryError: null,
};
