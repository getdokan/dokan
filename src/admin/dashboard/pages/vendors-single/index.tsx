import { RouterProps } from '@dokan/definitions/RouterProps';
import HeaderNavigation from './HeaderNavigation';
import HeaderCard from './HeaderCard';
import { useSelect } from '@wordpress/data';
import vendorsStore from '@dokan/stores/vendors';
import SkelitonLoader from './Skeletons/SkelitonLoader';
import InfoSection from './InfoSection';

const VendorsSingle = ( { params }: RouterProps ) => {
    const { id: vendorId } = params;

    const isLoading = useSelect(
        ( select ) => select( vendorsStore ).isLoading(),
        []
    );
    const vendor = useSelect(
        ( select ) => {
            if ( ! vendorId ) {
                return;
            }
            return select( vendorsStore ).getVendor( parseInt( vendorId ) );
        },
        [ vendorId ]
    );

    if ( ! vendor || isLoading ) {
        return <SkelitonLoader />;
    }

    return (
        <div className="flex flex-col gap-6">
            <HeaderNavigation vendor={ vendor } />
            <HeaderCard vendor={ vendor } />
            <InfoSection vendor={ vendor } />
        </div>
    );
};

export default VendorsSingle;
