<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Gateways;

use WeDevs\Dokan\Vendor\SettingsApi\Abstracts\Gateways;

defined( 'ABSPATH' ) || exit;

/**
 * Payment processor PayPal.
 *
 * @since DOKAN_SINCE
 */
class PayPal extends Gateways {

    /**
     * Render the settings for PayPal.
     *
     * @since DOKAN_SINCE
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
            'icon'      => '<i class="fa fa-paypal"></i>',
            'type'      => 'card',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
        ];
        $settings[] = [
            'id'        => 'paypal',
            'title'     => __( 'PayPal', 'dokan-lite' ),
            'desc'      => __( 'Paypal settings', 'dokan-lite' ),
            'icon'      => '<i class="fa fa-paypal"></i>',
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
                    'icon'      => '<i class="fa fa-email"></i>',
                    'type'      => 'email',
                    'parent_id' => 'paypal',
                ],
            ],
        ];

        return $settings;
    }
}
