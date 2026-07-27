import { __, sprintf } from '@wordpress/i18n';
import { PriceHtml } from '@dokan/components';
import { useOrderDetailsContext } from './OrderDetailsContext';

const Row = ( {
    label,
    children,
    negative = false,
    bold = false,
}: {
    label: React.ReactNode;
    children: React.ReactNode;
    negative?: boolean;
    bold?: boolean;
} ) => (
    <div
        className={ `flex items-center justify-between gap-3 px-6 ${
            bold
                ? 'border-t border-[#E9E9E9] py-4 font-semibold text-[#25252D]'
                : 'py-2.5 text-[#575757]'
        }` }
    >
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            { label }
        </span>
        <span
            className={ `shrink-0 whitespace-nowrap text-sm [&_div]:inline [&_span]:inline ${
                negative ? 'text-red-500' : ''
            } ${ bold ? 'font-semibold text-[#25252D]' : '' }` }
        >
            { children }
        </span>
    </div>
);

const sum = ( values: Array< string | number | undefined > ): number =>
    values.reduce< number >(
        ( carry, value ) => carry + ( parseFloat( String( value ?? 0 ) ) || 0 ),
        0
    );

/**
 * Order totals per the mockup: items subtotal, shipping, fees, taxes, refund
 * rows in red, coupon chips, and the grand total row — taller, bold, with the
 * original struck through once refunds exist.
 */
const TotalsRows = () => {
    const { order } = useOrderDetailsContext();

    if ( ! order ) {
        return null;
    }

    const itemsSubtotal = sum(
        order.line_items.map( ( item ) => item.subtotal )
    );
    const feesTotal = sum( order.fee_lines.map( ( fee ) => fee.total ) );
    const refundedTotal = sum(
        order.refunds.map( ( refund ) =>
            Math.abs( parseFloat( refund.total ) )
        )
    );
    const orderTotal = parseFloat( order.total || '0' );
    const netTotal = orderTotal - refundedTotal;
    const hasRefunds = order.refunds.length > 0;

    // The plain rows get equal 12px padding above the first and below the
    // last, so the gap before Items Subtotal matches the gap after the final
    // row (e.g. Coupons) — and the Total row centers between its divider and
    // the card edge.
    return (
        <div>
            <div className="py-3">
                <Row label={ __( 'Items Subtotal', 'dokan-lite' ) }>
                    <PriceHtml price={ itemsSubtotal } />
                </Row>
                <Row label={ __( 'Shipping', 'dokan-lite' ) }>
                    <PriceHtml price={ order.shipping_total } />
                </Row>
                { feesTotal > 0 && (
                    <Row label={ __( 'Fees', 'dokan-lite' ) }>
                        <PriceHtml price={ feesTotal } />
                    </Row>
                ) }
                <Row label={ __( 'Taxes', 'dokan-lite' ) }>
                    <PriceHtml price={ order.total_tax } />
                </Row>
                { order.refunds.map( ( refund ) => (
                    <Row
                        key={ refund.id }
                        negative
                        label={
                            <>
                                { sprintf(
                                    /* translators: %d: refund id */
                                    __( 'Refund #%d', 'dokan-lite' ),
                                    refund.id
                                ) }
                                { refund.refund && (
                                    <span className="text-xs text-[#828282]">
                                        { ' – ' + refund.refund }
                                    </span>
                                ) }
                            </>
                        }
                    >
                        { '- ' }
                        <PriceHtml
                            price={ Math.abs( parseFloat( refund.total ) ) }
                        />
                    </Row>
                ) ) }
                { order.coupon_lines.length > 0 && (
                    <Row
                        negative
                        label={
                            <span className="inline-flex flex-wrap items-center gap-1.5">
                                <span>{ __( 'Coupons', 'dokan-lite' ) }</span>
                                { order.coupon_lines.map( ( coupon ) => (
                                    <span
                                        key={ coupon.id }
                                        className="inline-flex items-center whitespace-nowrap rounded border border-[#E9E9E9] bg-[#F9FAFB] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#575757]"
                                    >
                                        { coupon.code }
                                    </span>
                                ) ) }
                            </span>
                        }
                    >
                        { '- ' }
                        <PriceHtml
                            price={ sum(
                                order.coupon_lines.map(
                                    ( coupon ) => coupon.discount
                                )
                            ) }
                        />
                    </Row>
                ) }
            </div>
            <Row bold label={ __( 'Total', 'dokan-lite' ) }>
                { hasRefunds && (
                    <span className="mr-2 font-normal text-gray-400 line-through">
                        <PriceHtml price={ orderTotal } />
                    </span>
                ) }
                <PriceHtml price={ hasRefunds ? netTotal : orderTotal } />
            </Row>
        </div>
    );
};

export default TotalsRows;
