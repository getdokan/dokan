<?php

namespace WeDevs\Dokan\Vendor\Settings\Schema;

use WC_Countries;

/**
 * Setup wizard store-step flat-array schema.
 *
 * A deliberately separate, single-page sibling of StoreSettingsSchema: the
 * wizard owns a different field set with different gates — most notably the
 * address ALWAYS renders here, while the Store settings page drops it when
 * Pro's delivery-time module takes that section over. Field ids reuse the
 * Store page's (`address`, `store_map`, `show_email`) so ValueMapper's
 * special cases and the React variants apply unchanged.
 *
 * Values persist through WizardStoreSaver — Seam B fires, Seam A stays
 * suppressed (see plugin-internal-tasks#2130).
 *
 * @since DOKAN_SINCE
 */
class SetupWizardSchema {

    /**
     * Build the wizard store-step schema with populated values for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array Flat list of settings elements.
     */
    public static function get_schema( int $vendor_id ): array {
        $info    = (array) dokan_get_store_info( $vendor_id );
        $address = (array) ( $info['address'] ?? [] );

        $elements = [
            [
                'id'          => 'setup_store',
                'type'        => 'page',
                'title'       => __( 'Store', 'dokan-lite' ),
                // On the page (not the section) so the engine renders it under the heading, admin-settings style.
                'description' => __( "The store's details are vital for tax purposes, product pickup, successful delivery, and building customer trust.", 'dokan-lite' ),
            ],
            [
                'id'       => 'store_details',
                'type'     => 'section',
                'page_id'  => 'setup_store',
                // The page heading carries title + description — a headerless section card matches the mock.
                'title'    => '',
                'priority' => 10,
            ],
            [
                'id'              => 'address',
                'type'            => 'field',
                'variant'         => 'vendor_address',
                'section_id'      => 'store_details',
                'priority'        => 10,
                // The wizard mock leads with the country cascade, one field per row; the Store settings page keeps its street-first two-column default.
                'part_order'      => [ 'country', 'state', 'city', 'zip', 'street_1', 'street_2' ],
                'part_columns'    => 1,
                // Badged in the UI like the verification step's methods; validate_address() enforces the same list.
                'required_parts'  => array_keys( self::get_required_address_parts() ),
                'value'           => [
                    'street_1' => (string) ( $address['street_1'] ?? '' ),
                    'street_2' => (string) ( $address['street_2'] ?? '' ),
                    'city'     => (string) ( $address['city'] ?? '' ),
                    'zip'      => (string) ( $address['zip'] ?? '' ),
                    'country'  => (string) ( $address['country'] ?? '' ),
                    'state'    => (string) ( $address['state'] ?? '' ),
                ],
                'default'         => [],
                'legacy_key'      => 'address',
                'validation_func' => [ self::class, 'validate_address' ],
            ],
        ];

        // Same map gate as the legacy wizard view — no provider key, no map field.
        if ( dokan_has_map_api_key() ) {
            $provider = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );
            $api_key  = 'mapbox' === $provider
                ? dokan_get_option( 'mapbox_access_token', 'dokan_appearance', '' )
                : dokan_get_option( 'gmap_api_key', 'dokan_appearance', '' );

            $elements[] = [
                'id'         => 'store_map',
                'type'       => 'field',
                'variant'    => 'vendor_map',
                'section_id' => 'store_details',
                'priority'   => 30,
                'title'      => __( 'Map', 'dokan-lite' ),
                'provider'   => $provider,
                'api_key'    => $api_key,
                'value'      => [
                    'location'     => (string) ( $info['location'] ?? '' ),
                    'find_address' => (string) ( $info['find_address'] ?? '' ),
                ],
                'default'    => [
                    'location'     => '',
                    'find_address' => '',
                ],
            ];
        }

        // Same email-visibility gate as the legacy wizard view.
        if ( ! dokan_is_vendor_info_hidden( 'email' ) ) {
            $elements[] = [
                'id'            => 'show_email',
                'type'          => 'field',
                'variant'       => 'switch',
                'section_id'    => 'store_details',
                'priority'      => 40,
                'title'         => __( 'Show email address in store', 'dokan-lite' ),
                'description'   => __( 'Display your account email on the store page so customers can reach you directly.', 'dokan-lite' ),
                'value'         => ( $info['show_email'] ?? 'no' ) === 'yes' ? 'yes' : 'no',
                'default'       => 'no',
                'legacy_key'    => 'show_email',
                'enable_state'  => [
                    'label' => __( 'Visible', 'dokan-lite' ),
                    'value' => 'yes',
                ],
                'disable_state' => [
                    'label' => __( 'Hidden', 'dokan-lite' ),
                    'value' => 'no',
                ],
            ];
        }

        /**
         * Filter the setup wizard step schemas.
         *
         * Pro injects the fields it renders on the legacy wizard here (e.g.
         * the store-category select as a `non_meta` field carrying a
         * `legacy_post_key`, so its `dokan_seller_wizard_store_field_save`
         * handler keeps reading `$_POST['dokan_store_categories']`; on the
         * payment step it appends gateway configs to the `payment_methods`
         * element).
         *
         * @since DOKAN_SINCE
         *
         * @param array  $elements  Flat schema elements with values.
         * @param int    $vendor_id Vendor user ID.
         * @param string $step      Wizard step the schema belongs to.
         */
        return apply_filters( 'dokan_setup_wizard_schema', $elements, $vendor_id, 'store' );
    }

    /**
     * Build the wizard payment-step schema with populated values for a vendor.
     *
     * One `payment_methods` accordion field carrying gateway configs — Lite
     * describes PayPal and Bank; Pro appends its field-based gateways through
     * the step filter. Values mirror `dokan_profile_settings['payment']`.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return array Flat list of settings elements.
     */
    public static function get_payment_schema( int $vendor_id ): array {
        $info     = (array) dokan_get_store_info( $vendor_id );
        $payment  = (array) ( $info['payment'] ?? [] );
        $active   = array_keys( (array) dokan_withdraw_get_active_methods() );
        $gateways = [];
        $values   = [];

        if ( in_array( 'paypal', $active, true ) ) {
            $gateways[] = [
                'id'     => 'paypal',
                'title'  => dokan_withdraw_get_method_title( 'paypal' ),
                // The admin Withdraw settings icon set — tinted rounded-square logos per the mock.
                'logo'   => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/paypal.svg',
                'fields' => [
                    [
                        'key'         => 'email',
                        'label'       => __( 'PayPal Email', 'dokan-lite' ),
                        'placeholder' => 'abc@email.com',
                    ],
                ],
            ];

            $values['paypal'] = [
                'email' => (string) ( $payment['paypal']['email'] ?? '' ),
            ];
        }

        if ( in_array( 'bank', $active, true ) ) {
            $bank       = (array) ( $payment['bank'] ?? [] );
            $gateways[] = [
                'id'          => 'bank',
                'title'       => dokan_withdraw_get_method_title( 'bank' ),
                // The admin Withdraw settings icon set — tinted rounded-square logos per the mock.
                'logo'        => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/bank-transfer.svg',
                'fields'      => [
                    [
                        'key'         => 'ac_name',
                        'label'       => __( 'Account Holder Name', 'dokan-lite' ),
                        'placeholder' => __( 'Mr. John Doe', 'dokan-lite' ),
                    ],
                    [
                        'key'     => 'ac_type',
                        'label'   => __( 'Account Type', 'dokan-lite' ),
                        'input'   => 'select',
                        'options' => [
                            [
                                'value' => 'personal',
                                'label' => __( 'Personal', 'dokan-lite' ),
                            ],
                            [
                                'value' => 'business',
                                'label' => __( 'Business', 'dokan-lite' ),
                            ],
                        ],
                    ],
                    [
                        'key'         => 'ac_number',
                        'label'       => __( 'Account Number', 'dokan-lite' ),
                        'placeholder' => '12345678',
                    ],
                    [
                        'key'         => 'routing_number',
                        'label'       => __( 'Routing Number', 'dokan-lite' ),
                        'placeholder' => 'BANK1234',
                    ],
                    [
                        'key'         => 'bank_name',
                        'label'       => __( 'Bank Name', 'dokan-lite' ),
                        'placeholder' => __( 'State Bank', 'dokan-lite' ),
                    ],
                    [
                        'key'         => 'bank_addr',
                        'label'       => __( 'Bank Address', 'dokan-lite' ),
                        'input'       => 'textarea',
                        'placeholder' => __( 'State Bank', 'dokan-lite' ),
                    ],
                    [
                        'key'         => 'iban',
                        'label'       => __( 'Bank IBAN', 'dokan-lite' ),
                        'placeholder' => 'IE29',
                    ],
                    [
                        'key'         => 'swift',
                        'label'       => __( 'Swift Code', 'dokan-lite' ),
                        'placeholder' => __( 'Swift Code', 'dokan-lite' ),
                    ],
                ],
                'image'       => DOKAN_PLUGIN_ASSEST . '/images/withdraw-methods/bank-check.png',
                'declaration' => __( 'I attest that I am the owner and have full authorization to this bank account.', 'dokan-lite' ),
                'note'        => __( 'Double-check your account details to avoid withdrawal delays and fees.', 'dokan-lite' ),
            ];

            $bank_value = [];
            foreach ( [ 'ac_name', 'ac_type', 'ac_number', 'routing_number', 'bank_name', 'bank_addr', 'iban', 'swift' ] as $bank_key ) {
                $bank_value[ $bank_key ] = (string) ( $bank[ $bank_key ] ?? '' );
            }

            // Stored as the legacy 'on' string by the dashboard form; the React checkbox reads a bool.
            $bank_value['declaration'] = ! empty( $bank['declaration'] );

            $values['bank'] = $bank_value;
        }

        $elements = [
            [
                'id'          => 'setup_payment',
                'type'        => 'page',
                'title'       => __( 'Payment', 'dokan-lite' ),
                // On the page (not the section) so the engine renders it under the heading, admin-settings style.
                'description' => __( 'Payment is crucial in the setup—customers pay through these methods, while vendors withdraw using those.', 'dokan-lite' ),
            ],
            [
                'id'       => 'payment_section',
                'type'     => 'section',
                'page_id'  => 'setup_payment',
                'title'    => '',
                'priority' => 10,
            ],
            [
                'id'              => 'payment_methods',
                'type'            => 'field',
                'variant'         => 'payment_methods',
                'section_id'      => 'payment_section',
                'priority'        => 10,
                'gateways'        => $gateways,
                'value'           => $values,
                'default'         => [],
                'non_meta'        => true,
                'validation_func' => [ self::class, 'validate_payment_methods' ],
            ],
        ];

        /** This filter is documented in includes/Vendor/Settings/Schema/SetupWizardSchema.php */
        return apply_filters( 'dokan_setup_wizard_schema', $elements, $vendor_id, 'payment' );
    }

    /**
     * Shape-checks the email-based gateways.
     *
     * Nothing on this step is mandatory — payment can be finished later from the
     * dashboard — so a half-filled bank form is accepted and only a malformed
     * value is rejected.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value The sanitized gateway values map.
     *
     * @return string[] Error messages (empty when valid).
     */
    public static function validate_payment_methods( $value ): array {
        $value  = (array) $value;
        $errors = [];

        foreach ( [ 'paypal', 'skrill' ] as $email_gateway ) {
            $email = (string) ( $value[ $email_gateway ]['email'] ?? '' );

            if ( '' !== $email && ! is_email( $email ) ) {
                $errors[] = sprintf(
                    /* translators: %s: payment gateway title */
                    __( 'Please enter a valid %s email address.', 'dokan-lite' ),
                    'paypal' === $email_gateway ? 'PayPal' : 'Skrill'
                );
            }
        }

        return $errors;
    }

    /**
     * The address subfields the wizard requires, mapped to the message each reports when empty.
     *
     * Single source for both the schema's `required_parts` badges and validate_address() below,
     * so the marker a vendor sees and the rule the save enforces can't drift apart.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string> Subfield key => error message.
     */
    protected static function get_required_address_parts(): array {
        return [
            'country'  => __( 'Country is required.', 'dokan-lite' ),
            'state'    => __( 'State is required.', 'dokan-lite' ),
            'city'     => __( 'City is required.', 'dokan-lite' ),
            'zip'      => __( 'Post/ZIP code is required.', 'dokan-lite' ),
            'street_1' => __( 'Street address is required.', 'dokan-lite' ),
        ];
    }

    /**
     * Whether WooCommerce expects a state for a country.
     *
     * A country WooCommerce doesn't list at all still needs one; a country it lists
     * with an empty state set does not.
     *
     * @since DOKAN_SINCE
     *
     * @param string $country Country code.
     *
     * @return bool
     */
    protected static function country_requires_state( string $country ): bool {
        $states = ( new WC_Countries() )->states;

        return ! isset( $states[ $country ] ) || count( (array) $states[ $country ] ) > 0;
    }

    /**
     * Replicates the legacy wizard's address validation: street, city, zip and
     * country are required; state is required exactly when the legacy form
     * demanded it (country listed with states, or country unknown to WC).
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value The sanitized address array.
     *
     * @return string[] Error messages (empty when valid).
     */
    public static function validate_address( $value ): array {
        $value    = (array) $value;
        $required = self::get_required_address_parts();
        $errors   = [];

        foreach ( [ 'street_1', 'city', 'zip' ] as $part ) {
            if ( empty( $value[ $part ] ) ) {
                $errors[] = $required[ $part ];
            }
        }

        $country = (string) ( $value['country'] ?? '' );

        // Without a country the state rule can't be evaluated, so stop here.
        if ( empty( $country ) ) {
            $errors[] = $required['country'];

            return $errors;
        }

        if ( empty( $value['state'] ) && self::country_requires_state( $country ) ) {
            $errors[] = $required['state'];
        }

        return $errors;
    }
}
