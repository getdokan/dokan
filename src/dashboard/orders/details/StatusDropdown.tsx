import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@getdokan/dokan-ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@wedevs/plugin-ui';
import { usePermission } from '@dokan/hooks';
import {
    ORDER_DETAILS_LOADED,
    ORDER_DETAILS_STATUS_CHANGED,
    emitOrderDetailsEvent,
    onOrderDetailsEvent,
} from '../events';
import { getStatusLabel } from '../status';
import { getOrderDetailsMarker } from './marker';
import { ORDER_DETAILS_STATUSES_FILTER } from './slots';
import type { OrderDetailsMeta } from '../types';

const unprefix = ( status: string ) =>
    status.startsWith( 'wc-' ) ? status.slice( 3 ) : status;

/**
 * The header's status control — the RFQ-style split button: the current status
 * as the primary segment, a chevron segment opening the list of other statuses.
 * Self-sufficient: it lives in the panel header outside the view tree, reading
 * and announcing status over the shared order-details events.
 * @param root0
 * @param root0.orderId
 */
const StatusDropdown = ( { orderId }: { orderId: number } ) => {
    const toast = useToast();
    const marker = getOrderDetailsMarker();
    const canManageOrder = usePermission( 'dokan_manage_order' );

    const [ status, setStatus ] = useState< string >( '' );
    const [ isSaving, setIsSaving ] = useState( false );

    useEffect( () => {
        const unsubscribeLoaded = onOrderDetailsEvent(
            ORDER_DETAILS_LOADED,
            ( loaded ) => {
                const meta = loaded as OrderDetailsMeta;

                if ( Number( meta?.id ) === orderId ) {
                    setStatus( unprefix( meta?.status ?? '' ) );
                }
            }
        );

        const unsubscribeChanged = onOrderDetailsEvent(
            ORDER_DETAILS_STATUS_CHANGED,
            ( changedOrderId, changedStatus ) => {
                if ( Number( changedOrderId ) === orderId ) {
                    setStatus( unprefix( String( changedStatus ) ) );
                }
            }
        );

        return () => {
            unsubscribeLoaded();
            unsubscribeChanged();
        };
    }, [ orderId ] );

    // Legacy parity (templates/orders/details.php): the control only exists
    // with the capability, the admin setting on, and never on orders already
    // cancelled or refunded.
    if (
        ! canManageOrder ||
        ! marker.status_change_allowed ||
        ! orderId ||
        ! status ||
        [ 'cancelled', 'refunded' ].includes( status )
    ) {
        return null;
    }

    /**
     * Filters the statuses a Vendor can switch this order to.
     *
     * The server publishes the list; this is where a store narrows it — a
     * workflow that forbids jumping straight to Completed, say.
     *
     * @param {Array}  statuses Selectable statuses as `{ value, label }`.
     * @param {string} status   The order's current (unprefixed) status.
     * @param {number} orderId  The order being changed.
     */
    const statuses = applyFilters(
        ORDER_DETAILS_STATUSES_FILTER,
        ( marker.statuses ?? [] ).filter(
            ( option ) => unprefix( option.value ) !== status
        ),
        status,
        orderId
    ) as Array< { value: string; label: string } >;

    const changeStatus = async ( wcStatus: string ) => {
        if ( unprefix( wcStatus ) === status || isSaving ) {
            return;
        }

        setIsSaving( true );

        try {
            await apiFetch( {
                path: `/dokan/v1/orders/${ orderId }`,
                method: 'PUT',
                data: { status: wcStatus },
            } );

            const plain = unprefix( wcStatus );

            emitOrderDetailsEvent( ORDER_DETAILS_STATUS_CHANGED, [
                orderId,
                plain,
                getStatusLabel( plain ),
            ] );

            toast( {
                type: 'success',
                title: __( 'Order status updated.', 'dokan-lite' ),
            } );
        } catch ( statusError ) {
            toast( {
                type: 'error',
                title:
                    ( statusError as { message?: string } )?.message ||
                    __( 'Could not update the order status.', 'dokan-lite' ),
            } );
        } finally {
            setIsSaving( false );
        }
    };

    // The RFQ action button, measured: 42px tall, 12px label padding, a 42px
    // chevron segment, 14/500 type, 6px radius, a hairline seam between the
    // segments. One trigger — the whole control opens the menu.
    return (
        <span
            className={ `relative inline-flex ${
                isSaving ? 'opacity-70' : ''
            }` }
        >
            <DropdownMenu>
                <DropdownMenuTrigger
                    disabled={ isSaving }
                    aria-label={ __( 'Change order status', 'dokan-lite' ) }
                    className="flex h-[42px]! cursor-pointer items-stretch overflow-hidden rounded-md! border-0! bg-dokan-btn! p-0! text-white! shadow-none! hover:bg-dokan-btn-hover!"
                >
                    <span className="flex items-center border-r border-white px-3 text-sm font-medium">
                        { getStatusLabel( status ) }
                    </span>
                    <span className="flex w-[42px] items-center justify-center">
                        <ChevronDown size={ 18 } />
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="z-50 min-w-[168px] rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
                >
                    { statuses.map( ( option ) => (
                        <DropdownMenuItem
                            key={ option.value }
                            className="px-3 py-2 text-sm text-[#25252D]"
                            onClick={ () => changeStatus( option.value ) }
                        >
                            { option.label }
                        </DropdownMenuItem>
                    ) ) }
                </DropdownMenuContent>
            </DropdownMenu>
        </span>
    );
};

export default StatusDropdown;
