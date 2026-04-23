import { useState, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
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

const parseSummaryHeader = ( raw: string | null ): ProductSummary | null => {
    if ( ! raw ) {
        return null;
    }
    try {
        return JSON.parse( raw ) as ProductSummary;
    } catch {
        return null;
    }
};

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

    const applySummary = useCallback( ( summary: ProductSummary | null ) => {
        if ( ! summary ) {
            return;
        }

        const counts = summary.post_counts ?? {};
        // Backend returns `total` already summed across every dashboard status
        // (publish/draft/pending/future + any Pro-registered status like `reject`).
        // Fall back to summing the keys if `total` is missing for any reason.
        const allCount =
            typeof counts.total === 'number'
                ? counts.total
                : Object.entries( counts ).reduce(
                      ( sum, [ key, value ] ) =>
                          key === 'total' ? sum : sum + ( value ?? 0 ),
                      0
                  );

        // Lite labels for statuses it knows about; any additional status the
        // backend returns (e.g. Pro's `reject`) is still forwarded with its
        // slug as the label so consumers can read its count via statusCounts.
        const knownLabels: Record< string, string > = {
            publish: __( 'Published', 'dokan-lite' ),
            draft: __( 'Draft', 'dokan-lite' ),
            pending: __( 'Pending Review', 'dokan-lite' ),
            future: __( 'Scheduled', 'dokan-lite' ),
        };

        const perStatus = Object.entries( counts )
            .filter( ( [ key ] ) => key !== 'total' )
            .map( ( [ key, value ] ) => ( {
                value: key,
                label: knownLabels[ key ] ?? key,
                count: value ?? 0,
            } ) );

        setStatusCounts( [
            {
                value: 'all',
                label: __( 'All', 'dokan-lite' ),
                count: allCount,
            },
            ...perStatus,
        ] );

        setProductsUrl( summary.products_url ?? '' );
        setInstockCount( summary.instock_count ?? 0 );
        setOutstockCount( summary.outofstock_count ?? 0 );
        setMonthOptions( summary.months ?? [] );
        setSubscriptionRemaining( summary.subscription_remaining ?? null );
    }, [] );

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

            applySummary(
                parseSummaryHeader(
                    response.headers.get( 'X-Dokan-Product-Summary' )
                )
            );
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
        applySummary,
    ] );

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
        deleteProduct,
        deleteProducts,
        updateProductStatus,
        updateProductsStatus,
    };
};
