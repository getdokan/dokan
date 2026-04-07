import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import type { OrderItem, OrderFilterState, OrderStatusCount } from '../types';

interface UseOrdersReturn {
    data: OrderItem[];
    isLoading: boolean;
    hasError: boolean;
    totalItems: number;
    totalPages: number;
    statusCounts: OrderStatusCount[];
    fetchOrders: () => void;
    fetchStatusCounts: () => void;
    updateOrderStatus: ( orderId: number, status: string ) => Promise< void >;
}

const defaultStatusCounts: OrderStatusCount[] = [
    { value: 'all', label: __( 'All', 'dokan-lite' ), count: 0 },
    {
        value: 'wc-pending',
        label: __( 'Pending Payment', 'dokan-lite' ),
        count: 0,
    },
    {
        value: 'wc-processing',
        label: __( 'Processing', 'dokan-lite' ),
        count: 0,
    },
    { value: 'wc-on-hold', label: __( 'On-hold', 'dokan-lite' ), count: 0 },
    { value: 'wc-completed', label: __( 'Completed', 'dokan-lite' ), count: 0 },
    { value: 'wc-cancelled', label: __( 'Cancelled', 'dokan-lite' ), count: 0 },
    { value: 'wc-refunded', label: __( 'Refunded', 'dokan-lite' ), count: 0 },
    { value: 'wc-failed', label: __( 'Failed', 'dokan-lite' ), count: 0 },
];

export const useOrders = ( filterArgs: OrderFilterState ): UseOrdersReturn => {
    const [ data, setData ] = useState< OrderItem[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ hasError, setHasError ] = useState( false );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ statusCounts, setStatusCounts ] =
        useState< OrderStatusCount[] >( defaultStatusCounts );

    const fetchItems = useCallback( async () => {
        setIsLoading( true );
        setHasError( false );
        try {
            const queryArgs: Record< string, any > = {
                per_page: filterArgs.per_page,
                page: filterArgs.page,
            };

            if ( filterArgs.status && filterArgs.status !== 'all' ) {
                queryArgs.status = filterArgs.status;
            }

            if ( filterArgs.search ) {
                queryArgs.search = filterArgs.search;
            }

            if ( filterArgs.customer_id ) {
                queryArgs.customer_id = filterArgs.customer_id;
            }

            if ( filterArgs.after ) {
                queryArgs.after = filterArgs.after;
            }

            if ( filterArgs.before ) {
                queryArgs.before = filterArgs.before;
            }

            const response = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/orders', queryArgs ),
                parse: false,
            } ) ) as Response;

            const responseData: OrderItem[] = await response.json();

            setData( responseData );
            setTotalItems(
                parseInt( response.headers.get( 'X-WP-Total' ) ?? '0', 10 )
            );
            setTotalPages(
                parseInt( response.headers.get( 'X-WP-TotalPages' ) ?? '0', 10 )
            );
        } catch {
            setData( [] );
            setHasError( true );
        } finally {
            setIsLoading( false );
        }
    }, [
        filterArgs.page,
        filterArgs.per_page,
        filterArgs.status,
        filterArgs.search,
        filterArgs.customer_id,
        filterArgs.after,
        filterArgs.before,
    ] );

    const fetchStatusCounts = useCallback( async () => {
        try {
            const response = ( await apiFetch( {
                path: '/dokan/v1/orders/summary',
            } ) ) as Record< string, number >;

            const allCount = response?.total ?? 0;

            setStatusCounts( [
                {
                    value: 'all',
                    label: __( 'All', 'dokan-lite' ),
                    count: allCount,
                },
                {
                    value: 'wc-pending',
                    label: __( 'Pending Payment', 'dokan-lite' ),
                    count: response?.[ 'wc-pending' ] ?? 0,
                },
                {
                    value: 'wc-processing',
                    label: __( 'Processing', 'dokan-lite' ),
                    count: response?.[ 'wc-processing' ] ?? 0,
                },
                {
                    value: 'wc-on-hold',
                    label: __( 'On-hold', 'dokan-lite' ),
                    count: response?.[ 'wc-on-hold' ] ?? 0,
                },
                {
                    value: 'wc-completed',
                    label: __( 'Completed', 'dokan-lite' ),
                    count: response?.[ 'wc-completed' ] ?? 0,
                },
                {
                    value: 'wc-cancelled',
                    label: __( 'Cancelled', 'dokan-lite' ),
                    count: response?.[ 'wc-cancelled' ] ?? 0,
                },
                {
                    value: 'wc-refunded',
                    label: __( 'Refunded', 'dokan-lite' ),
                    count: response?.[ 'wc-refunded' ] ?? 0,
                },
                {
                    value: 'wc-failed',
                    label: __( 'Failed', 'dokan-lite' ),
                    count: response?.[ 'wc-failed' ] ?? 0,
                },
            ] );
        } catch {
            // Silently fail - tabs will show default zero counts.
        }
    }, [] );

    const updateOrderStatus = useCallback(
        async ( orderId: number, status: string ) => {
            await apiFetch( {
                path: `/dokan/v1/orders/${ orderId }`,
                method: 'PUT',
                data: { status },
            } );
        },
        []
    );

    useEffect( () => {
        void fetchItems();
    }, [ fetchItems ] );

    useEffect( () => {
        void fetchStatusCounts();
    }, [ fetchStatusCounts ] );

    return {
        data,
        isLoading,
        hasError,
        totalItems,
        totalPages,
        statusCounts,
        fetchOrders: fetchItems,
        fetchStatusCounts,
        updateOrderStatus,
    };
};
