import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import { DokanTooltip } from '@dokan/components';
import { SidebarBlock, SidebarCard } from './SidebarCard';
import { useOrderDetailsContext } from '../OrderDetailsContext';
import { ORDER_DETAILS_ADDRESS_PARTS_FILTER } from '../slots';
import type { DetailsAddress } from '../types';

/**
 * The mockup prints the address as one flowing sentence rather than a stack of
 * one-field lines, so it fills the sidebar's width before it wraps.
 * @param address
 * @param type
 */
const formatAddress = ( address: DetailsAddress, type: string ): string => {
    /**
     * Filters the parts an address is composed of, in order.
     *
     * Locales that order an address differently — or stores that want the
     * company left out — change the list here.
     *
     * @param {Array}  parts   Address parts, joined with ", ".
     * @param {Object} address The raw address object.
     * @param {string} type    "shipping" or "billing".
     */
    const parts = applyFilters(
        ORDER_DETAILS_ADDRESS_PARTS_FILTER,
        [
            [ address.first_name, address.last_name ]
                .filter( Boolean )
                .join( ' ' ),
            address.company,
            address.address_1,
            address.address_2,
            address.city,
            address.state,
            address.postcode,
            address.country,
        ],
        address,
        type
    ) as Array< string | undefined >;

    return parts
        .map( ( part ) => decodeEntities( String( part ?? '' ) ).trim() )
        .filter( Boolean )
        .join( ', ' );
};

const AddressBlock = ( {
    label,
    address,
    type,
}: {
    label: string;
    address: DetailsAddress;
    type: string;
} ) => {
    const text = formatAddress( address, type );
    const containerRef = useRef< HTMLDivElement >( null );
    const textRef = useRef< HTMLParagraphElement >( null );
    const [ isTruncated, setIsTruncated ] = useState( false );

    // Long addresses clamp at three lines; the full text stays reachable on
    // hover, so nothing is lost to the ellipsis. Measured through a
    // ResizeObserver because the first paint lies: web fonts swap in after it,
    // and a wider glyph set is exactly what pushes an address past three lines.
    useEffect( () => {
        // Read the paragraph through the ref, and watch the block around it:
        // adding the tooltip re-creates the paragraph, and a stale node
        // measures zero — which would unwrap it again, forever.
        const measure = () => {
            const element = textRef.current;

            if ( ! element?.isConnected ) {
                return;
            }

            setIsTruncated( element.scrollHeight > element.clientHeight + 1 );
        };

        measure();

        const observer =
            'undefined' !== typeof ResizeObserver
                ? new ResizeObserver( measure )
                : null;

        if ( containerRef.current ) {
            observer?.observe( containerRef.current );
        }

        document.fonts?.ready?.then( measure ).catch( () => {} );
        window.addEventListener( 'resize', measure );

        return () => {
            observer?.disconnect();
            window.removeEventListener( 'resize', measure );
        };
    }, [ text ] );

    const body = (
        <p ref={ textRef } className="line-clamp-3 w-full break-words">
            { text || __( 'None', 'dokan-lite' ) }
        </p>
    );

    return (
        <SidebarBlock label={ label }>
            <div ref={ containerRef }>
                { isTruncated ? (
                    <DokanTooltip content={ text }>
                        <span className="block w-full">{ body }</span>
                    </DokanTooltip>
                ) : (
                    body
                ) }
            </div>
        </SidebarBlock>
    );
};

/**
 * Shipping + billing address sidebar card with "None" empty states per the mockup.
 */
const AddressCard = () => {
    const { order } = useOrderDetailsContext();

    if ( ! order ) {
        return null;
    }

    return (
        <SidebarCard title={ __( 'Address', 'dokan-lite' ) }>
            <AddressBlock
                label={ __( 'Shipping Address', 'dokan-lite' ) }
                address={ order.shipping }
                type="shipping"
            />
            <AddressBlock
                label={ __( 'Billing Address', 'dokan-lite' ) }
                address={ order.billing }
                type="billing"
            />
        </SidebarCard>
    );
};

export default AddressCard;
