<?php

namespace WeDevs\Dokan\Order\Admin;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handle Admin Order Permission Related Hooks
 *
 * @since DOKAN_SINCE
 */
class Permissions {
    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_filter( 'map_meta_cap', [ $this, 'map_meta_caps' ], 12, 4 );
    }

    /**
     * Dokan map meta cpas for vendors
     *
     * @since DOKAN_SINCE moved this method from includes/functions.php file
     * @since DOKAN_SINCE Added HPOS support
     *
     * @param array  $caps
     * @param string $cap
     * @param int    $user_id
     * @param array  $args
     *
     * @return array
     */
    public function map_meta_caps( $caps, $cap, $user_id, $args ) {
        global $post;

        if ( ! is_admin() ) {
            return $caps;
        }

        if ( $cap === 'edit_post' || $cap === 'edit_others_shop_orders' ) {
            $post_id = ! empty( $args[0] ) ? $args[0] : ( is_object( $post ) ? $post->ID : 0 );
            if ( empty( $post_id ) ) {
                return $caps;
            }

            $order = wc_get_order( $post_id );
            if ( ! $order ) {
                return $caps;
            }

            $vendor_id = $order->get_meta( '_dokan_vendor_id', true );
            if ( (int) $vendor_id === (int) get_current_user_id() ) {
                return [ 'edit_shop_orders' ];
            }
        }

        return $caps;
    }
}
