<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Contracts\Hookable;

class SettingsMapperCallbacks implements Hookable {

    /**
     * Register hooks for WordPress.
     * This method will be called automatically to register the hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_customer_details_visibility' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_cod_payments' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_welcome_wizard' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_delivery_support' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_report_abuse_reasons_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_report_abuse_reasons_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_report_rma_reasons_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_report_rma_reasons_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_vendor_extra_fields_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_vendor_extra_fields_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_customer_extra_fields_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_customer_extra_fields_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_after_grace_period_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_after_grace_period_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_discount_edit_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_discount_edit_new_to_old' ], 10, 3 );
    }

    /**
     * Function for mapping customer visibility
     *
     * @since DOKAN_SINCE
     *
     * @param $value
     * @param $to_indicator
     * @param $old_key
     * @param $new_key
     *
     * @return string|null
     */
    public function map_customer_details_visibility( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_selling.hide_customer_info' !== $old_key || 'general.marketplace.marketplace_settings.show_customer_details_to_vendors' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        return $value === 'on' ? 'off' : 'on';
    }

    /**
     * Function for mapping COD Payments between old and new settings
     *
     * Maps legacy 'on'/'off' values to new 'exclude'/'include' values and vice versa.
     * Returns immediately if the value is null.
     *
     * @since DOKAN_SINCE
     *
     * @param string|null $value The current value to map
     * @param string      $to_indicator Direction of mapping: 'old_to_new' or 'new_to_old'
     * @param string      $old_key The legacy setting key
     * @param string      $new_key The new settings dot-path key
     *
     * @return string|null The mapped value or null if input is null
     */
    public function map_cod_payments( $value, $to_indicator, $old_key, $new_key ) {

        $old = 'dokan_withdraw.exclude_cod_payment';
        $new = 'transaction.withdraw_charge.cod_payments_section.cod_payments';

        if ( is_null( $value ) || $old !== $old_key || $new !== $new_key ) {
            return $value;
        }

        // OLD → NEW (off/on → include/exclude)
        if ( $to_indicator === 'old_to_new' ) {
            return $value === 'on' ? 'exclude' : 'include';
        }

        // NEW → OLD (include/exclude → off/on)
        if ( $to_indicator === 'new_to_old' ) {
            return $value === 'exclude' ? 'on' : 'off';
        }

        return $value;
    }

    /**
     * Function to map report abuse reasons from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_report_abuse_reasons_new_to_old( $value, $old_key, $new_key ) {
        if ( is_null( $value ) || 'dokan_report_abuse.abuse_reasons' !== $old_key || 'moderation.report_abuse.report_abuse_settings.report_abuse_reasons' !== $new_key ) {
            return $value;
        }
        $old_value = [];
        foreach ( (array) $value as $item ) {
            $old_value[] = [
                'id'    => $item['id'] ?? '',
                'value' => $item['title'] ?? '',
            ];
        }
        return $old_value;
    }

    /**
     * Function to map report abuse reasons from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_report_abuse_reasons_old_to_new( $value, $old_key, $new_key ) {
        if ( is_null( $value ) || 'dokan_report_abuse.abuse_reasons' !== $old_key || 'moderation.report_abuse.report_abuse_settings.report_abuse_reasons' !== $new_key ) {
            return $value;
        }
        $new_value = [];
        foreach ( (array) $value as $index => $item ) {
            $new_value[] = [
                'id'    => $item['id'] ?? 'abuse_reason_' . ( $index + 1 ),
                'title' => $item['value'] ?? '',
                'order' => $index + 1,
            ];
        }
        return $new_value;
    }

    /**
     * Function to map report rma reasons from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_report_rma_reasons_new_to_old( $value, $old_key, $new_key ) {
        if ( is_null( $value ) || 'dokan_rma.rma_reasons' !== $old_key || 'moderation.rma.reasons_of_rma_settings.rma_reasons' !== $new_key ) {
            return $value;
        }
        $old_value = [];
        foreach ( (array) $value as $item ) {
            $old_value[] = [
                'id'    => $item['id'] ?? '',
                'value' => $item['title'] ?? '',
            ];
        }
        return $old_value;
    }

    /**
     * Function to map report rma reasons from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_report_rma_reasons_old_to_new( $value, $old_key, $new_key ) {
        if ( is_null( $value ) || 'dokan_rma.rma_reasons' !== $old_key || 'moderation.rma.reasons_of_rma_settings.rma_reasons' !== $new_key ) {
            return $value;
        }
        $new_value = [];
        foreach ( (array) $value as $index => $item ) {
            // Old format has 'id' and 'value'; new format expects 'id', 'title', 'order'
            $new_value[] = [
                'id'    => $item['id'] ?? 'abuse_reason_' . ( $index + 1 ),
                'title' => $item['value'] ?? '',
                'order' => $index + 1,
            ];
        }
        return $new_value;
    }

    /**
     * Function for mapping welcome wizard setting
     *
     * @since DOKAN_SINCE
     *
     * @param string $value
     * @param string $to_indicator
     * @param string $old_key
     * @param string $new_key
     *
     * @return string|null
     */
    public function map_welcome_wizard( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_general.disable_welcome_wizard' !== $old_key || 'vendor.vendor_onboarding.welcome_wizard' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        return $value === 'on' ? 'off' : 'on';
    }

    /**
     * Function to map vendor extra fields from old format to new format
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_vendor_extra_fields_old_to_new( $value, $old_key, $new_key ) {
        if ( 'dokan_germanized.vendor_fields' !== $old_key || 'compliance.eu_compliance.vendor_extra_fields.vendor_extra_fields' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];
        if ( ! empty( $value['dokan_company_name'] ) ) {
            $mapped[] = 'company_name';
        }
        if ( ! empty( $value['dokan_company_id_number'] ) ) {
            $mapped[] = 'company_id_number';
        }
        if ( ! empty( $value['dokan_vat_number'] ) ) {
            $mapped[] = 'vat_number';
        }
        if ( ! empty( $value['dokan_bank_name'] ) ) {
            $mapped[] = 'bank_name';
        }
        if ( ! empty( $value['dokan_bank_iban'] ) ) {
            $mapped[] = 'bank_iban';
        }
        return $mapped;
    }

    /**
     * Function to map vendor extra fields from new format to old format
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_vendor_extra_fields_new_to_old( $value, $old_key, $new_key ) {

        if ( 'dokan_germanized.vendor_fields' !== $old_key || 'compliance.eu_compliance.vendor_extra_fields.vendor_extra_fields' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        $old_value = [
            'dokan_company_name'      => '',
            'dokan_company_id_number' => '',
            'dokan_vat_number'        => '',
            'dokan_bank_name'         => '',
            'dokan_bank_iban'         => '',
        ];

        foreach ( (array) $value as $field ) {
            switch ( $field ) {
                case 'company_name':
                    $old_value['dokan_company_name'] = 'dokan_company_name';
                    break;

                case 'company_id_number':
                    $old_value['dokan_company_id_number'] = 'dokan_company_id_number';
                    break;

                case 'vat_number':
                    $old_value['dokan_vat_number'] = 'dokan_vat_number';
                    break;

                case 'bank_name':
                    $old_value['dokan_bank_name'] = 'dokan_bank_name';
                    break;

                case 'bank_iban':
                    $old_value['dokan_bank_iban'] = 'dokan_bank_iban';
                    break;
            }
        }
        return $old_value;
    }

    /**
     * Function to map customer extra fields from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_customer_extra_fields_old_to_new( $value, $old_key, $new_key ) {

        if ( 'dokan_germanized.customer_fields' !== $old_key || 'compliance.eu_compliance.customer_extra_fields.customer_extra_fields' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        if ( ! empty( $value['billing_dokan_company_id_number'] ) ) {
            $mapped[] = 'billing_dokan_company_id_number';
        }

        if ( ! empty( $value['billing_dokan_vat_number'] ) ) {
            $mapped[] = 'billing_dokan_vat_number';
        }

        if ( ! empty( $value['billing_dokan_bank_name'] ) ) {
            $mapped[] = 'billing_dokan_bank_name';
        }

        if ( ! empty( $value['billing_dokan_bank_iban'] ) ) {
            $mapped[] = 'billing_dokan_bank_iban';
        }

        return $mapped;
    }

    /**
     * Function to map customer extra fields from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_customer_extra_fields_new_to_old( $value, $old_key, $new_key ) {

        if ( 'dokan_germanized.customer_fields' !== $old_key || 'compliance.eu_compliance.customer_extra_fields.customer_extra_fields' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $old_value = [
            'billing_dokan_company_id_number' => '',
            'billing_dokan_vat_number'        => '',
            'billing_dokan_bank_name'         => '',
            'billing_dokan_bank_iban'         => '',
        ];

        foreach ( (array) $value as $field ) {
            switch ( $field ) {
                case 'billing_dokan_company_id_number':
                    $old_value['billing_dokan_company_id_number'] = 'billing_dokan_company_id_number';
                    break;

                case 'billing_dokan_vat_number':
                    $old_value['billing_dokan_vat_number'] = 'billing_dokan_vat_number';
                    break;

                case 'billing_dokan_bank_name':
                    $old_value['billing_dokan_bank_name'] = 'billing_dokan_bank_name';
                    break;

                case 'billing_dokan_bank_iban':
                    $old_value['billing_dokan_bank_iban'] = 'billing_dokan_bank_iban';
                    break;
            }
        }
        return $old_value;
    }

    /**
     * Function for mapping delivery support between old and new settings
     *
     * Maps legacy associative array to new numeric array and vice versa.
     * Returns immediately if the value is null.
     *
     * @since DOKAN_SINCE
     *
     * @param array|null $value The current value to map
     * @param string      $to_indicator Direction of mapping: 'old_to_new' or 'new_to_old'
     * @param string      $old_key The legacy setting key
     * @param string      $new_key The new settings dot-path key
     *
     * @return array|null The mapped value or null if input is null
     */
    public function map_delivery_support( $value, $to_indicator, $old_key, $new_key ) {

        $old = 'dokan_delivery_time.delivery_support';
        $new = 'shipment.dashboard-delivery-days-page.dokan_delivery_time.delivery_support';

        if ( is_null( $value ) || $old !== $old_key || $new !== $new_key ) {
            return $value;
        }

        /**
         * OLD → NEW
         * old format: [ 'delivery' => 'delivery', 'store-pickup' => 'store-pickup' ]
         * new format: [ 'delivery', 'store-pickup' ]
         */
        if ( $to_indicator === 'old_to_new' ) {
            return array_values( (array) $value );
        }

        /**
         * NEW → OLD
         * new format: [ 'delivery', 'store-pickup' ]
         * old format must include both keys:
         *
         * [
         *   'delivery'     => 'delivery',
         *   'store-pickup' => '' or 'store-pickup'
         * ]
         */
        if ( $to_indicator === 'new_to_old' ) {

            // Default required keys with empty values
            $old_value = [
                'delivery'     => '',
                'store-pickup' => '',
            ];

            foreach ( (array) $value as $item ) {
                if ( $item === 'delivery' ) {
                    $old_value['delivery'] = 'delivery';
                }

                if ( $item === 'store-pickup' ) {
                    $old_value['store-pickup'] = 'store-pickup';
                }
            }
            return $old_value;
        }
        return $value;
    }

    /**
     * Function to map after grace period failed actions from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_after_grace_period_old_to_new( $value, $old_key, $new_key ) {

        if ( 'dokan_reverse_withdrawal.failed_actions' !== $old_key || 'transaction.reverse_withdrawal.reverse_withdrawal_section.failed_actions' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        // old array always has keys, but values may be empty (unchecked)
        foreach ( $value as $key => $val ) {
            if ( ! empty( $val ) ) {     // selected only
                $mapped[] = $key;
            }
        }

        return $mapped;  // can be empty array
    }

    /**
     * Function to map after grace period failed actions from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_after_grace_period_new_to_old( $value, $old_key, $new_key ) {

        if ( 'dokan_reverse_withdrawal.failed_actions' !== $old_key || 'transaction.reverse_withdrawal.reverse_withdrawal_section.failed_actions' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        // old keys always exist
        $old_value = [
            'enable_catalog_mode' => '',
            'hide_withdraw_menu'  => '',
            'status_inactive'     => '',
        ];

        if ( is_array( $value ) ) {
            foreach ( $value as $action ) {
                // Only the selected items get filled on both sides
                if ( isset( $old_value[ $action ] ) ) {
                    $old_value[ $action ] = $action;
                }
            }
        }
        return $old_value;
    }

    /**
     * Function to map discount edit settings from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_discount_edit_old_to_new( $value, $old_key, $new_key ) {

        if ( 'dokan_selling.discount_edit' !== $old_key || 'vendor.vendor_capabilities.vendor_capabilities.discount_settings' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        if ( is_array( $value ) ) {
            foreach ( $value as $option_key => $option_value ) {
                if ( ! empty( $option_value ) ) {
                    // selected in old format
                    $mapped[] = $option_key;
                }
            }
        }

        return $mapped; // may be empty
    }

    /**
     * Function to map discount edit settings from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_discount_edit_new_to_old( $value, $old_key, $new_key ) {

        if ( 'dokan_selling.discount_edit' !== $old_key || 'vendor.vendor_capabilities.vendor_capabilities.discount_settings' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        // Old keys must always exist
        $old_value = [
            'order-discount'   => '',
            'product-discount' => '',
        ];

        if ( is_array( $value ) ) {
            foreach ( $value as $option_key ) {
                if ( isset( $old_value[ $option_key ] ) ) {
                    $old_value[ $option_key ] = $option_key;
                }
            }
        }
        return $old_value;
    }
}
