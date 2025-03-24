export interface Product {
    id: number;
    name: string;
    price: string;
    [ key: string ]: any;
}

export interface QueryResult {
    ids: number[];
    totalCount: number;
    totalPages: number;
}

export interface State {
    items: Record< number, Product >;
    queries: Record< string, QueryResult >;
    isLoading: boolean;
    error: Error | null;
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
    getItems: ( query: QueryParams ) => Product[] | undefined;
    getItem: ( id: number ) => Product | undefined;
    getQueryTotalCount: ( query: QueryParams ) => number | undefined;
    getQueryTotalPages: ( query: QueryParams ) => number | undefined;
    isLoading: () => boolean;
    getError: () => Error | null;
}

// Define the shape of the select function
export interface Select {
    ( storeName: string ): StoreSelectors;
}
