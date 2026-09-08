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

    /**
     * Order statuses that can release a withdraw request.
     *
     * Single source of truth for the `dokan_settings_withdraw_order_status_options`
     * filter — consumed by the legacy admin settings registration
     * ({@see \WeDevs\Dokan\Admin\Settings}) and by the new flat schema
     * ({@see \WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema}) so additions
     * made by Pro / extensions show up on both UIs and in the bridge mapping
     * with one declaration.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string,string> Map of `wc-<status>` slug => translated label.
     */
    public static function withdraw_order_status_options(): array {
        return apply_filters(
            'dokan_settings_withdraw_order_status_options',
            [
                'wc-completed'  => __( 'Completed', 'dokan-lite' ),
                'wc-processing' => __( 'Processing', 'dokan-lite' ),
                'wc-on-hold'    => __( 'On-hold', 'dokan-lite' ),
            ]
        );
    }
}
