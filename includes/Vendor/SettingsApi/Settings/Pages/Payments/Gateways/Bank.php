<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\Settings\Pages\Payments\Gateways;


use WeDevs\Dokan\Vendor\SettingsApi\Abstracts\Gateways;

defined( 'ABSPATH' ) || exit;

/**
 * Payment processor Bank.
 *
 * @since 3.7.10
 */
class Bank extends Gateways {

    /**
     * Render the settings page for bank.
     *
     * @since 3.7.10
     *
     * @param array $settings Settings to render.
     *
     * @return array
     */
    public function render_settings( array $settings ): array {
        $settings[] = [
            'id'        => 'bank_card',
            'title'     => __( 'Bank', 'dokan-lite' ),
            'desc'      => __( 'Bank settings.', 'dokan-lite' ),
            'info'      => [],
            'icon'      => '',
            'type'      => 'card',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
        ];
        $settings[] = [
            'id'        => 'bank',
            'title'     => __( 'Bank', 'dokan-lite' ),
            'desc'      => __( 'Bank settings', 'dokan-lite' ),
            'icon'      => '',
            'type'      => 'section',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
            'card'      => 'bank_card',
            'fields'    => [
                [
                    'id'        => 'ac_name',
                    'title'     => __( 'Account Name', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank account name.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'ac_number',
                    'title'     => __( 'Account Number', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank account number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'bank_name',
                    'title'     => __( 'Bank Name', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank name.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'bank_addr',
                    'title'     => __( 'Bank Address', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank address.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'textarea',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'routing_number',
                    'title'     => __( 'Routing Number', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank routing number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'iban',
                    'title'     => __( 'IBAN', 'dokan-lite' ),
                    'desc'      => __( 'Enter your IBAN number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
                [
                    'id'        => 'swift',
                    'title'     => __( 'Swift Code', 'dokan-lite' ),
                    'desc'      => __( 'Enter your banks Swift Code.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ],
            ],
        ];

        return $settings;
    }
}
