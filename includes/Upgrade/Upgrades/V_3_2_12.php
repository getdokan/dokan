<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_2_12 extends DokanUpgrader {

    /**
     * Give default dokan_export_product capability
     * to vendor_staff to export the order list
     *
     * @since 3.2.12
     *
     * @return void
     */
    public static function add_dokan_export_product_capability_to_staff() {
        // get all staffs
        $staffs = get_users(
            [
                'role__in'   => [ 'vendor_staff' ],
            ]
        );

        // adding capability to each staff
        foreach ( $staffs as $staff ) {
            $staff->add_cap( 'dokan_export_order' );
        }
    }
}
