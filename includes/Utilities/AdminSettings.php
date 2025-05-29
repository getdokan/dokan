<?php

namespace WeDevs\Dokan\Utilities;

class AdminSettings {

    /**
     * Get new seller selling status setting.
     * We are placing this function here because this function may access from admin and front-end both.
     *
     * @since 4.0.2
     *
     * @param string $status
     *
     * @return string
     */
    public function get_new_seller_enable_selling_status( $status = '' ) {
        // Before this feature the default was 'on'
        if ( empty( $status ) ) {
            $status = dokan_get_option( 'new_seller_enable_selling', 'dokan_selling', 'on' );
        }

        if ( $status === 'on' ) {
            $status = 'automatically';
        } elseif ( $status === 'off' ) {
            $status = 'manually';
        }

        return apply_filters( 'dokan_new_seller_enable_selling_status', $status );
    }

    /**
     * Dokan new seller enable selling statuses.
     *
     * @since 4.0.2
     *
     * @return array
     */
    public function new_seller_enable_selling_statuses() {
        return apply_filters(
            'dokan_new_seller_enable_selling_statuses', [
                'automatically' => __( 'Automatically', 'dokan-lite' ),
                'manually'      => __( 'Manually', 'dokan-lite' ),
            ]
        );
    }
}
