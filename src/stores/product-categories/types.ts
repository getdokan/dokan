export interface Category {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    count: number;
    thumbnail: string;
    link: string;
}

export interface QueryResult {
    ids: number[];
    totalCount: number;
    totalPages: number;
}

export interface State {
    categories: Record< number, Category >;
    categoryQueries: Record< string, QueryResult >;
    isCategoriesLoading: boolean;
    categoryError: Error | null;
}

export interface QueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    order?: 'asc' | 'desc';
    orderby?: string;

    [ key: string ]: any;
}

// Define the shape of our selectors
export interface StoreSelectors {
    getQueryTotalCount: ( query: QueryParams ) => number | undefined;
    getQueryTotalPages: ( query: QueryParams ) => number | undefined;
    getCategories: ( query: QueryParams ) => Category[] | undefined;
    getCategory: ( id: number ) => Category | undefined;
    getCategoryQueryTotalCount: ( query: QueryParams ) => number | undefined;
    getCategoryQueryTotalPages: ( query: QueryParams ) => number | undefined;
    isCategoriesLoading: () => boolean;
    getCategoryError: () => Error | null;
}

// Define the shape of the select function
export interface Select {
    ( storeName: string ): StoreSelectors;
}
