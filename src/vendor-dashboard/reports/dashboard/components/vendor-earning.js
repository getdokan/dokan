import { __ } from '@wordpress/i18n';
import { Fill } from '@wordpress/components';
import { getAdminSetting } from '../../utils/admin-settings';

const VendorEarning = ({ isEmbedded, query }) => {
    const vendorBalance = getAdminSetting( 'vendorBalance', 0.00 );

    return (
        <Fill name='woocommerce_header_item'>
            <div className='dokan-analytics-vendor-earning-section'>
                <h4 className='vendor-earning-title'>
                    {__('Balance: ', 'dokan-lite')}
                    <span className='vendor-earning' dangerouslySetInnerHTML={{__html: vendorBalance}}/>
                </h4>
            </div>
        </Fill>
    );
};

export default VendorEarning;
