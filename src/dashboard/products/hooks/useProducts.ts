import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import type {
    ProductItem,
    ProductFilterState,
    ProductStatusCount,
} from '../types';

interface UseProductsReturn {
    data: ProductItem[];
    isLoading: boolean;
    totalItems: number;
    totalPages: number;
    statusCounts: ProductStatusCount[];
    fetchProducts: () => void;
    fetchStatusCounts: () => void;
    deleteProduct: ( productId: number ) => Promise< void >;
    deleteProducts: ( productIds: number[] ) => Promise< void >;
}

export const useProducts = (
    filterArgs: ProductFilterState
): UseProductsReturn => {
    const [ data, setData ] = useState< ProductItem[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ statusCounts, setStatusCounts ] = useState< ProductStatusCount[] >(
        [
            { value: 'all', label: 'All', count: 0 },
            { value: 'publish', label: 'Published', count: 0 },
            { value: 'draft', label: 'Draft', count: 0 },
            { value: 'pending', label: 'Pending Review', count: 0 },
        ]
    );

    const fetchProducts = useCallback( async () => {
        setIsLoading( true );
        try {
            const queryArgs: Record< string, any > = {
                per_page: filterArgs.per_page,
                page: filterArgs.page,
            };

            if ( filterArgs.status !== 'all' ) {
                queryArgs.status = filterArgs.status;
            }

            if ( filterArgs.search ) {
                queryArgs.search = filterArgs.search;
            }

            const response = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/products', queryArgs ),
                parse: false,
            } ) ) as Response;

            const responseData: ProductItem[] = await response.json();
            const responseTotalItems = response.headers.get( 'X-WP-Total' );
            const responseTotalPages =
                response.headers.get( 'X-WP-TotalPages' );

            setData( responseData );
            setTotalItems( parseInt( responseTotalItems ?? '0', 10 ) );
            setTotalPages( parseInt( responseTotalPages ?? '0', 10 ) );
        } catch ( error ) {
            console.error( 'Error fetching products:', error );
            setData( [] );
        } finally {
            setIsLoading( false );
        }
    }, [
        filterArgs.page,
        filterArgs.per_page,
        filterArgs.status,
        filterArgs.search,
    ] );

    const fetchStatusCounts = useCallback( async () => {
        try {
            const response = ( await apiFetch( {
                path: '/dokan/v1/products/summary',
            } ) ) as {
                post_counts: Record< string, number >;
            };

            const counts = response.post_counts ?? {};
            const allCount =
                ( counts.publish ?? 0 ) +
                ( counts.draft ?? 0 ) +
                ( counts.pending ?? 0 );

            setStatusCounts( [
                { value: 'all', label: 'All', count: allCount },
                {
                    value: 'publish',
                    label: 'Published',
                    count: counts.publish ?? 0,
                },
                { value: 'draft', label: 'Draft', count: counts.draft ?? 0 },
                {
                    value: 'pending',
                    label: 'Pending Review',
                    count: counts.pending ?? 0,
                },
            ] );
        } catch ( error ) {
            console.error( 'Error fetching product summary:', error );
        }
    }, [] );

    const deleteProduct = useCallback( async ( productId: number ) => {
        await apiFetch( {
            path: `/dokan/v1/products/${ productId }`,
            method: 'DELETE',
            data: { force: true },
        } );
    }, [] );

    const deleteProducts = useCallback( async ( productIds: number[] ) => {
        await Promise.all(
            productIds.map( ( id ) =>
                apiFetch( {
                    path: `/dokan/v1/products/${ id }`,
                    method: 'DELETE',
                    data: { force: true },
                } )
            )
        );
    }, [] );

    useEffect( () => {
        void fetchProducts();
    }, [ fetchProducts ] );

    useEffect( () => {
        void fetchStatusCounts();
    }, [ fetchStatusCounts ] );

    return {
        data,
        isLoading,
        totalItems,
        totalPages,
        statusCounts,
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
    };
};
