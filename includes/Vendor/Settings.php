<?php

namespace WeDevs\Dokan\Vendor;

class Settings {

    /**
     * @var Vendor
     */
    protected $vendor;

    /**
     * Constructor.
     *
     * @param $vendor
     *
     * @return void
     */
    public function __construct( $vendor = 0 ) {
        if ( empty( $vendor ) ) {
            $vendor = dokan()->vendor->get( get_current_user_id() );
        } else {
            $vendor = dokan()->vendor->get( $vendor );
        }

        $this->vendor = $vendor;
    }

    /**
     * Vendors payment settings.
     *
     * @return array
     */
    public function payments() {
        $payments = [
            'payments' => [
                'id' => 'payments_settings',
                'type' => 'group',
                'title' => __( 'Payment Settings', 'dokan-lite' ),
                'desc' => __( 'Configure your payment settings', 'dokan-lite' ),
                'icon' => 'dashicons-money',
                'parent' => null,
                'active' => null,
                'options' => [],
                'value' => '',
            ],
        ];

        return array_map(
            [ $this, 'populate_value_and_active_state' ],
            apply_filters( 'dokan_vendor_rest_payment_settings', $payments )
        );
    }

    /**
     * Populate value and active state for every payment fields.
     *
     * @param array $payment Single payment gateway.
     *
     * @return array
     */
    public function populate_value_and_active_state( $payment ) {
        $methods        = array_filter( dokan_withdraw_get_active_methods() );
        $payment_values = $this->vendor->get_payment_profiles();

        if ( $payment['parent'] === 'payments_settings' ) {
            $payment['active'] = in_array( $payment['id'], $methods, true );
        }

        $payment['value'] = isset( $payment_values[ $payment['parent'] ] ) ? $payment_values[ $payment['parent'] ] [ $payment['id'] ] : null;

        return $payment;
    }

    /**
     * Save payments settings value.
     *
     * @param $requests
     *
     * @return array
     */
    public function save_payments( $requests ) {
        foreach ( $requests as $method => $fields ) {
            foreach ( $fields as $field => $value ) {
                $this->vendor->set_payment_field( $method, $field, $value );
            }
        }
        $this->vendor->save();
        do_action( 'dokan_update_vendor', $this->vendor->get_id() );
        $this->vendor->popluate_store_data();
        return $this->payments();
    }

    /**
     * Save payment settings validation args schema.
     * for example, see this link
     * https://developer.wordpress.org/rest-api/extending-the-rest-api/schema/
     *
     * @return array
     */
    public function args_schema_for_save_payments() {
        $schema = [
            'paypal' => [
                'type'        => 'object',
                'description' => __( 'PayPal Settings', 'dokan-lite' ),
                'properties'  => [
                    'email' => [
                        'type'     => 'string',
                        'format'   => 'email',
                        'required' => true,
                    ],
                ],
            ],
            'bank' => [
                'type'        => 'object',
                'description' => __( 'Bank Settings', 'dokan-lite' ),
                'properties'  => [
                    'ac_name' => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'ac_number' => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'bank_name' => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'bank_addr' => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                    'routing_number' => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                    'iban' => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                    'swift' => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                ],
            ],
        ];

        return apply_filters( 'dokan_vendor_rest_payment_settings_args', $schema );
    }

    /**
     * Save settings validation args schema.
     * for example, see this link
     * https://developer.wordpress.org/rest-api/extending-the-rest-api/schema/
     *
     * @return array
     */
    public function args_schema_for_save_settings() {
        $schema = [
            'store_name'               => [
                'type'        => 'string',
                'description' => __( 'Store Name', 'dokan-lite' ),
                'required'    => true,
            ],
            'social'                   => [
                'type'        => 'object',
                'description' => __( 'Social Settings', 'dokan-lite' ),
                'properties'  => [
                ],
            ],
            'phone'                    => [
                'type'        => 'string',
                'description' => __( 'Phone Number', 'dokan-lite' ),
                'required'    => true,
            ],
            'show_email'               => [
                'type'        => 'string',
                'description' => __( 'Show Email', 'dokan-lite' ),
                'required'    => true,
                'enum'        => [ 'yes', 'no' ],
            ],
            'address'                  => [
                'type'        => 'object',
                'description' => __( 'Address', 'dokan-lite' ),
                'required'    => false,
                'properties'  => [
                    'street_1' => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'street_2' => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                    'city'     => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'zip'      => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'country'  => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'state'    => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                ],
            ],
            'location'                 => [
                'type'        => 'string',
                'description' => __( 'Location', 'dokan-lite' ),
                'required'    => false,
            ],
            'banner'                   => [
                'type'        => 'integer',
                'description' => __( 'Store Banner Image ID', 'dokan-lite' ),
                'required'    => false,
            ],
            'gravatar'                 => [
                'type'        => 'integer',
                'description' => __( 'Store Profile Image ID', 'dokan-lite' ),
                'required'    => false,
            ],
            'store_ppp'                => [
                'type'        => 'integer',
                'description' => __( 'Store Product Per Page', 'dokan-lite' ),
                'required'    => false,
                'default'     => 20,
            ],
            'show_more_ptab'           => [
                'type'        => 'string',
                'description' => __( 'Show More Product tab', 'dokan-lite' ),
                'required'    => false,
                'enum'        => [ 'yes', 'no' ],
            ],
            'enable_tnc'               => [
                'type'        => 'string',
                'description' => __( 'Enable TnC', 'dokan-lite' ),
                'required'    => false,
                'enum'        => [ 'yes', 'no' ],
            ],
            'dokan_store_time_enabled' => [
                'type'        => 'string',
                'description' => __( 'Enable Store Time', 'dokan-lite' ),
                'required'    => false,
                'enum'        => [ 'yes', 'no' ],
            ],
            'dokan_store_open_notice'  => [
                'type'        => 'string',
                'description' => __( 'Store Open Notice', 'dokan-lite' ),
                'required'    => false,
            ],
            'dokan_store_close_notice' => [
                'type'        => 'string',
                'description' => __( 'Store Close Notice', 'dokan-lite' ),
                'required'    => false,
            ],
            'find_address'             => [
                'type'        => 'string',
                'description' => __( 'Find Address', 'dokan-lite' ),
                'required'    => false,
            ],
            'dokan_store_time'         => [
                'type'        => 'object',
                'description' => __( 'Store Time', 'dokan-lite' ),
                'required'    => false,
                'properties'  => [
                    'monday'    => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'tuesday'   => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'wednesday' => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'thursday'  => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'friday'    => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'saturday'  => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                    'sunday'    => [
                        'type'     => 'object',
                        'required' => true,
                    ],
                ],
            ],
        ];

        return apply_filters( 'dokan_vendor_rest_settings_args', $schema );
    }
}
