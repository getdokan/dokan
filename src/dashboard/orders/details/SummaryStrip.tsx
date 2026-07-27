import type { ReactNode } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { PriceHtml } from '@dokan/components';
import SectionCard from './SectionCard';
import { formatSiteDateTime } from './dateTime';
import { useOrderDetailsContext } from './OrderDetailsContext';
import { ORDER_DETAILS_SUMMARY_ITEMS_FILTER } from './slots';
import type { DetailsOrder } from './types';

interface SummaryItem {
    id: string;
    label: string;
    value: ReactNode;
}

const COLUMN_CLASSES: Record< number, string > = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
};

const Cell = ( {
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
} ) => (
    <div className="flex min-w-0 flex-col gap-1.5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#828282]">
            { label }
        </span>
        <span className="text-sm text-[#25252D]">{ children }</span>
    </div>
);

/**
 * Created / Earning / Payment method strip under the header — three cells
 * separated by hairline dividers, per the mockup.
 */
const SummaryStrip = () => {
    const { order } = useOrderDetailsContext();

    if ( ! order ) {
        return null;
    }

    /**
     * Filters the summary cells.
     *
     * Extensions add, drop or reorder cells here; the strip lays out whatever
     * it is handed.
     *
     * @param {Array}  items The summary cells.
     * @param {Object} order The order being displayed.
     */
    const items = applyFilters(
        ORDER_DETAILS_SUMMARY_ITEMS_FILTER,
        [
            {
                id: 'created',
                label: __( 'Created', 'dokan-lite' ),
                value: order.date_created
                    ? formatSiteDateTime( order.date_created )
                    : '—',
            },
            {
                id: 'earning',
                label: __( 'Earning', 'dokan-lite' ),
                value:
                    null === order.earning ? (
                        '—'
                    ) : (
                        <PriceHtml price={ order.earning } />
                    ),
            },
            {
                id: 'payment_method',
                label: __( 'Payment method', 'dokan-lite' ),
                value: order.payment_method_title || __( 'None', 'dokan-lite' ),
            },
        ] as SummaryItem[],
        order as DetailsOrder
    ) as SummaryItem[];

    // Literal class names: Tailwind only ships utilities it can see in source.
    const columnClass = COLUMN_CLASSES[ items.length ] ?? 'sm:grid-cols-3';

    return (
        <SectionCard
            contentClassName={ `grid grid-cols-1 gap-4 ${ columnClass } sm:gap-0 sm:divide-x sm:divide-[#E9E9E9]` }
        >
            { items.map( ( item ) => (
                <Cell key={ item.id } label={ item.label }>
                    { item.value }
                </Cell>
            ) ) }
        </SectionCard>
    );
};

export default SummaryStrip;
