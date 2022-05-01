<?php
namespace WeDevs\Dokan\ReverseWithdrawal\Admin;

use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Settings
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\Admin
 *
 * @since DOKAN_SINCE
 */
class Settings {

    /**
     * Settings constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        // Hooks
        add_filter( 'dokan_settings_sections', [ $this, 'load_settings_section' ], 21 );
        add_filter( 'dokan_settings_fields', [ $this, 'load_settings_fields' ], 21 );
    }

    /**
     * Load admin settings section
     *
     * @since DOKAN_SINCE
     *
     * @param array $section
     *
     * @return array
     */
    public function load_settings_section( $section ) {
        $reverse_withdrawal = array(
            'id'    => 'dokan_reverse_withdrawal',
            'title' => __( 'Reverse Withdrawal', 'dokan-lite' ),
            'icon'  => 'dashicons-money-alt',
        );

        // insert reverse withdrawal section after withdrawal section
        $position = false;
        $len      = count( $section );
        for ( $i = 0; $i < $len; $i++ ) {
            if ( 'dokan_withdraw' === $section[ $i ]['id'] ) {
                $position = $i;
                break;
            }
        }

        if ( $position !== false ) {
            array_splice( $section, $position + 1, 0, [ $reverse_withdrawal ] );
        } else {
            $section[] = $reverse_withdrawal;
        }

        return $section;
    }

    /**
     * Load all settings fields
     *
     * @since DOKAN_SINCE
     *
     * @param array $fields
     *
     * @return array
     */
    public function load_settings_fields( $fields ) {
        $settings_fields = [
            'enabled' => [
                'name'    => 'enabled',
                'label'   => __( 'Enable Reverse Withdrawal', 'dokan-lite' ),
                'desc'    => __( 'Check this checkbox if you want to enable reverse withdrawal feature for vendors.', 'dokan-lite' ),
                'type'    => 'checkbox',
                'default' => 'off',
            ],
            'payment_gateways' => [
                'name'    => 'payment_gateways',
                'label'   => __( 'Reverse Withdrawal Payment Methods', 'dokan-lite' ),
                'desc'    => __( 'Check the payment gateways you want to enable reverse withdrawal for.', 'dokan-lite' ),
                'type'    => 'multicheck',
                'options' => SettingsHelper::get_reverse_withrawal_payment_gateways(),
                'default' => [ 'cod' => 'cod' ],
            ],
            'billing_type' => [
                'name'    => 'billing_type',
                'label'   => __( 'Billing Type', 'dokan-lite' ),
                'desc'    => __( 'Select how vendors will be charged for their reverse balance.', 'dokan-lite' ),
                'type'    => 'select',
                'options' => SettingsHelper::get_billing_type_options(),
                'default' => 'by_amount',
            ],
            'reverse_balance_threshold' => [
                'name'    => 'reverse_balance_threshold',
                'label'   => sprintf( '%1$s (%2$s)', __( 'Reverse Balance Threshold', 'dokan-lite' ), get_woocommerce_currency() ),
                'desc'    => __( 'Set reverse withdrawal threshold limit.', 'dokan-lite' ),
                'type'    => 'number',
                'min'     => 0,
                'default' => '150',
                'step'    => '0.5',
                'show_if' => [
                    'billing_type' => [
                        'equal' => 'by_amount',
                    ],
                ],
            ],
            'monthly_billing_day' => [
                'name'    => 'monthly_billing_day',
                'label'   => __( 'Monthly Billing Day', 'dokan-lite' ),
                'desc'    => __( 'Enter day number when you want to send reverse withdrawal balance invoice to vendors.', 'dokan-lite' ),
                'type'    => 'number',
                'min'     => 1,
                'max'     => 31,
                'step'    => 1,
                'default' => '1',
                'show_if' => [
                    'billing_type' => [
                        'equal' => 'by_month',
                    ],
                ],
            ],
            'due_period' => [
                'name'    => 'due_period',
                'label'   => __( 'Due Period', 'dokan-lite' ),
                'desc'    => __( 'Maximum Payment Due period in day(s) before selected action is taken. Enter 0 to take actions immediately.', 'dokan-lite' ),
                'type'    => 'number',
                'min'     => '0',
                'max'     => '28',
                'step'    => '1',
                'default' => '7',
            ],
            'failed_actions' => [
                'name'    => 'failed_actions',
                'label'   => __( 'After Due Period', 'dokan-lite' ),
                'desc'    => __( 'Select one or more actions to perform after due period is over and vendors was unable to pay.', 'dokan-lite' ),
                'type'    => 'multicheck',
                'options' => SettingsHelper::get_failed_payment_actions(),
                'default' => [ 'status_inactive' => 'status_inactive' ],
            ],
            'display_notice' => [
                'name'    => 'display_notice',
                'label'   => __( 'Display Notice During Due Period', 'dokan-lite' ),
                'desc'    => __( 'Display notice to pay reverse withdrawal balance during Due Period under vendor dashboard.', 'dokan-lite' ),
                'type'    => 'checkbox',
                'default' => 'on',
            ],
        ];

        // Dokan pro related settings
        if ( dokan()->is_pro_exists() ) {
            $settings_fields['send_announcement'] = [
                'name'    => 'send_announcement',
                'label'   => __( 'Send announcement?', 'dokan-lite' ),
                'desc'    => __( 'Check this checkbox if you want to send announcement during due period. Note that, maximum one announcement will be send during a single billing period.', 'dokan-lite' ),
                'type'    => 'checkbox',
                'default' => 'off',
            ];
            //todo: add settings for failed refund from vendor end
        }

        $fields['dokan_reverse_withdrawal'] = apply_filters( 'dokan_reverse_withdrawal_setting_fields', $settings_fields );

        return $fields;
    }
}
