<?php

namespace WeDevs\Dokan\Vendor\SettingsApi\PaymentProcessors;

use WeDevs\Dokan\Vendor\SettingsApi\PaymentProcessor;

defined( 'ABSPATH' ) || exit;

/**
 * Payment processor Bank.
 *
 * @since DOKAN_SINCE
 */
class Bank extends PaymentProcessor {

    /**
     * Render the settings page for bank.
     *
     * @since DOKAN_SINCE
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
            'icon'      => '<i class="fa fa-paypal"></i>',
            'type'      => 'card',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
        ];
        $settings[] = [
            'id'        => 'bank',
            'title'     => __( 'Bank', 'dokan-lite' ),
            'desc'      => __( 'Bank settings', 'dokan-lite' ),
            'icon'      => '<i class="fa fa-bank"></i>',
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
