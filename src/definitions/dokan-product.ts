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
