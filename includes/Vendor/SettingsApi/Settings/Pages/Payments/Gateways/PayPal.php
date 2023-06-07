<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Gateways;

use WeDevs\Dokan\Vendor\SettingsApi\Abstracts\Gateways;

defined( 'ABSPATH' ) || exit;

/**
 * Payment processor PayPal.
 *
 * @since 3.7.10
 */
class PayPal extends Gateways {

    /**
     * Render the settings for PayPal.
     *
     * @since 3.7.10
     *
     * @param array $settings Settings to render.
     *
     * @return array
     */
    public function render_settings( array $settings ): array {
        $settings[] = [
            'id'        => 'paypal_card',
            'title'     => __( 'Paypal', 'dokan-lite' ),
            'desc'      => __( 'Paypal settings.', 'dokan-lite' ),
            'info'      => [],
            'icon'      => '',
            'type'      => 'card',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
        ];
        $settings[] = [
            'id'        => 'paypal',
            'title'     => __( 'PayPal', 'dokan-lite' ),
            'desc'      => __( 'Paypal settings', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'section',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
            'card'      => 'paypal_card',
            'fields'    => [
                [
                    'id'        => 'email',
                    'title'     => __( 'Email', 'dokan-lite' ),
                    'desc'      => __( 'Enter your paypal email address', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'email',
                    'parent_id' => 'paypal',
                ],
            ],
        ];

        return $settings;
    }
}
