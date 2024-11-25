<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Upugrader\Update_Category_Commission;
use WeDevs\Dokan\Commission\Upugrader\Update_Product_Commission;
use WeDevs\Dokan\Commission\Upugrader\Update_Vendor_Commission;

class V_3_14_0 extends DokanUpgrader {

    /**
     * Update global commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_global_commission_type() {
        $options = get_option( 'dokan_selling', [] );

        $commission_type  = isset( $options['commission_type'] ) ? $options['commission_type'] : Fixed::SOURCE;
        $admin_percentage = isset( $options['admin_percentage'] ) ? $options['admin_percentage'] : 0;

        if ( in_array( $commission_type, array_keys( dokan()->commission->get_legacy_commission_types() ), true ) ) {
            $options['commission_type'] = Fixed::SOURCE;

            if ( Flat::SOURCE === $commission_type ) {
                $options['admin_percentage'] = 0;
                $options['additional_fee'] = $admin_percentage;
            } elseif ( Percentage::SOURCE === $commission_type ) {
                $options['admin_percentage'] = $admin_percentage;
                $options['additional_fee'] = 0;
            }
            update_option( 'dokan_selling', $options );
        }
    }

    /**
     * Update vendor and product comission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_commission() {
        $product_scheduler = new Update_Product_Commission();
        if ( ! $product_scheduler->is_processing() ) {
            $product_scheduler->start_processing();
        }

        $vendor_scheduler = new Update_Vendor_Commission();
        if ( ! $vendor_scheduler->is_processing() ) {
            $vendor_scheduler->start_processing();
        }

        $category_scheduler = new Update_Category_Commission();
        if ( ! $category_scheduler->is_processing() ) {
            $category_scheduler->start_processing();
        }
    }
}
