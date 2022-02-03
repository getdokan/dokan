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
}
