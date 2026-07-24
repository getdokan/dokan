import { __ } from '@wordpress/i18n';
import { PriceHtml } from '@dokan/components';
import SectionCard from './SectionCard';
import { formatSiteDateTime } from './dateTime';
import { useOrderDetailsContext } from './OrderDetailsContext';

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

    return (
        <SectionCard contentClassName="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#E9E9E9]">
            <Cell label={ __( 'Created', 'dokan-lite' ) }>
                { order.date_created
                    ? formatSiteDateTime( order.date_created )
                    : '—' }
            </Cell>
            <Cell label={ __( 'Earning', 'dokan-lite' ) }>
                { null === order.earning ? (
                    '—'
                ) : (
                    <PriceHtml price={ order.earning } />
                ) }
            </Cell>
            <Cell label={ __( 'Payment method', 'dokan-lite' ) }>
                { order.payment_method_title || __( 'None', 'dokan-lite' ) }
            </Cell>
        </SectionCard>
    );
};

export default SummaryStrip;
