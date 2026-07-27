import { __ } from '@wordpress/i18n';
import { Slot } from '@wordpress/components';
import SectionCard from './SectionCard';
import ItemRow from './ItemRow';
import TotalsRows from './TotalsRows';
import { ORDER_DETAILS_ITEMS_ACTIONS_SLOT } from './slots';
import { useOrderDetailsContext } from './OrderDetailsContext';

/**
 * The order items table with totals, per the mockup. The actions row under the
 * items is a slot — Pro's "Refund Request" link renders there, so Lite ships no
 * dead link.
 */
const ItemsCard = () => {
    const context = useOrderDetailsContext();
    const { order } = context;

    if ( ! order ) {
        return null;
    }

    return (
        <SectionCard className="overflow-hidden py-0" contentClassName="px-0">
            <div className="grid grid-cols-[44fr_22fr_22fr_22fr] items-center gap-3 bg-[#FDFDFD] px-6 py-5 border-b border-[#E9E9E9] text-[11px] font-medium uppercase tracking-wider text-[#828282]">
                <span>{ __( 'Items', 'dokan-lite' ) }</span>
                <span>{ __( 'Price', 'dokan-lite' ) }</span>
                <span>{ __( 'Qty', 'dokan-lite' ) }</span>
                <span className="text-right">
                    { __( 'Total', 'dokan-lite' ) }
                </span>
            </div>
            { order.line_items.map( ( item ) => (
                <ItemRow key={ item.id } item={ item } />
            ) ) }
            <div className="empty:hidden px-6 py-3.5 border-b border-[#E9E9E9]">
                <Slot
                    name={ ORDER_DETAILS_ITEMS_ACTIONS_SLOT }
                    fillProps={ context }
                />
            </div>
            <TotalsRows />
        </SectionCard>
    );
};

export default ItemsCard;
