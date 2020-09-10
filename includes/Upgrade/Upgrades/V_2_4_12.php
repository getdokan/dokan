<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WP_User_Query;
use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_4_12 extends DokanUpgrader {

    /**
     * Upgrade meta for sellers
     *
     * @since 2.4.12
     *
     * @return void
     */
    public static function upgrade_seller_meta() {
        $query = new WP_User_Query(
            [
				'role'    => 'seller',
			]
        );

        $sellers = $query->get_results();

        foreach ( $sellers as $seller ) {
            $store_info = dokan_get_store_info( $seller->ID );
            update_user_meta( $seller->ID, 'dokan_store_name', esc_html( $store_info['store_name'] ) );
        }
    }
}
