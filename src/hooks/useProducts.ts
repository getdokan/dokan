import { QueryParams } from '@dokan/definitions/dokan-product';

import products from '@dokan/stores/products';
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
        ( select ) => ( {
            products: select( products ).getItems( query ),
            totalItems: select( products ).getQueryTotalCount( query ),
            totalPages: select( products ).getQueryTotalPages( query ),
            isLoading: select( products ).isLoading(),
            error: select( products ).getError(),
        } ),
        [ JSON.stringify( query ) ]
    );
}

export function useProduct( id: number ): ProductHookData {
    return useSelect(
        ( select ) => ( {
            product: select( products ).getItem( id ),
            isLoading: select( products ).isLoading(),
            error: select( products ).getError(),
        } ),
        [ id ]
    );
}
