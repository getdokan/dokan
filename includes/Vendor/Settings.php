<?php

namespace WeDevs\Dokan\Vendor;

use WP_Error;
use WP_REST_Request;

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

    public function list_settings() {
        $settings = [
            [
                'id' => 'store',
                'label' => __( 'Store Settings', 'dokan-lite' ),
                'description' => __( 'Vendor Store Settings', 'dokan-lite' ),
                'parent_id' => '',
                'sub_groups' => apply_filters( 'dokan_vendor_settings_store_sub_groups', []  ),
            ],
//            [
//                'id' => 'social',
//                'label' => __( 'Social Settings', 'dokan-lite' ),
//                'description' => __( 'Vendor Social Settings', 'dokan-lite' ),
//                'parent_id' => '',
//                'sub_groups' => apply_filters( 'dokan_vendor_settings_social_sub_groups', []  ),
//            ],
            [
                'id' => 'payment',
                'label' => __( 'Payment Settings', 'dokan-lite' ),
                'description' => __( 'Vendor Payment Settings', 'dokan-lite' ),
                'parent_id' => '',
                'sub_groups' => apply_filters( 'dokan_vendor_settings_payment_sub_groups', []  ),
            ],
        ];

        return array_map(
            [ $this, 'populate_settings_links_value' ],
            apply_filters( 'dokan_vendor_rest_settings_list', $settings )
        );
    }

    /**
     * Vendors settings.
     *
     * @param string $group_id
     *
     * @return array|WP_Error
     */
    public function settings( $group_id ) {

        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( 'payment' == $group_id ) {
            return $this->payments();
        }
        $this->vendor->popluate_store_data();
        $settings = [];

        return array_map(
            [ $this, 'populate_settings_value' ],
            apply_filters( 'dokan_vendor_rest_settings', $settings )
        );
    }

    /**
     * Vendors settings by group and id.
     *
     * @param string $group_id
     * @param string $id
     *
     * @return array|WP_Error
     */
    public function settings_child( $group_id, $id ) {
        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }


        $settings = $this->settings( $group_id );

        $found_id = array_search( $id, array_column( $settings, 'id' ), true );

        if ( false === $found_id ) {
            return new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $settings[ $found_id ];
    }

    /**
     * Vendors payment settings.
     *
     * @return array
     */
    public function payments() {
        $payments = [];

        return array_map(
            [ $this, 'populate_value_and_active_state' ],
            apply_filters( 'dokan_vendor_rest_payment_settings', $payments )
        );
    }

    /**
     * Populate settings link section.
     *
     * @param array $settings
     *
     * @return array
     */
    public function populate_settings_links_value( $settings ) {
        $rest_base = 'settings';
        $namespace = 'dokan/v2';
        $settings['_links'] = [
            'options' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['id'] ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '%s/%s', $namespace, $rest_base ) ),
            ],
            'self' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['id'] ) ),
            ],
        ];

        return $settings;
    }


    /**
     * Populate settings link section.
     *
     * @param array $settings
     *
     * @return array
     */
    public function populate_settings_child_links_value( $settings ) {
        $rest_base = 'settings';
        $namespace = 'dokan/v2';
        $settings['_links'] = [
            'self' => [
                'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '%s/%s/%s', $namespace, $rest_base, $settings['parent_id'] ) ),
            ],
        ];

        return $settings;
    }


    /**
     * Populate value and active state for every payment fields.
     *
     * @param array $settings Single settings field.
     *
     * @return array
     */
    public function populate_settings_value( $settings ) {
        $settings_values = $this->vendor->get_shop_info();

        if (
            isset( $settings_values[ $settings['id'] ] )
            && $settings['type'] !== 'section'
        ) {
            $settings['value'] = $settings_values[ $settings['id'] ];
        } elseif ( isset( $settings_values[ $settings['parent_id'] ] ) ) {
            $settings['value'] = $settings_values[ $settings['parent_id'] ][ $settings['id'] ];
        } else {
            $settings['value'] = null;
        }

        if ( $settings['type'] === 'image' ) {
            $settings['url'] = ! empty( $settings['value'] ) ? wp_get_attachment_url( $settings['value'] ) : false;
        }

        $settings = $this->populate_settings_child_links_value( $settings );
        return $settings;
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

        if ( $payment['parent_id'] === 'payment' ) {
            $payment['active'] = in_array( $payment['id'], $methods, true );
        }

        $payment['value'] = isset( $payment_values[ $payment['parent_id'] ] ) ? $payment_values[ $payment['parent_id'] ] [ $payment['id'] ] : null;

        return $payment;
    }

    /**
     * Save payments settings value.
     *
     * @param array $requests
     *
     * @return array
     */
    public function save_payments( $requests ) {
        foreach ( $requests as $param ) {
            $parameters[ $param['id'] ] = $param['value'];
        }


        foreach ( $parameters as $method => $fields ) {
            foreach ( $fields as $field => $value ) {
                $this->vendor->set_payment_field( $method, $field, $value );
            }
        }
        $this->vendor->save();
//        do_action( 'dokan_update_vendor', $this->vendor->get_id() );
        $this->vendor->popluate_store_data();
        return $this->settings( 'payment' );
    }


    /**
     * Save payments settings value.
     *
     * @param WP_REST_Request $requests
     *
     * @return array|WP_Error
     */
    public function save_settings( $requests ) {
        $group_id = $requests->get_param( 'group_id' );

        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( $group_id === 'payment' ) {
            return $this->save_payments( $requests->get_params() );
        }

        $parameters = [];

        $params =  $requests->get_params();
        unset( $params['group_id'] );

        foreach ( $params as $param ) {
            $parameters[ $param['id'] ] = $param['value'];
        }

        $updated = dokan()->vendor->update( $this->vendor->get_id(), $parameters );

        if ( is_wp_error( $updated ) ) {
            return new WP_Error( $updated->get_error_code(), $updated->get_error_message() );
        }

        $this->vendor->popluate_store_data();

        do_action( 'dokan_rest_store_settings_after_update', $this->vendor, $requests );

        return $this->settings( $group_id );
    }

    /**
     * Save settings child value.
     *
     * @param WP_REST_Request $request
     *
     * @return array|WP_Error
     */
    public function save_settings_child( $request ) {
        $group_id = $request->get_param( 'group_id' );
        $id       = $request->get_param( 'id' );

        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }
        $parameters[ $id ] = $request->get_param( 'value' );

        if ( $group_id === 'payment' ) {
            $payment =  $this->save_payments( [
                [
                    'id' => $id,
                    'value' => $request->get_param( 'value' )
                ]
            ] );
            if ( is_wp_error( $payment ) ) {
                return new WP_Error( $payment->get_error_code(), $payment->get_error_message() );
            }
            return $this->settings_child( $group_id, $id );
        }


        $updated = dokan()->vendor->update( $this->vendor->get_id(), $parameters );


        if ( is_wp_error( $updated ) ) {
            return new WP_Error( $updated->get_error_code(), $updated->get_error_message() );
        }

        $this->vendor->popluate_store_data();
        return $this->settings_child( $group_id, $id );
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
//        $schema = [
//            'store_name'               => [
//                'type'        => 'string',
//                'description' => __( 'Store Name', 'dokan-lite' ),
//                'required'    => true,
//            ],
//            'social'                   => [
//                'type'        => 'object',
//                'description' => __( 'Social Settings', 'dokan-lite' ),
//                'properties'  => [
//                ],
//            ],
//            'phone'                    => [
//                'type'        => 'string',
//                'description' => __( 'Phone Number', 'dokan-lite' ),
//                'required'    => true,
//            ],
//            'show_email'               => [
//                'type'        => 'string',
//                'description' => __( 'Show Email', 'dokan-lite' ),
//                'required'    => true,
//                'enum'        => [ 'yes', 'no' ],
//            ],
//            'address'                  => [
//                'type'        => 'object',
//                'description' => __( 'Address', 'dokan-lite' ),
//                'required'    => false,
//                'properties'  => [
//                    'street_1' => [
//                        'type'     => 'string',
//                        'required' => true,
//                    ],
//                    'street_2' => [
//                        'type'     => 'string',
//                        'required' => false,
//                    ],
//                    'city'     => [
//                        'type'     => 'string',
//                        'required' => true,
//                    ],
//                    'zip'      => [
//                        'type'     => 'string',
//                        'required' => true,
//                    ],
//                    'country'  => [
//                        'type'     => 'string',
//                        'required' => true,
//                    ],
//                    'state'    => [
//                        'type'     => 'string',
//                        'required' => true,
//                    ],
//                ],
//            ],
//            'location'                 => [
//                'type'        => 'string',
//                'description' => __( 'Location', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'banner_id'                => [
//                'type'        => 'integer',
//                'description' => __( 'Store Banner Image ID', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'gravatar_id'              => [
//                'type'        => 'integer',
//                'description' => __( 'Store Profile Image ID', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'store_ppp'                => [
//                'type'        => 'integer',
//                'description' => __( 'Store Product Per Page', 'dokan-lite' ),
//                'required'    => false,
//                'default'     => 20,
//            ],
//            'show_more_ptab'           => [
//                'type'        => 'string',
//                'description' => __( 'Show More Product tab', 'dokan-lite' ),
//                'required'    => false,
//                'enum'        => [ 'yes', 'no' ],
//            ],
//            'enable_tnc'               => [
//                'type'        => 'string',
//                'description' => __( 'Enable Store Terms & Condition', 'dokan-lite' ),
//                'required'    => false,
//                'enum'        => [ 'off', 'on' ],
//            ],
//            'dokan_store_time_enabled' => [
//                'type'        => 'string',
//                'description' => __( 'Enable Store Time', 'dokan-lite' ),
//                'required'    => false,
//                'enum'        => [ 'yes', 'no' ],
//            ],
//            'dokan_store_open_notice'  => [
//                'type'        => 'string',
//                'description' => __( 'Store Open Notice', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'dokan_store_close_notice' => [
//                'type'        => 'string',
//                'description' => __( 'Store Close Notice', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'find_address'             => [
//                'type'        => 'string',
//                'description' => __( 'Find Address', 'dokan-lite' ),
//                'required'    => false,
//            ],
//            'dokan_store_time'         => [
//                'type'        => 'object',
//                'description' => __( 'Store Time', 'dokan-lite' ),
//                'required'    => false,
//                'properties'  => [
//                    'monday'    => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'tuesday'   => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'wednesday' => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'thursday'  => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'friday'    => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'saturday'  => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                    'sunday'    => [
//                        'type'     => 'object',
//                        'required' => true,
//                    ],
//                ],
//            ],
//        ];
        $schema = [
            'type'  => 'array',
            'items' => [
                'type'   => 'object',
                'properties' => [
                    'id' => [
                        'type'        => 'string',
                        'description' => __( 'Settings ID', 'dokan-lite' ),
                        'required'    => true,
                    ],
                    'value' => [
                        'type'        => [ 'string', 'object' ],
                        'description' => __( 'Option value', 'dokan-lite' ),
                        'required'    => true,
                    ],
                ],
            ],
        ];
        return apply_filters( 'dokan_vendor_rest_settings_group_args', $schema );
    }

    /**
     * Save settings validation args schema for saving child settings.
     * for example, see this link
     * https://developer.wordpress.org/rest-api/extending-the-rest-api/schema/
     *
     * @return array
     */
    public function args_schema_for_save_settings_child() {
        $schema = [
            'type'   => 'object',
            'properties' => [
                'value' => [
                    'type'        => [ 'string', 'object' ],
                    'description' => __( 'Option value', 'dokan-lite' ),
                    'required'    => true,
                ],
            ],
        ];
        return apply_filters( 'dokan_vendor_rest_settings_child_args', $schema );
    }
}
