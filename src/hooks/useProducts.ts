import { QueryParams, Select, storeName } from '@dokan/stores/products';

import { useSelect } from '@wordpress/data';

interface Product {
    id: number;
    name: string;
    price: string;

    [ key: string ]: any;
}

export interface ProductsHookData {
    products: Product[] | undefined;
    totalItems: number | undefined;
    totalPages: number | undefined;
    isLoading: boolean;
    error: Error | null;
}

export interface ProductHookData {
    product: Product | undefined;
    isLoading: boolean;
    error: Error | null;
}

export function useProducts( query: QueryParams = {} ): ProductsHookData {
    return useSelect(
        ( select: Select ) => ( {
            products: select( storeName ).getItems( query ),
            totalItems: select( storeName ).getQueryTotalCount( query ),
            totalPages: select( storeName ).getQueryTotalPages( query ),
            isLoading: select( storeName ).isLoading(),
            error: select( storeName ).getError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useProduct( id: number ): ProductHookData {
    return useSelect(
        ( select: Select ) => ( {
            product: select( storeName ).getItem( id ),
            isLoading: select( storeName ).isLoading(),
            error: select( storeName ).getError(),
        } ),
        [ id ]
    );
}
