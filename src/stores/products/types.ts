export interface Product {
    id: number;
    name: string;
    price: string;
    [ key: string ]: any;
}

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
    items: Record< number, Product >;
    queries: Record< string, QueryResult >;
    categories: Record< number, Category >;
    categoryQueries: Record< string, QueryResult >;
    isLoading: boolean;
    isCategoriesLoading: boolean;
    error: Error | null;
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
    getItems( query: QueryParams ): Product[] | undefined;
    getItem( id: number ): Product | undefined;
    getQueryTotalCount( query: QueryParams ): number | undefined;
    getQueryTotalPages( query: QueryParams ): number | undefined;
    isLoading(): boolean;
    getError(): Error | null;
    getCategories( query: QueryParams ): Category[] | undefined;
    getCategory( id: number ): Category | undefined;
    getCategoryQueryTotalCount( query: QueryParams ): number | undefined;
    getCategoryQueryTotalPages( query: QueryParams ): number | undefined;
    isCategoriesLoading(): boolean;
    getCategoryError(): Error | null;
}

// Define the shape of the select function
export interface Select {
    ( storeName: string ): StoreSelectors;
}
