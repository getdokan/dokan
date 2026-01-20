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
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_withdraw_options_visibility' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_cod_payments' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_welcome_wizard' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_delivery_support' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_abuse_reported_by' ], 10, 4 );
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
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_vendor_info_visibility' ], 10, 6 );
        add_filter( 'dokan_settings_mapper_after_transform_old_to_new', [ $this, 'map_location_placement_old_to_new' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_new_to_old', [ $this, 'map_location_placement_new_to_old' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_old_to_new', [ $this, 'map_single_product_preview_old_to_new' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_new_to_old', [ $this, 'map_single_product_preview_new_to_old' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_discount_edit_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_discount_edit_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_withdraw_disbursement_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_withdraw_disbursement_new_to_old' ], 10, 3 );

        add_filter( 'dokan_settings_mapper_after_transform_old_to_new', [ $this, 'map_disbursement_schedule_old_to_new' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_new_to_old', [ $this, 'map_disbursement_schedule_new_to_old' ], 10, 2 );

        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_delivery_support_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_delivery_support_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_old_to_new', [ $this, 'map_shipping_status_list_old_to_new' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_shipping_status_list_new_to_old' ], 10, 3 );
        add_filter( 'dokan_settings_mapper_after_transform_old_to_new', [ $this, 'map_withdraw_methods_old_to_new' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_new_to_old', [ $this, 'map_withdraw_methods_new_to_old' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_after_transform_old_to_new', [ $this, 'map_reverse_withdrawal_enabled_old_to_new' ], 10, 2 );
        add_filter( 'dokan_settings_mapper_transform_value_new_to_old', [ $this, 'map_reverse_withdrawal_enabled_new_to_old' ], 10, 4 );
    }

    /**
     * Function for mapping customer visibility
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
    public function map_customer_details_visibility( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_selling.hide_customer_info' !== $old_key || 'general.marketplace.marketplace_settings.show_customer_details_to_vendors' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        return $value === 'on' ? 'off' : 'on';
    }

    /**
     * Function for mapping for withdraw options visibility.
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
    public function map_withdraw_options_visibility( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_withdraw.hide_withdraw_option' !== $old_key || 'transaction.withdraw_charge.withdraw_option_visibility_section.withdraw_option_visibility' !== $new_key || is_null( $value ) ) {
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
        if ( 'dokan_germanized.vendor_fields' !== $old_key || 'compliance.eu_compliance.eu_compliance_settings.vendor_extra_fields' !== $new_key || is_null( $value ) ) {
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

        if ( 'dokan_germanized.vendor_fields' !== $old_key || 'compliance.eu_compliance.eu_compliance_settings.vendor_extra_fields' !== $new_key || is_null( $value ) ) {
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

        if ( 'dokan_germanized.customer_fields' !== $old_key || 'compliance.eu_compliance.eu_compliance_settings.customer_extra_fields' !== $new_key || is_null( $value ) ) {
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

        if ( 'dokan_germanized.customer_fields' !== $old_key || 'compliance.eu_compliance.eu_compliance_settings.customer_extra_fields' !== $new_key || is_null( $value ) ) {
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
     * Function for mapping abuse reported by settings between old and new settings.
     *
     * Maps legacy 'on'/'off' values to new 'all_users'/'logged_in_users' values and vice versa.
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
    public function map_abuse_reported_by( $value, $to_indicator, $old_key, $new_key ) {
        $old = 'dokan_report_abuse.reported_by_logged_in_users_only';
        $new = 'moderation.report_abuse.report_abuse_settings.report_abuse_reported_by';

        if ( is_null( $value ) || $old !== $old_key || $new !== $new_key ) {
            return $value;
        }

        // OLD → NEW (off/on → include/exclude)
        if ( $to_indicator === 'old_to_new' ) {
            return $value !== 'on' ? 'all_users' : 'logged_in_users';
        }

        // NEW → OLD (include/exclude → off/on)
        if ( $to_indicator === 'new_to_old' ) {
            return $value !== 'all_users' ? 'on' : 'off';
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
     * Map vendor info visibility with inverted logic and renamed values
     * OLD: hide_vendor_info ['email', 'phone', 'address'] - items to HIDE
     * NEW: vendor_info_visibility ['store_email', 'store_phone', 'store_address'] - items to SHOW
     *
     * @since DOKAN_SINCE
     * @param mixed $value
     * @param string $to_indicator Direction: 'new_to_old' or 'old_to_new'
     * @param string $old_key
     * @param string $new_key
     * @param array $source_values
     * @param array $result
     * @return mixed
     */
    public function map_vendor_info_visibility( $value, $to_indicator, $old_key, $new_key, $source_values = [], $result = [] ) {
        // Only process our specific mapping
        if ( 'dokan_appearance.hide_vendor_info' !== $old_key || 'appearance.store.vendor_info_visibility_section.vendor_info_visibility' !== $new_key ) {
            return $value;
        }

        if ( is_null( $value ) ) {
            return $value;
        }

        // Mapping between old and new field names
        $field_map = [
            'email'   => 'store_email',
            'phone'   => 'store_phone',
            'address' => 'store_address',
        ];

        // All possible values
        $all_values_old = [ 'email', 'phone', 'address' ];
        $all_values_new = [ 'store_email', 'store_phone', 'store_address' ];

        if ( 'old_to_new' === $to_indicator ) {
            // OLD → NEW: ['email'=>'email', 'phone'=>''] (associative) → ['store_email'=>'', 'store_phone'=>1] (associative)

            if ( ! is_array( $value ) ) {
                $value = [];
            }

            // Extract hidden items from old format (non-empty values = hidden)
            $hidden_items_old = [];
            foreach ( $all_values_old as $old_key_check ) {
                if ( isset( $value[ $old_key_check ] ) ) {
                    $val = $value[ $old_key_check ];
                    // Non-empty value means HIDDEN in old format
                    if ( ! empty( $val ) && $val !== '' && $val !== '0' && $val !== 0 && $val !== false ) {
                        $hidden_items_old[] = $old_key_check;
                    }
                }
            }
            // Map old hidden items to new field names
            $hidden_items_new = [];
            foreach ( $hidden_items_old as $old_item ) {
                if ( isset( $field_map[ $old_item ] ) ) {
                    $hidden_items_new[] = $field_map[ $old_item ];
                }
            }
            // Build result: all items as keys, value=1 if NOT hidden (shown), value='' if hidden
            $result_array = [];
            foreach ( $all_values_new as $new_key ) {
                if ( in_array( $new_key, $hidden_items_new, true ) ) {
                    $result_array[ $new_key ] = '';  // Hidden = empty string
                } else {
                    $result_array[ $new_key ] = 1;   // Shown = 1
                }
            }

            return $result_array;
        }

        if ( 'new_to_old' === $to_indicator ) {
            // NEW → OLD: ['store_email'=>1, 'store_phone'=>''] (associative) → ['email'=>'', 'phone'=>'phone'] (associative)

            if ( ! is_array( $value ) ) {
                $value = [];
            }

            // Extract shown items (value = 1 or truthy = SHOWN)
            $shown_items_new = [];
            foreach ( $value as $key => $val ) {
                // Truthy and not empty string means it's SHOWN
                if ( ! empty( $val ) && $val !== '' && $val !== '0' && $val !== 0 && $val !== false ) {
                    $shown_items_new[] = $key;
                }
            }
            // Map shown new items back to old field names
            $reverse_map = array_flip( $field_map );
            $shown_items_old = [];
            foreach ( $shown_items_new as $new_item ) {
                if ( isset( $reverse_map[ $new_item ] ) ) {
                    $shown_items_old[] = $reverse_map[ $new_item ];
                }
            }
            // Build result in old format: key with value=itself means HIDDEN, key with value='' means SHOWN
            $result_array = [];
            foreach ( $all_values_old as $old_key_check ) {
                if ( in_array( $old_key_check, $shown_items_old, true ) ) {
                    $result_array[ $old_key_check ] = '';  // Shown = empty string
                } else {
                    $result_array[ $old_key_check ] = $old_key_check;  // Hidden = key itself
                }
            }
            return $result_array;
        }

        return $value;
    }

    /**
     * Map location placement from old (two settings) to new (one multi-select)
     * Old → New direction
     *
     * @since DOKAN_SINCE
     * @param array $result The converted new settings array
     * @param array $legacy_values The source legacy settings array
     * @return array Modified result
     */
    public function map_location_placement_old_to_new( $result, $legacy_values ) {
        $map_pages = $legacy_values['dokan_geolocation']['show_location_map_pages'] ?? '';
        $product_tab = $legacy_values['dokan_geolocation']['show_product_location_in_wc_tab'] ?? 'off';

        $locations = [];

        // Handle radio field mapping
        if ( ! empty( $map_pages ) ) {
            switch ( $map_pages ) {
                case 'all':
                    $locations[] = 'store_listing';
                    $locations[] = 'shop_page';
                    break;
                case 'store_listing':
                    $locations[] = 'store_listing';
                    break;
                case 'shop':
                    $locations[] = 'shop_page';
                    break;
            }
        }

        // Handle switch field mapping
        if ( $product_tab === 'on' || $product_tab === true || $product_tab === '1' ) {
            $locations[] = 'single_product_location_tab';
        }

        // Remove duplicates and set the value
        $locations = array_unique( $locations );

        // Set the combined value in the new structure
        SettingsMapper::set_value_by_path(
            $result,
            'general.location.map_placement.map_placement_locations',
            $locations
        );

        return $result;
    }

    /**
     * Map location placement from new (one multi-select) to old (two settings)
     * New → Old direction
     *
     * @since DOKAN_SINCE
     * @param array $result The converted legacy settings array
     * @param array $pages_values The source new settings array
     * @return array Modified result
     */
    public function map_location_placement_new_to_old( $result, $pages_values ) {
        $locations = (array) SettingsMapper::get_value_by_path(
            $pages_values,
            'general.location.map_placement.map_placement_locations',
            []
        );

        // Determine the radio value based on checkboxes
        $has_store_listing = in_array( 'store_listing', $locations, true );
        $has_shop_page = in_array( 'shop_page', $locations, true );
        $has_product_tab = in_array( 'single_product_location_tab', $locations, true );

        // Map to radio field value
        if ( $has_store_listing && $has_shop_page ) {
            $result['dokan_geolocation']['show_location_map_pages'] = 'all';
        } elseif ( $has_store_listing ) {
            $result['dokan_geolocation']['show_location_map_pages'] = 'store_listing';
        } elseif ( $has_shop_page ) {
            $result['dokan_geolocation']['show_location_map_pages'] = 'shop';
        } else {
            $result['dokan_geolocation']['show_location_map_pages'] = '';
        }

        // Map to switch field value
        $result['dokan_geolocation']['show_product_location_in_wc_tab'] = $has_product_tab ? 'on' : 'off';

        return $result;
    }
    /**
     * Map single product preview from old (three separate settings) to new (one multi-checkbox)
     * Old → New direction
     *
     * OLD settings:
     * - dokan_general.show_vendor_info: 'on' = SHOW, 'off' = HIDE
     * - dokan_general.enabled_more_products_tab: 'on' = SHOW, 'off' = HIDE
     * - dokan_selling.disable_shipping_tab: 'on' = HIDE, 'off' = SHOW (inverted!)
     *
     * NEW setting:
     * - appearance.store.single_product_preview_section.single_product_preview
     *   {vendor_info: true, more_products_tab: true, shipping_tab: true}
     *   true = SHOW, false = HIDE
     *
     * @since DOKAN_SINCE
     * @param array $result The converted new settings array
     * @param array $legacy_values The source legacy settings array
     * @return array Modified result
     */
    public function map_single_product_preview_old_to_new( $result, $legacy_values ) {
        // Define the keys we're mapping for clarity
        $old_keys = [
            'vendor_info'       => 'dokan_general.show_vendor_info',
            'more_products_tab' => 'dokan_general.enabled_more_products_tab',
            'shipping_tab'      => 'dokan_selling.disable_shipping_tab',
        ];
        $new_key = 'appearance.store.single_product_preview_section.single_product_preview';

        // Only run this mapping if at least one of the source fields is present
        $has_vendor_info = isset( $legacy_values['dokan_general']['show_vendor_info'] );
        $has_more_products = isset( $legacy_values['dokan_general']['enabled_more_products_tab'] );
        $has_shipping = isset( $legacy_values['dokan_selling']['disable_shipping_tab'] );

        if ( ! $has_vendor_info && ! $has_more_products && ! $has_shipping ) {
            // None of the source fields are present, skip mapping
            return $result;
        }

        $show_vendor_info = 'off';
        if ( $has_vendor_info ) {
            $show_vendor_info = $legacy_values['dokan_general']['show_vendor_info'];
        }

        $enabled_more_products = 'off';
        if ( $has_more_products ) {
            $enabled_more_products = $legacy_values['dokan_general']['enabled_more_products_tab'];
        }

        $disable_shipping = 'off';
        if ( $has_shipping ) {
            $disable_shipping = $legacy_values['dokan_selling']['disable_shipping_tab'];
        }

        // Build the new structure
        $vendor_info_value = false;
        if ( $show_vendor_info === 'on' ) {
            $vendor_info_value = true;
        }

        $more_products_value = false;
        if ( $enabled_more_products === 'on' ) {
            $more_products_value = true;
        }

        $shipping_tab_value = true; // Default to true (shown)
        if ( $disable_shipping === 'on' ) {
            $shipping_tab_value = false; // Inverted: 'on' means disabled in old
        }

        $preview_settings = [
            'vendor_info'       => $vendor_info_value,
            'more_products_tab' => $more_products_value,
            'shipping_tab'      => $shipping_tab_value,
        ];

        // Set the combined value in the new structure
        SettingsMapper::set_value_by_path(
            $result,
            $new_key,
            $preview_settings
        );

        return $result;
    }

    /**
     * Map single product preview from new (one multi-checkbox) to old (three separate settings)
     * New → Old direction
     *
     * @since DOKAN_SINCE
     * @param array $result The converted legacy settings array
     * @param array $pages_values The source new settings array
     * @return array Modified result
     */
    public function map_single_product_preview_new_to_old( $result, $pages_values ) {
        // Define the keys we're mapping for clarity
        $new_key = 'appearance.store.single_product_preview_section.single_product_preview';
        $old_keys = [
            'vendor_info'       => 'dokan_general.show_vendor_info',
            'more_products_tab' => 'dokan_general.enabled_more_products_tab',
            'shipping_tab'      => 'dokan_selling.disable_shipping_tab',
        ];

        $preview = SettingsMapper::get_value_by_path(
            $pages_values,
            $new_key,
            []
        );

        // Ensure we have an array
        if ( ! is_array( $preview ) ) {
            $preview = [];
        }

        // Extract boolean values (handle boolean, truthy values, and empty strings)
        // Empty string means unchecked, 1 or true means checked
        $vendor_info_enabled = false;
        if ( isset( $preview['vendor_info'] ) ) {
            $value = $preview['vendor_info'];
            if ( $value !== '' && $value !== '0' && $value !== 0 && $value !== false ) {
                $vendor_info_enabled = true;
            }
        }

        $more_products_enabled = false;
        if ( isset( $preview['more_products_tab'] ) ) {
            $value = $preview['more_products_tab'];
            if ( $value !== '' && $value !== '0' && $value !== 0 && $value !== false ) {
                $more_products_enabled = true;
            }
        }

        $shipping_enabled = false;
        if ( isset( $preview['shipping_tab'] ) ) {
            $value = $preview['shipping_tab'];
            if ( $value !== '' && $value !== '0' && $value !== 0 && $value !== false ) {
                $shipping_enabled = true;
            }
        }

        // Initialize sections if they don't exist
        if ( ! isset( $result['dokan_general'] ) ) {
            $result['dokan_general'] = [];
        }
        if ( ! isset( $result['dokan_selling'] ) ) {
            $result['dokan_selling'] = [];
        }

        // Map to legacy format
        if ( $vendor_info_enabled ) {
            $result['dokan_general']['show_vendor_info'] = 'on';
        } else {
            $result['dokan_general']['show_vendor_info'] = 'off';
        }

        if ( $more_products_enabled ) {
            $result['dokan_general']['enabled_more_products_tab'] = 'on';
        } else {
            $result['dokan_general']['enabled_more_products_tab'] = 'off';
        }

        // Inverted: if shipping is enabled (true) in new, disable_shipping should be 'off' in old
        if ( $shipping_enabled ) {
            $result['dokan_selling']['disable_shipping_tab'] = 'off';
        } else {
            $result['dokan_selling']['disable_shipping_tab'] = 'on';
        }

        return $result;
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
        $old_data_key = 'dokan_selling.discount_edit';
        $new_data_key = 'vendor.vendor_capabilities.vendor_capabilities.discount_settings';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        foreach ( $value as $option_key => $option_value ) {
            if ( ! empty( $option_value ) ) {
                // Selected in the old format.
                $mapped[] = $option_key;
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
        $old_data_key = 'dokan_selling.discount_edit';
        $new_data_key = 'vendor.vendor_capabilities.vendor_capabilities.discount_settings';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
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

    /**
     * Function to map discount edit settings from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_withdraw_disbursement_old_to_new( $value, $old_key, $new_key ) {
        $old_data_key = 'dokan_withdraw.disbursement';
        $new_data_key = 'transaction.withdraw_charge.withdraw_option_visibility_section.manual_withdraw';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        foreach ( $value as $option_key => $option_value ) {
            if ( ! empty( $option_value ) ) {
                // Selected in the old format.
                $mapped[] = $option_key;
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
    public function map_withdraw_disbursement_new_to_old( $value, $old_key, $new_key ) {
        $old_data_key = 'dokan_withdraw.disbursement';
        $new_data_key = 'transaction.withdraw_charge.withdraw_option_visibility_section.manual_withdraw';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
            return $value;
        }

        // Old keys must always exist
        $old_value = [
            'manual'   => '',
            'schedule' => '',
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

    /**
     * Post-transform legacy settings to new settings for disbursement schedule.
     *
     * @since DOKAN_SINCE
     *
     * @param array $result
     * @param array $legacy_values
     *
     * @return array
     */
    public function map_disbursement_schedule_old_to_new( $result, $legacy_values ) {
        if ( ! isset( $legacy_values['dokan_withdraw']['disbursement_schedule'] ) ) {
            return $result;
        }
        $disbursement_schedule = $legacy_values['dokan_withdraw']['disbursement_schedule'];

        $schedules = [
            'quarterly' => 'transaction.withdraw_charge.withdraw_option_visibility_section.quarterly_withdraw_sub_section.quarterly_withdraw_group.quarterly_withdraw',
            'monthly'   => 'transaction.withdraw_charge.withdraw_option_visibility_section.monthly_withdraw_sub_section.monthly_withdraw_group.monthly_withdraw',
            'biweekly'  => 'transaction.withdraw_charge.withdraw_option_visibility_section.biweekly_withdraw_sub_section.biweekly_withdraw_group.biweekly_withdraw',
            'weekly'    => 'transaction.withdraw_charge.withdraw_option_visibility_section.weekly_withdraw_sub_section.weekly_withdraw_group.weekly_withdraw',
        ];

        $any_on = false;
        foreach ( $schedules as $legacy_key => $new_path ) {
            $value = ! empty( $disbursement_schedule[ $legacy_key ] ) ? 'on' : 'off';
            if ( $value === 'on' ) {
                $any_on = true;
            }
            SettingsMapper::set_value_by_path( $result, $new_path, $value );
        }

        // Also ensure manual_withdraw multicheck contains 'schedule' if any schedule is enabled
        if ( $any_on ) {
            $manual_withdraw = SettingsMapper::get_value_by_path( $result, 'transaction.withdraw_charge.withdraw_option_visibility_section.manual_withdraw', [] );
            if ( ! is_array( $manual_withdraw ) ) {
                $manual_withdraw = (array) $manual_withdraw;
            }

            if ( ! in_array( 'schedule', $manual_withdraw, true ) ) {
                $manual_withdraw[] = 'schedule';
                SettingsMapper::set_value_by_path( $result, 'transaction.withdraw_charge.withdraw_option_visibility_section.manual_withdraw', array_values( array_unique( $manual_withdraw ) ) );
            }
        }

        return $result;
    }

    /**
     * Post-transform new settings to legacy settings for disbursement schedule.
     *
     * @since DOKAN_SINCE
     *
     * @param array $result
     * @param array $pages_values
     *
     * @return array
     */
    public function map_disbursement_schedule_new_to_old( $result, $pages_values ) {
        $manual_withdraw = SettingsMapper::get_value_by_path( $pages_values, 'transaction.withdraw_charge.withdraw_option_visibility_section.manual_withdraw', null );

        if ( is_null( $manual_withdraw ) ) {
            return $result;
        }

        if ( ! is_array( $manual_withdraw ) || ! in_array( 'schedule', $manual_withdraw, true ) ) {
            if ( ! isset( $result['dokan_withdraw'] ) ) {
                $result['dokan_withdraw'] = [];
            }
            $result['dokan_withdraw']['disbursement_schedule'] = [];
            return $result;
        }

        $schedules = [
            'quarterly' => 'transaction.withdraw_charge.withdraw_option_visibility_section.quarterly_withdraw_sub_section.quarterly_withdraw_group.quarterly_withdraw',
            'monthly'   => 'transaction.withdraw_charge.withdraw_option_visibility_section.monthly_withdraw_sub_section.monthly_withdraw_group.monthly_withdraw',
            'biweekly'  => 'transaction.withdraw_charge.withdraw_option_visibility_section.biweekly_withdraw_sub_section.biweekly_withdraw_group.biweekly_withdraw',
            'weekly'    => 'transaction.withdraw_charge.withdraw_option_visibility_section.weekly_withdraw_sub_section.weekly_withdraw_group.weekly_withdraw',
        ];

        $legacy_schedule = [];
        foreach ( $schedules as $legacy_key => $new_path ) {
            $legacy_schedule[ $legacy_key ] = SettingsMapper::get_value_by_path( $pages_values, $new_path ) === 'on' ? $legacy_key : '';
        }

        if ( ! isset( $result['dokan_withdraw'] ) ) {
            $result['dokan_withdraw'] = [];
        }

        $result['dokan_withdraw']['disbursement_schedule'] = $legacy_schedule;

        return $result;
    }

    /**
     * Maps schedule day settings from legacy to new.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value
     * @param string $old_key
     * @param string $new_key
     * @param array  $legacy_values
     *
     * @return mixed
     */
    public function map_schedule_day_old_to_new( $value, $old_key, $new_key, $legacy_values ) {
        if ( ! is_array( $value ) && $old_key !== 'dokan_withdraw.weekly_schedule' ) {
            return $value;
        }

        switch ( $old_key ) {
            case 'dokan_withdraw.quarterly_schedule':
            case 'dokan_withdraw.monthly_schedule':
            case 'dokan_withdraw.biweekly_schedule':
                return isset( $value['days'] ) ? $this->get_day_number( $value['days'] ) : '1';
            case 'dokan_withdraw.weekly_schedule':
                return $value; // It's already 'monday', 'tuesday', etc.
        }

        return $value;
    }

    /**
     * Maps schedule day settings from new to legacy.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value
     * @param string $old_key
     * @param string $new_key
     * @param array  $pages_values
     *
     * @return mixed
     */
    public function map_schedule_day_new_to_old( $value, $old_key, $new_key, $pages_values ) {
        $day_keys = [
            'transaction.withdraw_charge.withdraw_option_visibility_section.quarterly_withdraw_sub_section.quarterly_withdraw_group.quarterly_withdraw_day',
            'transaction.withdraw_charge.withdraw_option_visibility_section.monthly_withdraw_sub_section.monthly_withdraw_group.monthly_withdraw_day',
            'transaction.withdraw_charge.withdraw_option_visibility_section.biweekly_withdraw_sub_section.biweekly_withdraw_group.biweekly_withdraw_day',
            'transaction.withdraw_charge.withdraw_option_visibility_section.weekly_withdraw_sub_section.weekly_withdraw_group.weekly_withdraw_day',
        ];

        if ( ! in_array( $new_key, $day_keys, true ) ) {
            return $value;
        }

        if ( $new_key === 'transaction.withdraw_charge.withdraw_option_visibility_section.weekly_withdraw_sub_section.weekly_withdraw_group.weekly_withdraw_day' ) {
            return $value;
        }

        $legacy_map = [
            'dokan_withdraw.quarterly_schedule' => [ 'month' => 'march', 'week' => '1', 'days' => 'monday' ],
            'dokan_withdraw.monthly_schedule'   => [ 'week' => '1', 'days' => 'monday' ],
            'dokan_withdraw.biweekly_schedule'  => [ 'week' => '1', 'days' => 'monday' ],
        ];

        if ( isset( $legacy_map[ $old_key ] ) ) {
            $result = $legacy_map[ $old_key ];
            $result['days'] = $this->get_day_name( $value );
            return $result;
        }

        return $value;
    }

    /**
     * Get day number from day name.
     *
     * @param string $day_name
     * @return string
     */
    private function get_day_number( $day_name ) {
        if ( is_array( $day_name ) ) {
            return '1';
        }
        $days = [
            'monday'    => '1',
            'tuesday'   => '2',
            'wednesday' => '3',
            'thursday'  => '4',
            'friday'    => '5',
            'saturday'  => '6',
            'sunday'    => '7',
        ];
        return $days[ strtolower( $day_name ) ] ?? '1';
    }

    /**
     * Get day name from day number.
     *
     * @param string $day_number
     * @return string
     */
    private function get_day_name( $day_number ) {
        if ( is_array( $day_number ) ) {
            return 'monday';
        }
        $days = [
            '1' => 'monday',
            '2' => 'tuesday',
            '3' => 'wednesday',
            '4' => 'thursday',
            '5' => 'friday',
            '6' => 'saturday',
            '7' => 'sunday',
        ];
        return $days[ $day_number ] ?? 'monday';
    }

    /**
     * Function to map delivery support settings from old format to new format.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_delivery_support_old_to_new( $value, $old_key, $new_key ) {
        $old_data_key = 'dokan_delivery_time.delivery_support';
        $new_data_key = 'shipment.dashboard-delivery-days-page.dokan_delivery_time.delivery_support';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $mapped = [];

        foreach ( $value as $option_value ) {
            if ( ! empty( $option_value ) ) {
                // Selected in the old format.
                $mapped[] = $option_value;
            }
        }

        return $mapped; // may be empty
    }

    /**
     * Function to map delivery support settings from new format to old format.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_delivery_support_new_to_old( $value, $old_key, $new_key ) {
        $old_data_key = 'dokan_delivery_time.delivery_support';
        $new_data_key = 'shipment.dashboard-delivery-days-page.dokan_delivery_time.delivery_support';

        if ( $old_data_key !== $old_key || $new_data_key !== $new_key || is_null( $value ) ) {
            return $value;
        }

        // Old keys must always exist
        $old_value = apply_filters( 'dokan_delivery_support_default_old_value', [
            'delivery'     => '',
            'store-pickup' => '',
        ] );

        if ( is_array( $value ) ) {
            foreach ( $value as $option_key ) {
                if ( isset( $old_value[ $option_key ] ) ) {
                    $old_value[ $option_key ] = $option_key;
                }
            }
        }
        return $old_value;
    }

    /**
     * Function to map shipping status list from old format to new format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_shipping_status_list_old_to_new( $value, $old_key, $new_key ) {
        if ( 'dokan_shipping_status_setting.shipping_status_list' !== $old_key || 'shipment.shipment-setting-page.shipment-status.shipping_status_list' !== $new_key || is_null( $value ) ) {
            return $value;
        }

        $new_value = [];

        foreach ( (array) $value as $index => $item ) {
            $new_item = [
                'id'    => $item['id'] ?? '',
                'order' => $index,
                'title' => $item['value'] ?? '',
            ];

            // Map must_use → required
            if ( isset( $item['must_use'] ) && $item['must_use'] ) {
                $new_item['required'] = 1;
            }

            $new_value[] = $new_item;
        }

        return $new_value;
    }

    /**
     * Function to map shipping status list from new format to old format
     *
     * @param array $value
     * @param string $old_key
     * @param string $new_key
     *
     * @return array
     */
    public function map_shipping_status_list_new_to_old( $value, $old_key, $new_key ) {
        if ( 'shipment.shipment-setting-page.shipment-status.shipping_status_list' !== $new_key || 'dokan_shipping_status_setting.shipping_status_list' !== $old_key || is_null( $value ) ) {
            return $value;
        }

        $old_value = [];
        foreach ( (array) $value as $item ) {
            $old_item = [
                'id'    => $item['id'] ?? '',
                'value' => $item['title'] ?? '',
            ];

            // required → must_use
            if ( isset( $item['required'] ) && $item['required'] ) {
                $old_item['must_use'] = true;
                $old_item['desc']     = '(This is must use item)';
            }

            $old_value[] = $old_item;
        }

        return $old_value;
    }

    /**
     * Map withdraw methods from old (multiple settings) to new (grouped sections)
     * Old → New direction
     *
     * @since DOKAN_SINCE
     * @param array $result The converted new settings array
     * @param array $legacy_values The source legacy settings array
     * @return array Modified result
     */
    public function map_withdraw_methods_old_to_new( $result, $legacy_values ) {
        $old_withdraw = $legacy_values['dokan_withdraw'] ?? [];
        if ( empty( $old_withdraw ) ) {
            return $result;
        }

        $methods = $old_withdraw['withdraw_methods'] ?? [];
        $charges = $old_withdraw['withdraw_charges'] ?? [];

        $mapping_config = [
            'paypal' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw_charges',
            ],
            'skrill' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_skrill.skrill_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_skrill.skrill_withdraw_charges',
            ],
            'bank'   => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw_charges',
            ],
            'dokan_custom' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.bank_transfer_withdraw_charges',
            ],
            'dokan-paypal-marketplace' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal_marketplace.paypal_marketplace_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal_marketplace.paypal_marketplace_withdraw_charges',
            ],
            'dokan_paystack' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paystack.paystack_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_paystack.paystack_withdraw_charges',
            ],
            'dokan-stripe-connect' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_stripe.stripe_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_stripe.stripe_withdraw_charges',
            ],
            'dokan_razorpay' => [
                'enabled' => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_razorpay.razorpay_withdraw',
                'charge'  => 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_razorpay.razorpay_withdraw_charges',
            ],
        ];

        foreach ( $mapping_config as $method_key => $config ) {
            // Check if method is enabled
            $is_enabled = ! empty( $methods[ $method_key ] ) ? 'on' : 'off';
            SettingsMapper::set_value_by_path( $result, $config['enabled'], $is_enabled );

            // Handle charges
            $method_charges = $charges[ $method_key ] ?? [ 'fixed' => 0, 'percentage' => 0 ];
            SettingsMapper::set_value_by_path( $result, $config['charge'], [
                'additional_fee'   => $method_charges['fixed'] ?? 0,
                'admin_percentage' => $method_charges['percentage'] ?? 0,
            ] );
        }


        // Custom method details
        SettingsMapper::set_value_by_path( $result, 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_method_name', $old_withdraw['withdraw_method_name'] ?? '' );
        SettingsMapper::set_value_by_path( $result, 'transaction.withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_method_type', $old_withdraw['withdraw_method_type'] ?? '' );

        return $result;
    }

    /**
     * Map withdraw methods from new (grouped sections) to old (multiple settings)
     * New → Old direction
     *
     * @since DOKAN_SINCE
     * @param array $result The converted legacy settings array
     * @param array $new_values The source new settings array
     * @return array Modified result
     */
    public function map_withdraw_methods_new_to_old( $result, $new_values ) {
        $withdraw_charge = SettingsMapper::get_value_by_path( $new_values, 'transaction.withdraw_charge.section_withdraw_charge', [] );
        if ( empty( $withdraw_charge ) ) {
            return $result;
        }

        if ( ! isset( $result['dokan_withdraw'] ) ) {
            $result['dokan_withdraw'] = [];
        }

        $old_methods = [];
        $old_charges = [];

        $mapping_config = [
            'paypal' => [
                'enabled_path' => 'withdraw_methods_group_paypal.paypal_withdraw',
                'charge_path'  => 'withdraw_methods_group_paypal.paypal_withdraw_charges',
            ],
            'skrill' => [
                'enabled_path' => 'withdraw_methods_group_skrill.skrill_withdraw',
                'charge_path'  => 'withdraw_methods_group_skrill.skrill_withdraw_charges',
            ],
            'bank'   => [
                'enabled_path' => 'withdraw_methods_group_bank.bank_transfer_withdraw',
                'charge_path'  => 'withdraw_methods_group_bank.bank_transfer_withdraw_charges',
                'old_key'      => 'bank',
            ],
            'dokan_razorpay' => [
                'enabled_path' => 'withdraw_methods_group_razorpay.razorpay_withdraw',
                'charge_path'  => 'withdraw_methods_group_razorpay.razorpay_withdraw_charges',
            ],
            'dokan_custom' => [
                'enabled_path' => 'withdraw_methods_group_custom.custom_withdraw',
                'charge_path'  => 'withdraw_methods_group_custom.bank_transfer_withdraw_charges',
                'old_key'      => 'dokan_custom',
            ],
            'dokan-paypal-marketplace' => [
                'enabled_path' => 'withdraw_methods_group_paypal_marketplace.paypal_marketplace_withdraw',
                'charge_path'  => 'withdraw_methods_group_paypal_marketplace.paypal_marketplace_withdraw_charges',
                'old_key'      => 'dokan-paypal-marketplace',
            ],
            'dokan_paystack' => [
                'enabled_path' => 'withdraw_methods_group_paystack.paystack_withdraw',
                'charge_path'  => 'withdraw_methods_group_paystack.paystack_withdraw_charges',
            ],
            'dokan-stripe-connect' => [
                'enabled_path' => 'withdraw_methods_group_stripe.stripe_withdraw',
                'charge_path'  => 'withdraw_methods_group_stripe.stripe_withdraw_charges',
                'old_key'      => 'dokan-stripe-connect',
            ],
        ];

        foreach ( $mapping_config as $old_key => $config ) {
            $is_enabled = SettingsMapper::get_value_by_path( $withdraw_charge, $config['enabled_path'], 'off' );
            $method_key = $config['old_key'] ?? $old_key;
            $old_methods[ $method_key ] = ( $is_enabled === 'on' ) ? $method_key : '';

            $charge_data = SettingsMapper::get_value_by_path( $withdraw_charge, $config['charge_path'], [] );
            $old_charges[ $method_key ] = [
                'fixed'      => $charge_data['additional_fee'] ?? 0,
                'percentage' => $charge_data['admin_percentage'] ?? 0,
            ];
        }

        $result['dokan_withdraw']['withdraw_methods'] = $old_methods;
        $result['dokan_withdraw']['withdraw_charges'] = $old_charges;
        $result['dokan_withdraw']['withdraw_method_name'] = SettingsMapper::get_value_by_path( $withdraw_charge, 'withdraw_methods_group_custom.custom_method_name', '' );
        $result['dokan_withdraw']['withdraw_method_type'] = SettingsMapper::get_value_by_path( $withdraw_charge, 'withdraw_methods_group_custom.custom_method_type', '' );

        return $result;
    }

    /**
     * Map reverse withdrawal enabled from legacy to new settings.
     *
     * Legacy has two settings:
     * - enabled: 'on'/'off'
     * - payment_gateways: array( 'cod' => 'cod' or '' )
     *
     * New has one setting:
     * - reverse_withdrawal.reverse_withdrawal_section.enabled: 'on'/'off'
     *
     * Logic: if legacy enabled = 'on' AND payment_gateways['cod'] = 'cod' then new enabled = 'on', otherwise 'off'
     *
     * @since DOKAN_SINCE
     *
     * @param array $result The converted new settings array
     * @param array $legacy_values The source legacy settings array
     *
     * @return array Modified result
     */
    public function map_reverse_withdrawal_enabled_old_to_new( $result, $legacy_values ) {
        if ( ! isset( $legacy_values['dokan_reverse_withdrawal'] ) ) {
            return $result;
        }

        $reverse_withdrawal = $legacy_values['dokan_reverse_withdrawal'];
        $enabled            = $reverse_withdrawal['enabled'] ?? 'off';
        $payment_gateways   = $reverse_withdrawal['payment_gateways'] ?? [];

        // Check if enabled is 'on' AND payment_gateways['cod'] is 'cod'
        $cod_enabled = ( $payment_gateways['cod'] ?? '' ) === 'cod';
        $new_enabled = ( $enabled === 'on' && $cod_enabled ) ? 'on' : 'off';

        SettingsMapper::set_value_by_path( $result, 'transaction.reverse_withdrawal.reverse_withdrawal_section.enabled', $new_enabled );

        return $result;
    }

    /**
     * Map reverse withdrawal enabled from new to legacy settings.
     *
     * New has one setting:
     * - transaction.reverse_withdrawal.reverse_withdrawal_section.enabled: 'on'/'off'
     *
     * Legacy has two settings:
     * - dokan_reverse_withdrawal.enabled: 'on'/'off'
     * - dokan_reverse_withdrawal.payment_gateways: array( 'cod' => 'cod' or '' )
     *
     * Logic: if new enabled = 'on' then legacy enabled = 'on' AND payment_gateways['cod'] = 'cod'
     *        if new enabled = 'off' then legacy enabled = 'off' AND payment_gateways['cod'] = ''
     *
     * This function is called per-mapping via dokan_settings_mapper_transform_value_new_to_old hook.
     * It checks if the new_key matches the reverse withdrawal enabled path and old_key is either
     * 'enabled' or 'payment_gateways', then returns the appropriate transformed value.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value       The current value being transformed
     * @param string $old_key     The legacy setting key (e.g., 'dokan_reverse_withdrawal.enabled')
     * @param string $new_key     The new settings dot-path key
     * @param array  $pages_values The source new settings array
     *
     * @return mixed The transformed value
     */
    public function map_reverse_withdrawal_enabled_new_to_old( $value, $old_key, $new_key, $pages_values ) {
        $old_gateway_key = 'dokan_reverse_withdrawal.enabled';
        $old_enabled_key = 'dokan_reverse_withdrawal.payment_gateways';
        $new_data_key    = 'transaction.reverse_withdrawal.reverse_withdrawal_section.enabled';

        // Only handle reverse withdrawal enabled mapping.
        if ( $new_data_key !== $new_key || ( $old_gateway_key !== $old_key && $old_enabled_key !== $old_key ) || is_null( $value ) ) {
            return $value;
        }

        $new_enabled = SettingsMapper::get_value_by_path(
            $pages_values,
            'transaction.reverse_withdrawal.reverse_withdrawal_section.enabled'
        );

        if ( is_null( $new_enabled ) ) {
            return $value;
        }

        $is_enabled = ( 'on' === $new_enabled );

        switch ( $old_key ) {
            case 'dokan_reverse_withdrawal.enabled':
                return $is_enabled ? 'on' : 'off';

            case 'dokan_reverse_withdrawal.payment_gateways':
                return $is_enabled
                    ? [ 'cod' => 'cod' ]
                    : [ 'cod' => '' ];
        }

        return $value;
    }
}
