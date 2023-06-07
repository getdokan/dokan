<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_6_4 extends DokanUpgrader {

    /**
     * Remove unfiltered_html capabilities from vendor roles
     *
     * @since 3.6.4
     *
     * @return void
     */
    public static function remove_unfiltered_html_capabilities_from_vendor() {
        $role = get_role( 'seller' );
        if ( $role ) {
            $role->remove_cap( 'unfiltered_html' );
        }
    }
}
