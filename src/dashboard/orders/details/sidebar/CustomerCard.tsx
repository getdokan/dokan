import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { ExternalLink } from 'lucide-react';
import SectionCard from '../SectionCard';
import { useOrderDetailsContext } from '../OrderDetailsContext';

const Block = ( {
    label,
    upper = false,
    children,
}: {
    label: string;
    upper?: boolean;
    children: React.ReactNode;
} ) => (
    <div className="border-t border-[#E9E9E9] px-6 py-3 last:pb-0">
        <p
            className={ `mb-1 font-medium text-[#828282] ${
                upper ? 'text-[11px] uppercase tracking-wider' : 'text-xs'
            }` }
        >
            { label }
        </p>
        <div className="break-words text-sm text-[#575757]">{ children }</div>
    </div>
);

/**
 * Customer Details sidebar card, per the mockup: the customer name sits right
 * under the card title, and the section dividers run edge to edge.
 */
const CustomerCard = () => {
    const { order } = useOrderDetailsContext();

    if ( ! order ) {
        return null;
    }

    const isGuest = ! order.customer_id;
    const fullName = [ order.billing.first_name, order.billing.last_name ]
        .filter( Boolean )
        .join( ' ' );

    const contactLines = [ order.billing.email, order.billing.phone ].filter(
        Boolean
    );

    return (
        <SectionCard
            title={ __( 'Customer Details', 'dokan-lite' ) }
            contentClassName="px-0"
        >
            <p className="px-6 pb-3 text-sm text-gray-600">
                { isGuest && ! fullName
                    ? __( 'Guest Customer', 'dokan-lite' )
                    : decodeEntities( fullName ) ||
                      __( 'Guest Customer', 'dokan-lite' ) }
            </p>
            <Block label={ __( 'Contact', 'dokan-lite' ) }>
                { contactLines.length
                    ? contactLines.map( ( line ) => (
                          <p key={ line }>{ line }</p>
                      ) )
                    : __( 'None', 'dokan-lite' ) }
            </Block>
            <Block label={ __( 'Customer IP', 'dokan-lite' ) } upper>
                { order.customer_ip_address ? (
                    // Same geo-lookup link the legacy details page uses.
                    <a
                        href={ `https://tools.keycdn.com/geo?host=${ order.customer_ip_address }` }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-dokan-link"
                    >
                        <ExternalLink size={ 12 } />
                        { order.customer_ip_address }
                    </a>
                ) : (
                    __( 'None', 'dokan-lite' )
                ) }
            </Block>
            <Block label={ __( 'Customer Note', 'dokan-lite' ) }>
                { order.customer_note
                    ? decodeEntities( order.customer_note )
                    : __( 'None', 'dokan-lite' ) }
            </Block>
        </SectionCard>
    );
};

export default CustomerCard;
