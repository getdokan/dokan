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

interface DokanOrderStatus {
    value: string;
    label: string;
}

declare const window: Window & {
    dokan?: {
        orderStatuses?: DokanOrderStatus[];
    };
};

const getDefaultStatusCounts = (): OrderStatusCount[] => {
    const statuses = window?.dokan?.orderStatuses;

    if ( Array.isArray( statuses ) && statuses.length > 0 ) {
        return statuses.map( ( s ) => ( {
            value: s.value,
            label: s.label,
            count: 0,
        } ) );
    }

    // Fallback when localized data is unavailable.
    return [
        { value: 'all', label: __( 'All', 'dokan-lite' ), count: 0 },
    ];
};

export const useOrders = ( filterArgs: OrderFilterState ): UseOrdersReturn => {
    const [ data, setData ] = useState< OrderItem[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ hasError, setHasError ] = useState( false );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ statusCounts, setStatusCounts ] =
        useState< OrderStatusCount[] >( () => getDefaultStatusCounts() );

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

            const defaults = getDefaultStatusCounts();

            setStatusCounts(
                defaults.map( ( item ) => ( {
                    ...item,
                    count:
                        item.value === 'all'
                            ? response?.total ?? 0
                            : response?.[ item.value ] ?? 0,
                } ) )
            );
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
