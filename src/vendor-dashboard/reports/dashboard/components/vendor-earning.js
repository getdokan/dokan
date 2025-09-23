import { __ } from '@wordpress/i18n';
import { Fill } from '@wordpress/components';
import { getAdminSetting } from '../../utils/admin-settings';

const VendorEarning = ( { isEmbedded, query } ) => {
    const vendorBalance = getAdminSetting( 'vendorBalance', 0.0 );

    return (
        <Fill name="woocommerce_header_item">
            <div className="dokan-analytics-vendor-earning-section">
                <h4 className="vendor-earning-title dokan-layout">
                    { __( 'Balance:', 'dokan-lite' ) }
                    <span
                        className="text-dokan-primary vendor-earning"
                        dangerouslySetInnerHTML={ { __html: vendorBalance } }
                    />
                </h4>
            </div>
        </Fill>
    );
};

export default VendorEarning;
