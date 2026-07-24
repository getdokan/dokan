import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import SectionCard from '../SectionCard';
import { useOrderDetailsContext } from '../OrderDetailsContext';
import type { DetailsAddress } from '../types';

const formatAddress = ( address: DetailsAddress ): string[] => {
    const name = [ address.first_name, address.last_name ]
        .filter( Boolean )
        .join( ' ' );
    const cityLine = [ address.city, address.state, address.postcode ]
        .filter( Boolean )
        .join( ', ' );

    return [
        name,
        address.company,
        address.address_1,
        address.address_2,
        cityLine,
        address.country,
    ].filter( Boolean ) as string[];
};

const AddressBlock = ( {
    label,
    address,
}: {
    label: string;
    address: DetailsAddress;
} ) => {
    const lines = formatAddress( address );

    return (
        <div className="px-6 py-3 first:pt-0 last:pb-0 border-b border-gray-100 last:border-b-0">
            <p className="mb-1 text-xs font-medium text-gray-500">{ label }</p>
            <div className="text-sm text-gray-800">
                { lines.length
                    ? lines.map( ( line ) => (
                          <p key={ line }>{ decodeEntities( line ) }</p>
                      ) )
                    : __( 'None', 'dokan-lite' ) }
            </div>
        </div>
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
        <SectionCard
            title={ __( 'Address', 'dokan-lite' ) }
            contentClassName="px-0"
        >
            <AddressBlock
                label={ __( 'Shipping Address', 'dokan-lite' ) }
                address={ order.shipping }
            />
            <AddressBlock
                label={ __( 'Billing Address', 'dokan-lite' ) }
                address={ order.billing }
            />
        </SectionCard>
    );
};

export default AddressCard;
