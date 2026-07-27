import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { DokanAlert } from '@dokan/components';
import useOrderDetails from './useOrderDetails';
import { OrderDetailsProvider } from './OrderDetailsContext';
import { getOrderDetailsMarker, isOrderDetailsSectionEnabled } from './marker';
import SummaryStrip from './SummaryStrip';
import ItemsCard from './ItemsCard';
import DownloadsCard from './DownloadsCard';
import CustomerCard from './sidebar/CustomerCard';
import AddressCard from './sidebar/AddressCard';
import NotesCard from './sidebar/NotesCard';
import { SectionSlot, SectionWithSlots } from './SectionSlot';
import {
    ORDER_DETAILS_SIDEBAR_AFTER_SLOT,
    ORDER_DETAILS_SIDEBAR_BEFORE_SLOT,
    ORDER_DETAILS_SIDEBAR_MIDDLE_SLOT,
} from './slots';

/**
 * Hide everything but the details view while printing, without touching the
 * panel layout: the classic visibility flip needs no knowledge of the chrome
 * around it.
 */
const PRINT_STYLES = `
/* The product editor's canvas treatment: gray page, white cards. */
.dokan-dashboard-content:has(.dokan-order-details-react-view) {
    background-color: #f0f0f1;
}
@media print {
    body * { visibility: hidden; }
    .dokan-order-details-react-view,
    .dokan-order-details-react-view * { visibility: visible; }
    .dokan-order-details-react-view { position: absolute; left: 0; top: 0; width: 100%; }
}
`;

const LoadingSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
            <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="h-52 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        </div>
    </div>
);

/**
 * The first-party React order details view (mockup 1): summary strip, items and
 * totals, downloads, and the customer/address/notes sidebar — with named slots
 * where Pro's shipments, refund and delivery sections plug in.
 * @param root0
 * @param root0.params
 * @param root0.params.orderId
 */
const OrderDetailsView = ( { params }: { params?: { orderId?: string } } ) => {
    const orderId = Number( params?.orderId ?? 0 );
    const navigate = useNavigate();
    const { order, isLoading, error, refetch } = useOrderDetails( orderId );
    const marker = getOrderDetailsMarker();

    const context = useMemo(
        () => ( {
            order,
            orderId,
            sections: marker.sections ?? {},
            isLoading,
            refetch,
            // In the context (not just slot fillProps) so every section —
            // including fills that only receive the context object — can route.
            navigate,
        } ),
        [ order, orderId, isLoading, refetch, navigate ] // eslint-disable-line react-hooks/exhaustive-deps
    );

    if ( error ) {
        return (
            <DokanAlert
                variant="danger"
                label={ __( 'Order details unavailable', 'dokan-lite' ) }
            >
                { error ||
                    sprintf(
                        /* translators: %d: order id */
                        __( 'Order #%d could not be loaded.', 'dokan-lite' ),
                        orderId
                    ) }
            </DokanAlert>
        );
    }

    if ( isLoading || ! order ) {
        return <LoadingSkeleton />;
    }

    return (
        <OrderDetailsProvider value={ context }>
            <style>{ PRINT_STYLES }</style>
            { /* mt-2 tops the layout's 16px up to the 24px header→card gap. */ }
            <div className="dokan-order-details-react-view mt-2 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <SectionWithSlots section="summary">
                        <SummaryStrip />
                    </SectionWithSlots>
                    <SectionWithSlots section="items">
                        <ItemsCard />
                    </SectionWithSlots>
                    { isOrderDetailsSectionEnabled( 'downloads' ) && (
                        <SectionWithSlots section="downloads">
                            <DownloadsCard />
                        </SectionWithSlots>
                    ) }
                </div>
                { /* The sidebar prints too — legacy printing covers the whole
                     details page, customer info included. */ }
                <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                    <SectionSlot name={ ORDER_DETAILS_SIDEBAR_BEFORE_SLOT } />
                    <SectionWithSlots section="customer">
                        <CustomerCard />
                    </SectionWithSlots>
                    <SectionWithSlots section="address">
                        <AddressCard />
                    </SectionWithSlots>
                    { /* Pro's Delivery Time card fills here, keeping the
                         sidebar order: Customer, Address, Delivery, Notes. */ }
                    <SectionSlot name={ ORDER_DETAILS_SIDEBAR_MIDDLE_SLOT } />
                    { isOrderDetailsSectionEnabled( 'notes' ) && (
                        <SectionWithSlots section="notes">
                            <NotesCard />
                        </SectionWithSlots>
                    ) }
                    <SectionSlot name={ ORDER_DETAILS_SIDEBAR_AFTER_SLOT } />
                </aside>
            </div>
        </OrderDetailsProvider>
    );
};

export default OrderDetailsView;
