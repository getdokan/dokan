/**
 * Order status presentation, shared by the list and the details header.
 *
 * Status helpers take unprefixed values (e.g. `completed`, `processing`) because the
 * REST API returns unprefixed statuses on order items. Tabs and filters use wc-prefixed
 * values (e.g. `wc-completed`) because the API expects that format for filtering.
 */

declare const window: Window & {
    dokan?: {
        orderStatuses?: Array< {
            value: string;
            label: string;
        } >;
    };
};

export type OrderStatusBadgeVariant =
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'secondary';

export const getStatusBadgeVariant = (
    status: string
): OrderStatusBadgeVariant => {
    switch ( status ) {
        case 'completed':
            return 'success';
        case 'processing':
            return 'info';
        case 'on-hold':
            return 'warning';
        case 'pending':
        case 'failed':
            return 'danger';
        case 'cancelled':
        case 'refunded':
            return 'secondary';
        default:
            return 'secondary';
    }
};

export const getStatusLabel = ( status: string ) => {
    const statuses = window?.dokan?.orderStatuses;

    if ( Array.isArray( statuses ) ) {
        const prefixed = `wc-${ status }`;
        const found = statuses.find(
            ( s ) => s.value === prefixed || s.value === status
        );
        if ( found ) {
            return found.label;
        }
    }

    return status;
};
