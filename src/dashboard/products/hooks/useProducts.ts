import { useState, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';
import type {
    ProductItem,
    ProductFilterState,
    ProductStatusCount,
    ProductSummary,
    ProductMonthOption,
    SubscriptionRemaining,
} from '../types';

interface UseProductsReturn {
    data: ProductItem[];
    isLoading: boolean;
    totalItems: number;
    totalPages: number;
    statusCounts: ProductStatusCount[];
    productsUrl: string;
    instockCount: number;
    outstockCount: number;
    monthOptions: ProductMonthOption[];
    subscriptionRemaining: SubscriptionRemaining | null;
    fetchProducts: () => void;
    fetchStatusCounts: () => void;
    deleteProduct: ( productId: number ) => Promise< void >;
    deleteProducts: ( productIds: number[] ) => Promise< void >;
    updateProductStatus: (
        productId: number,
        status: string
    ) => Promise< void >;
    updateProductsStatus: (
        productIds: number[],
        status: string
    ) => Promise< void >;
}

export const useProducts = (
    filterArgs: ProductFilterState
): UseProductsReturn => {
    const [ data, setData ] = useState< ProductItem[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ productsUrl, setProductsUrl ] = useState( '' );
    const [ instockCount, setInstockCount ] = useState( 0 );
    const [ outstockCount, setOutstockCount ] = useState( 0 );
    const [ subscriptionRemaining, setSubscriptionRemaining ] =
        useState< SubscriptionRemaining | null >( null );
    const [ monthOptions, setMonthOptions ] = useState< ProductMonthOption[] >(
        []
    );

    const [ statusCounts, setStatusCounts ] = useState< ProductStatusCount[] >(
        [
            {
                value: 'all',
                label: __( 'All', 'dokan-lite' ),
                count: 0,
            },
            {
                value: 'publish',
                label: __( 'Published', 'dokan-lite' ),
                count: 0,
            },
            {
                value: 'draft',
                label: __( 'Draft', 'dokan-lite' ),
                count: 0,
            },
            {
                value: 'pending',
                label: __( 'Pending Review', 'dokan-lite' ),
                count: 0,
            },
            {
                value: 'future',
                label: __( 'Scheduled', 'dokan-lite' ),
                count: 0,
            },
        ]
    );

    const fetchProducts = useCallback( async () => {
        setIsLoading( true );
        try {
            const queryArgs: Record< string, any > = {
                per_page: filterArgs.per_page,
                page: filterArgs.page,
                include_hidden_products: true,
            };

            if ( filterArgs.status !== 'all' ) {
                queryArgs.status = filterArgs.status;
            }

            if ( filterArgs.search ) {
                queryArgs.search = filterArgs.search;
            }

            if ( filterArgs.category ) {
                queryArgs.category = filterArgs.category;
            }

            if ( filterArgs.type ) {
                queryArgs.type = filterArgs.type;
            }

            if ( filterArgs.year_month ) {
                queryArgs.year_month = filterArgs.year_month;
            }

            if ( filterArgs.in_stock !== undefined ) {
                queryArgs.in_stock = filterArgs.in_stock;
            }

            if ( filterArgs.product_brand ) {
                queryArgs.product_brand = filterArgs.product_brand;
            }

            if ( filterArgs.filter_by_other ) {
                queryArgs.filter_by_other = filterArgs.filter_by_other;
            }

            /**
             * Filter the query args sent with the vendor product list REST
             * requests.
             *
             * Applied to both the list request and the status-count (summary)
             * request, so anything added here — e.g. `include_types`, which
             * opts excluded product types back into this listing — keeps the
             * list and its counts in sync.
             *
             * @since DOKAN_SINCE
             *
             * @param {Object} queryArgs Query args about to be sent.
             */
            const finalQueryArgs = applyFilters(
                'dokan_product_list_query_args',
                queryArgs
            ) as Record< string, any >;

            const response = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/products', finalQueryArgs ),
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
            // eslint-disable-next-line no-console
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
        filterArgs.category,
        filterArgs.type,
        filterArgs.year_month,
        filterArgs.in_stock,
        filterArgs.product_brand,
        filterArgs.filter_by_other,
    ] );

    const fetchStatusCounts = useCallback( async () => {
        try {
            /** This filter is documented above in fetchProducts. */
            const summaryQueryArgs = applyFilters(
                'dokan_product_list_query_args',
                {}
            ) as Record< string, any >;

            const response = ( await apiFetch( {
                path: addQueryArgs(
                    '/dokan/v1/products/summary',
                    summaryQueryArgs
                ),
            } ) ) as ProductSummary;

            const counts = response.post_counts ?? {};
            const allCount =
                ( counts.publish ?? 0 ) +
                ( counts.draft ?? 0 ) +
                ( counts.pending ?? 0 ) +
                ( counts.future ?? 0 );

            const baseCounts: ProductStatusCount[] = [
                {
                    value: 'all',
                    label: __( 'All', 'dokan-lite' ),
                    count: allCount,
                },
                {
                    value: 'publish',
                    label: __( 'Published', 'dokan-lite' ),
                    count: counts.publish ?? 0,
                },
                {
                    value: 'draft',
                    label: __( 'Draft', 'dokan-lite' ),
                    count: counts.draft ?? 0,
                },
                {
                    value: 'pending',
                    label: __( 'Pending Review', 'dokan-lite' ),
                    count: counts.pending ?? 0,
                },
            ];

            /**
             * Filter the status counts derived from the products summary.
             *
             * @since 5.0.0
             *
             * @param {Array}  baseCounts Default status count entries.
             * @param {Object} postCounts Raw post_counts map from the API.
             */
            const finalCounts = applyFilters(
                'dokan_product_status_counts',
                baseCounts,
                counts
            ) as ProductStatusCount[];

            setStatusCounts( finalCounts );

            setProductsUrl( response.products_url ?? '' );
            setInstockCount( response.instock_count ?? 0 );
            setOutstockCount( response.outofstock_count ?? 0 );
            setMonthOptions( response.months ?? [] );
            setSubscriptionRemaining( response.subscription_remaining ?? null );
        } catch ( error ) {
            // eslint-disable-next-line no-console
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

    const updateProductStatus = useCallback(
        async ( productId: number, status: string ) => {
            await apiFetch( {
                path: `/dokan/v1/products/${ productId }`,
                method: 'PUT',
                data: { status },
            } );
        },
        []
    );

    const updateProductsStatus = useCallback(
        async ( productIds: number[], status: string ) => {
            await Promise.all(
                productIds.map( ( id ) =>
                    apiFetch( {
                        path: `/dokan/v1/products/${ id }`,
                        method: 'PUT',
                        data: { status },
                    } )
                )
            );
        },
        []
    );

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
        productsUrl,
        instockCount,
        outstockCount,
        monthOptions,
        subscriptionRemaining,
        fetchProducts,
        fetchStatusCounts,
        deleteProduct,
        deleteProducts,
        updateProductStatus,
        updateProductsStatus,
    };
};
