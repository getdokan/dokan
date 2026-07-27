import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { SidebarBlock, SidebarCard } from './SidebarCard';
import { useOrderDetailsContext } from '../OrderDetailsContext';

/**
 * Contact line: a 16px glyph and the value, on the mockup's 9px gap.
 * @param root0
 * @param root0.icon
 * @param root0.children
 */
const ContactLine = ( {
    icon: Icon,
    children,
}: {
    icon: typeof Mail;
    children: React.ReactNode;
} ) => (
    <p className="flex items-center gap-[9px]">
        <Icon className="shrink-0 text-[#575757]" size={ 16 } />
        <span className="min-w-0 break-words">{ children }</span>
    </p>
);

/**
 * Customer Details sidebar card, per the mockup: the customer name belongs to
 * the title block (no rule between the two), then contact, IP and note blocks
 * separated by edge-to-edge dividers.
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
    const displayName =
        isGuest && ! fullName
            ? __( 'Guest Customer', 'dokan-lite' )
            : decodeEntities( fullName ) ||
              __( 'Guest Customer', 'dokan-lite' );

    const hasContact = Boolean( order.billing.email || order.billing.phone );

    return (
        <SidebarCard
            title={ __( 'Customer Details', 'dokan-lite' ) }
            subtitle={ displayName }
        >
            <SidebarBlock label={ __( 'Contact', 'dokan-lite' ) }>
                { hasContact ? (
                    // Tight enough that the email and phone read as one
                    // contact block rather than two separate facts.
                    <div className="flex flex-col gap-2">
                        { order.billing.email && (
                            <ContactLine icon={ Mail }>
                                { order.billing.email }
                            </ContactLine>
                        ) }
                        { order.billing.phone && (
                            <ContactLine icon={ Phone }>
                                { order.billing.phone }
                            </ContactLine>
                        ) }
                    </div>
                ) : (
                    __( 'None', 'dokan-lite' )
                ) }
            </SidebarBlock>

            <SidebarBlock label={ __( 'Customer IP', 'dokan-lite' ) }>
                { order.customer_ip_address ? (
                    // Same geo-lookup link the legacy details page uses.
                    <a
                        href={ `https://tools.keycdn.com/geo?host=${ order.customer_ip_address }` }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-[9px] text-dokan-link"
                    >
                        <ExternalLink className="shrink-0" size={ 16 } />
                        <span className="min-w-0 break-words">
                            { order.customer_ip_address }
                        </span>
                    </a>
                ) : (
                    __( 'None', 'dokan-lite' )
                ) }
            </SidebarBlock>

            <SidebarBlock label={ __( 'Customer Note', 'dokan-lite' ) }>
                <p className="whitespace-pre-wrap break-words">
                    { order.customer_note
                        ? decodeEntities( order.customer_note )
                        : __( 'None', 'dokan-lite' ) }
                </p>
            </SidebarBlock>
        </SidebarCard>
    );
};

export default CustomerCard;
