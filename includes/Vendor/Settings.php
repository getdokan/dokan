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

    /**
     * Main Settings list
     *
     * @return array
     */
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
    public function settings_group( $group_id ) {

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
    public function single_settings( $group_id, $id ) {
        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }


        $settings = $this->settings_group( $group_id );

        $found_id = array_search( $id, array_column( $settings, 'id' ), true );

        if ( false === $found_id ) {
            return new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $settings[ $found_id ];
    }

    /**
     * Vendors settings by group and id.
     *
     * @param string $group_id
     * @param string $id
     *
     * @return array|WP_Error
     */
    public function single_settings_field( $group_id, $parent_id, $id ) {
        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $settings = $this->settings_group( $group_id );

        $child_found_id = array_search( $parent_id, array_column( $settings, 'id' ), true );

        if ( false === $child_found_id ) {
            return new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $grandchild_found_id = array_search( $id, array_column( $settings[ $child_found_id ]['fields'], 'id' ), true );

        if ( false === $grandchild_found_id ) {
            return new WP_Error( 'dokan_rest_setting_option_not_found', __( 'Setting Option not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $settings[ $child_found_id ]['fields'][ $grandchild_found_id ];
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
    public function populate_single_settings_links_value( $settings ) {
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
        if ( 'section' === $settings['type'] ) {
            $settings['_links']['options'] = [
                'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
            ];

            foreach ( $settings['fields'] as $key => $field ) {
                $settings['fields'][ $key ]['_links'] = [
                    'self' => [
                        'href' => rest_url( sprintf( '%s/%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'], $field['id'] ) ),
                    ],
                    'collection' => [
                        'href' => rest_url( sprintf( '%s/%s/%s/%s', $namespace, $rest_base, $settings['parent_id'], $settings['id'] ) ),
                    ],
                ];
            }
        }

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

        if ( isset( $settings_values[ $settings['id'] ] ) ) {
            $settings['value'] = $settings_values[ $settings['id'] ];

            if ( 'section' === $settings['type'] ) {
                foreach ( $settings['fields'] as $key => $field ) {
                    $field_value = $settings['value'][ $field['id'] ];
                    $settings['fields'][ $key ]['value'] = $field_value;

                    if ( $field['type'] === 'image' ) {
                        $settings['fields'][ $key ]['url'] = ! empty( $field_value ) ? wp_get_attachment_url( $field_value ) : false;
                    }
                    unset( $field_value );
                }
            }
        } else {
            $settings['value'] = null;
        }

        if ( $settings['type'] === 'image' ) {
            $settings['url'] = ! empty( $settings['value'] ) ? wp_get_attachment_url( $settings['value'] ) : false;
        }

        $settings = $this->populate_single_settings_links_value( $settings );
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

        $payment['value'] = isset( $payment_values[ $payment['id'] ] ) ? $payment_values[ $payment['id'] ] : null;

        foreach ( $payment['fields'] as $key => $field ) {
            $field_value = $payment['value'][ $field['id'] ];
            $payment['fields'][ $key ]['value'] = $field_value;

            if ( $field['type'] === 'image' ) {
                $payment['fields'][ $key ]['url'] = ! empty( $field_value ) ? wp_get_attachment_url( $field_value ) : false;
            }
            unset( $field_value );
        }

        $payment = $this->populate_single_settings_links_value( $payment );

        return $payment;
    }

    /**
     * Save payments settings value.
     *
     * @param array $requests
     *
     * @return array
     */
    public function save_payment_method( $requests ) {
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
        return $this->settings_group( 'payment' );
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
            return $this->save_payment_method( $requests->get_params() );
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

        return $this->settings_group( $group_id );
    }

    /**
     * Save settings child value.
     *
     * @param WP_REST_Request $request
     *
     * @return array|WP_Error
     */
    public function save_single_settings( $request ) {
        $group_id = $request->get_param( 'group_id' );
        $id       = $request->get_param( 'id' );

        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }
        $parameters = [];
        $parameters[ $id ] = $request->get_param( 'value' );

        if ( $group_id === 'payment' ) {
            $payment =  $this->save_payment_method( [
                [
                    'id' => $id,
                    'value' => $request->get_param( 'value' )
                ]
            ] );
            if ( is_wp_error( $payment ) ) {
                return new WP_Error( $payment->get_error_code(), $payment->get_error_message() );
            }
            return $this->single_settings( $group_id, $id );
        }


        $updated = dokan()->vendor->update( $this->vendor->get_id(), $parameters );


        if ( is_wp_error( $updated ) ) {
            return new WP_Error( $updated->get_error_code(), $updated->get_error_message() );
        }

        $this->vendor->popluate_store_data();
        return $this->single_settings( $group_id, $id );
    }

    /**
     * Save settings child value.
     *
     * @param WP_REST_Request $request
     *
     * @return array|WP_Error
     */
    public function save_single_settings_field( $request ) {
        $group_id = $request->get_param( 'group_id' );
        $parent_id = $request->get_param( 'parent_id' );
        $id       = $request->get_param( 'id' );

        $found = array_search( $group_id, array_column( $this->list_settings(), 'id' ), true );

        if ( false === $found ) {
            return new WP_Error( 'dokan_rest_setting_group_not_found', __( 'Setting group not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $parameters = [];
        $previous_single_settings = $this->single_settings( $group_id, $parent_id );
        $previous_single_settings_value = $previous_single_settings['value'];
        $parameters[ $parent_id ] = $previous_single_settings_value;
        $parameters[ $parent_id ][ $id ] = $request->get_param( 'value' );

        $previous_single_settings_value[ $id ] = $request->get_param( 'value' );



        if ( $group_id === 'payment' ) {
            $payment =  $this->save_payment_method( [
                [
                    'id' => $parent_id,
                    'value' => $previous_single_settings_value,
                ]
            ] );
            if ( is_wp_error( $payment ) ) {
                return new WP_Error( $payment->get_error_code(), $payment->get_error_message() );
            }
            return $this->single_settings_field( $group_id, $parent_id, $id );
        }

        $updated = dokan()->vendor->update( $this->vendor->get_id(), $parameters );


        if ( is_wp_error( $updated ) ) {
            return new WP_Error( $updated->get_error_code(), $updated->get_error_message() );
        }

        $this->vendor->popluate_store_data();
        return $this->single_settings_field( $group_id, $parent_id, $id );
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
    public function args_schema_for_save_settings_group() {
        $schema = [
            'type'  => 'array',
            'required' => true,
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
    public function args_schema_for_save_single_settings() {
        $schema = [
            'type'   => 'object',
            'required' => true,
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
