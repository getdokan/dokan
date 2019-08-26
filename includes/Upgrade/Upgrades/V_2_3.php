<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WP_Query;
use WP_User_Query;
use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_3 extends DokanUpgrader {

    /**
     * Upgrade necessary meta for
     * new product design
     *
     * @since 2.3
     *
     * @return void
     */
    public static function upgrade_product_meta() {
        $args = [
            'post_type'      => 'product',
            'posts_per_page' => -1,
        ];

        $product_query = new WP_Query( $args );

        if ( $product_query->posts ) {
            foreach ($product_query->posts as $post ) {
                $product = wc_get_product( $post->ID  );

                if ( get_post_meta( $post->ID, '_product_attributes', true ) ) {
                    update_post_meta( $post->ID, '_has_attribute', 'yes' );
                }

                if ( $product->has_child() ) {
                    update_post_meta( $post->ID, '_create_variation', 'yes' );
                }
            }
        }
    }


    /**
     * Upgrade store meta for sellers
     * and replace old address meta with new address meta
     *
     * @since 2.3
     *
     * @return void
     */
    public static function upgrade_store_meta() {
        $query = new WP_User_Query( [
            'role'    => 'seller',
        ] );
        $sellers = $query->get_results();

        $default_settings = [
            'store_name'   => '',
            'location'     => '',
            'find_address' => '',
            'banner'       => '',
            'phone'        => '',
            'show_email'   => '',
            'gravatar'     => '',
            'payment'      => [],
            'social'       => []
        ];

        foreach ( $sellers as $seller ) {
            $current_settings = dokan_get_store_info( $seller->ID );
            $current_settings = wp_parse_args($current_settings, $default_settings);
            $old_address      = $current_settings['address'];

            $new_address =  [
                'street_1' => $old_address,
                'street_2' => '',
                'city'     => '',
                'zip'      => '',
                'country'  => '',
                'state'    => ''
            ];

            $current_settings['address'] = $new_address;
            update_user_meta( $seller->ID, 'dokan_profile_settings', $current_settings );
        }
    }
}
