import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Slot } from '@wordpress/components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DokanBadge, DokanButton } from '@dokan/components';
import { usePermission } from '@dokan/hooks';
import {
    ORDER_DETAILS_LOADED,
    ORDER_DETAILS_STATUS_CHANGED,
    onOrderDetailsEvent,
} from './events';
import { getStatusBadgeVariant, getStatusLabel } from './status';
import type { OrderDetailsMeta } from './types';

/**
 * Panel chrome for the order details route.
 *
 * The panel owns the chrome, not the fragment: the order number as the page title, the
 * current status as a badge, a back control, and an Edit Order action.
 *
 * Edit Order matters more than it looks. Pro attaches that control to the status-filter
 * bar, which renders above the details on the legacy page but which the fragment
 * deliberately does not include — the panel already provides that navigation. Without
 * re-providing it here the affordance simply disappears for Pro users.
 *
 * The status comes in over events rather than a second fetch, because the fragment is
 * the thing that knows: it loads the order, and the legacy script announces an inline
 * status change the moment it succeeds. A header that disagrees with the view beneath
 * it is worse than no header.
 */
const OrderDetailsHeader = () => {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = Number( params?.orderId ?? 0 );

    const [ order, setOrder ] = useState< OrderDetailsMeta | null >( null );
    const [ status, setStatus ] = useState< string >( '' );

    const canEditOrder = usePermission( 'dokan_manage_manual_order' );

    useEffect( () => {
        const unsubscribeLoaded = onOrderDetailsEvent(
            ORDER_DETAILS_LOADED,
            ( loaded ) => {
                const meta = loaded as OrderDetailsMeta;

                setOrder( meta );
                setStatus( meta?.status ?? '' );
            }
        );

        const unsubscribeStatus = onOrderDetailsEvent(
            ORDER_DETAILS_STATUS_CHANGED,
            ( changedOrderId, changedStatus ) => {
                if ( Number( changedOrderId ) !== orderId ) {
                    return;
                }

                setStatus( String( changedStatus ) );
            }
        );

        return () => {
            unsubscribeLoaded();
            unsubscribeStatus();
        };
    }, [ orderId ] );

    /**
     * Hand the list back the view it was on before the Vendor opened this order.
     */
    const goBackToList = () => {
        const from = ( location?.state ?? {} ) as {
            fromView?: unknown;
            fromFilters?: unknown;
        };

        navigate( '/orders', {
            state: {
                restoreView: from.fromView,
                restoreFilters: from.fromFilters,
            },
        } );
    };

    const title = order?.number
        ? sprintf(
              /* translators: %s: order number */
              __( 'Order #%s', 'dokan-lite' ),
              order.number
          )
        : __( 'Order Details', 'dokan-lite' );

    return (
        <div className="@container/header flex flex-col gap-4">
            <div className="@container/before-header grid grid-cols-4 gap-4">
                <Slot name="dokan-before-header" />
            </div>
            <div className="dokan-header-title-section @container/header-title-section flex gap-y-4 justify-between items-center flex-wrap">
                <div className="dokan-header-title w-full md:!w-1/2 flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-gray-800 md:text-4xl lg:text-3xl">
                        { title }
                    </h3>
                    { status && (
                        <DokanBadge
                            variant={ getStatusBadgeVariant( status ) }
                            label={ getStatusLabel( status ) }
                        />
                    ) }
                    <Slot
                        name="dokan-header-after-title"
                        fillProps={ { title, navigate, params, location } }
                    />
                </div>
                <div className="dokan-header-actions w-full md:!w-1/2 flex flex-wrap gap-2.5 md:!justify-end">
                    <DokanButton variant="secondary" onClick={ goBackToList }>
                        <ArrowLeft className="text-dokan-link" size={ 16 } />
                        { __( 'Back', 'dokan-lite' ) }
                    </DokanButton>
                    { canEditOrder && orderId > 0 && (
                        <DokanButton
                            variant="secondary"
                            onClick={ () =>
                                navigate( `/orders/edit/${ orderId }` )
                            }
                        >
                            <Pencil className="text-dokan-link" size={ 16 } />
                            { __( 'Edit Order', 'dokan-lite' ) }
                        </DokanButton>
                    ) }
                    <Slot
                        name="dokan-header-actions"
                        fillProps={ { navigate, params, location } }
                    />
                </div>
            </div>
            <div className="@container/after-header grid grid-cols-4 gap-4">
                <Slot
                    name="dokan-after-header"
                    fillProps={ { navigate, params, location } }
                />
            </div>
        </div>
    );
};

export default OrderDetailsHeader;
