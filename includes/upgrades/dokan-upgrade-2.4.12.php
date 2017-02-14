<?php
/**
 * Upgrade meta for sellers
 *
 * @since 2.4.12
 *
 * @return void
 */
function upgrade_sseller_meta_2412() {

    $query = new WP_User_Query( array(
        'role'    => 'seller',
    ) );
    $sellers = $query->get_results();

    foreach ( $sellers as $seller ) {

        $store_info    = dokan_get_store_info( $seller->ID );
        update_user_meta( $seller->ID, 'dokan_store_name', esc_html( $store_info['store_name'] ) );
    }
}

upgrade_sseller_meta_2412();