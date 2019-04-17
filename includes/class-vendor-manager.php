<?php

/**
 * Vendor Manager Class
 *
 * @since 2.6.10
 */
class Dokan_Vendor_Manager {

    /**
     * Total vendors found
     *
     * @var integer
     */
    private $total_users;

    /**
     * Get all vendors
     *
     * @since 2.8.0
     *
     * @param  array  $args
     *
     * @return array
     */
    public function all( $args = array() ) {
        return $this->get_vendors( $args );
    }

    /**
     * Get vendors
     *
     * @param array $args
     *
     * @return array
     */
    public function get_vendors( $args = array() ) {
        $vendors = array();

        $defaults = array(
            'role__in'   => array( 'seller', 'administrator' ),
            'number'     => 10,
            'offset'     => 0,
            'orderby'    => 'registered',
            'order'      => 'ASC',
            'status'     => 'approved',
            'featured'   => '', // yes or no
            'meta_query' => array(),
        );

        $args   = wp_parse_args( $args, $defaults );
        $status = $args['status'];

        // check if the user has permission to see pending vendors
        if ( 'approved' != $args['status'] && current_user_can( 'manage_options' ) ) {
            $status = $args['status'];
        }

        if ( in_array( $status, array( 'approved', 'pending' ) ) ) {
            $operator = ( $status == 'approved' ) ? '=' : '!=';

            $args['meta_query'][] = array(
                'key'     => 'dokan_enable_selling',
                'value'   => 'yes',
                'compare' => $operator
            );
        }

        // if featured
        if ( 'yes' == $args['featured'] ) {
            $args['meta_query'][] = array(
                'key'     => 'dokan_feature_seller',
                'value'   => 'yes',
                'compare' => '='
            );
        }

        unset( $args['status'] );
        unset( $args['featured'] );

        $user_query = new WP_User_Query( $args );
        $results    = $user_query->get_results();

        $this->total_users = $user_query->total_users;

        foreach ( $results as $key => $result ) {
            $vendors[] = $this->get( $result );
        }

        return $vendors;
    }

    /**
     * Get total user according to query
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_total() {
        return $this->total_users;
    }

    /**
     * Get single vendor data
     *
     * @param object|integer $vendor
     *
     * @return object|vednor instance
     */
    public function get( $vendor ) {
        return new Dokan_Vendor( $vendor );
    }

    /**
     * Create a vendor
     *
     * @param array $data
     *
     * @return object
     */
    public function create( $data = [] ) {
        $defaults = [
            'role'       => 'seller',
            'user_login' => '', // dokan_generate_username()
            'user_pass'  => wp_generate_password(),
        ];

        $vendor_data = wp_parse_args( $data, $defaults );
        $vendor_id   = wp_insert_user( $vendor_data );

        if ( is_wp_error( $vendor_id ) ) {
            return $vendor_id;
        }

        // send vendor registration email to admin and vendor
        if ( isset( $data['notify_vendor'] ) && dokan_validate_boolean( $data['notify_vendor' ] ) ) {
            wp_send_new_user_notifications( $vendor_id, 'both' );
        } else {
            wp_send_new_user_notifications( $vendor_id, 'admin' );
        }

        $store_data = apply_filters( 'dokan_vendor_create_data', [
            'store_name'              => ! empty( $data['store_name'] ) ? $data['store_name'] : '',
            'social'                  => ! empty( $data['social'] ) ? $data['social'] : [],
            'payment'                 => ! empty( $data['payment'] ) ? $data['payment'] : [ 'paypal' => [ 'email' ], 'bank' => [] ],
            'phone'                   => ! empty( $data['phone'] ) ? $data['phone'] : '',
            'show_email'              => ! empty( $data['show_email'] ) ? $data['show_email'] : 'no',
            'address'                 => ! empty( $data['address'] ) ? $data['address'] : [],
            'location'                => ! empty( $data['location'] ) ? $data['location'] : '',
            'banner'                  => ! empty( $data['banner'] ) ? $data['banner'] : 0,
            'banner_id'               => ! empty( $data['banner_id'] ) ? $data['banner_id'] : 0,
            'icon'                    => ! empty( $data['icon'] ) ? $data['icon'] : '',
            'gravatar'                => ! empty( $data['gravatar'] ) ? $data['gravatar'] : 0,
            'gravatar_id'             => ! empty( $data['gravatar_id'] ) ? $data['gravatar_id'] : 0,
            'show_more_ptab'          => ! empty( $data['show_more_ptab'] ) ? $data['show_more_ptab'] : 'yes',
            'store_ppp'               => ! empty( $data['store_ppp'] ) ? $data['store_ppp'] : 10,
            'enable_tnc'              => ! empty( $data['enable_tnc'] ) ? $data['enable_tnc'] : 'off',
            'store_tnc'               => ! empty( $data['store_tnc'] ) ? $data['store_tnc'] : '',
            'show_min_order_discount' => ! empty( $data['show_min_order_discount'] ) ? $data['show_min_order_discount'] : 'no',
            'store_seo'               => ! empty( $data['store_seo'] ) ? $data['store_seo'] : [],
            'dokan_store_time'        => ! empty( $data['store_open_close'] ) ? $data['store_open_close'] : []
        ] );

        if ( current_user_can( 'manage_woocommerce' ) ) {
            $vendor = dokan()->vendor->get( $vendor_id );

            if ( isset( $data['enabled'] ) && dokan_validate_boolean( $data['enabled'] ) ) {
                $vendor->update_meta( 'dokan_enable_selling', 'yes' );
            }

            if ( isset( $data['featured'] ) && dokan_validate_boolean( $data['featured'] ) ) {
                $vendor->update_meta( 'dokan_feature_seller', 'yes' );
            }

            if ( isset( $data['trusted'] ) && dokan_validate_boolean( $data['trusted'] ) ) {
                $vendor->update_meta( 'dokan_publishing', 'yes' );
            }
        }

        update_user_meta( $vendor_id, 'dokan_profile_settings', $store_data );

        do_action( 'dokan_new_vendor', $vendor_id );

        return $this->get( $vendor_id );
    }

    /**
     * Update a vendor
     *
     * @param int $vendor_id
     *
     * @param array $data
     *
     * @return object
     */
    public function update( $vendor_id, $data = [] ) {
        $vendor = $this->get( $vendor_id );

        if ( ! $data ) {
            return $vendor;
        }

        // default wp based user data
        if ( ! empty( $data['user_pass'] ) ) {
            wp_update_user(
                array(
                    'ID'        => $vendor->get_id(),
                    'user_pass' => $data['user_pass']
                )
            );
        }

        if ( ! empty( $data['first_name'] ) ) {
            wp_update_user(
                array(
                    'ID'         => $vendor->get_id(),
                    'first_name' => wc_clean( $data['first_name'] )
                )
            );
        }

        if ( ! empty( $data['last_name'] ) ) {
            wp_update_user(
                array(
                    'ID'        => $vendor->get_id(),
                    'last_name' => wc_clean( $data['last_name'] )
                )
            );
        }

        if ( ! empty( $data['user_nicename'] ) ) {
            wp_update_user(
                array(
                    'ID'            => $vendor->get_id(),
                    'user_nicename' => wc_clean( $data['user_nicename'] )
                )
            );
        }

        if ( ! empty( $data['user_email'] ) ) {

            if ( ! is_email( $data['user_email'] ) ) {
                return new WP_Error( 'invalid_email', __( 'Email is not valid', 'dokan-lite' ) );
            }

            wp_update_user(
                array(
                    'ID'         => $vendor->get_id(),
                    'user_email' => sanitize_email( $data['user_email'] ),
                )
            );
        }

        // update vendor other metadata | @todo: move all other metadata to 'dokan_profile_settings' meta
        if ( current_user_can( 'manage_woocommerce' ) ) {
            if ( isset( $data['enabled'] ) && dokan_validate_boolean( $data['enabled'] ) ) {
                $vendor->update_meta( 'dokan_enable_selling', 'yes' );
            } else {
                $vendor->update_meta( 'dokan_enable_selling', 'no' );
            }

            if ( isset( $data['featured'] ) && dokan_validate_boolean( $data['featured'] ) ) {
                $vendor->update_meta( 'dokan_feature_seller', 'yes' );
            } else {
                $vendor->update_meta( 'dokan_feature_seller', 'no' );
            }

            if ( isset( $data['trusted'] ) && dokan_validate_boolean( $data['trusted'] ) ) {
                $vendor->update_meta( 'dokan_publishing', 'yes' );
            } else {
                $vendor->update_meta( 'dokan_publishing', 'no' );
            }

            if ( isset( $data['admin_commission'] ) && is_numeric( $data['admin_commission'] ) ) {
                $vendor->update_meta( 'dokan_admin_percentage', $data['admin_commission'] );
            }

            if ( ! empty( $data['admin_commission_type'] ) ) {
                $vendor->update_meta( 'dokan_admin_percentage_type', $data['admin_commission_type'] );
            }
        }

        // update vendor store data
        if ( ! empty( $data['store_name'] ) ) {
            $vendor->set_store_name( $data['store_name'] );
        }

        if ( ! empty( $data['phone'] ) ) {
            $vendor->set_phone( $data['phone'] );
        }

        if ( isset( $data['show_email'] ) && dokan_validate_boolean( $data['show_email'] ) ) {
            $vendor->set_show_email( 'yes' );
        } else {
            $vendor->set_show_email( 'no' );
        }

        if ( ! empty( $data['gravatar_id'] ) && is_numeric( $data['gravatar_id'] ) ) {
            $vendor->set_gravatar_id( $data['gravatar_id'] );
        }

        if ( ! empty( $data['banner_id'] ) && is_numeric( $data['banner_id'] ) ) {
            $vendor->set_banner_id( $data['banner_id'] );
        }

        if ( isset( $data['enable_tnc'] ) && dokan_validate_boolean( $data['enable_tnc'] ) ) {
            $vendor->set_enable_tnc( 'on' );
        } else {
            $vendor->set_enable_tnc( 'off' );
        }

        if ( ! empty( $data['icon'] ) ) {
            $vendor->set_icon( $data['icon'] );
        }

        if ( ! empty( $data['social'] ) ) {
            $socials = $data['social'];

            foreach ( $socials as $key => $value ) {
                if ( is_callable( [ $vendor, "set_{$key}" ] ) ) {
                    $vendor->{"set_{$key}"}( $value );
                }
            }
        }

        if ( ! empty( $data['payment']['paypal'] ) ) {
            $payments = $data['payment']['paypal'];

            foreach ( $payments as $key => $value ) {
                if ( is_callable( [ $vendor, "set_paypal_{$key}" ] ) ) {
                    $vendor->{"set_paypal_{$key}"}( $value );
                }
            }
        }

        if ( ! empty( $data['payment']['bank'] ) ) {
            $payments = $data['payment']['bank'];

            foreach ( $payments as $key => $value ) {
                if ( is_callable( [ $vendor, "set_bank_{$key}" ] ) ) {
                    $vendor->{"set_bank_{$key}"}( $value );
                }
            }
        }

        if ( ! empty( $data['address'] ) ) {
            $address = $data['address'];

            foreach ( $address as $key => $value ) {
                if ( is_callable( [ $vendor, "set_{$key}" ] ) ) {
                    $vendor->{"set_{$key}"}( $value );
                }
            }
        }

        if ( isset( $data['store_open_close']['enabled'] ) && dokan_validate_boolean( $data['store_open_close']['enabled'] ) ) {
            $vendor->set_store_times_enable( 'yes' );
        } else {
            $vendor->set_store_times_enable( 'no' );
        }

        if ( ! empty( $data['store_open_close']['open_notice'] ) ) {
            $vendor->set_store_times_open_notice( $data['store_open_close']['open_notice'] );
        }

        if ( ! empty( $data['store_open_close']['close_notice'] ) ) {
            $vendor->set_store_times_close_notice( $data['store_open_close']['close_notice'] );
        }

        if ( ! empty( $data['store_open_close']['time'] ) ) {
            $data = $data['store_open_close']['time'];

            if ( is_array( $data ) && is_callable( [ $vendor, 'set_store_times' ] ) ) {
                $vendor->set_store_times( $data );
            }
        }

        do_action( 'dokan_before_update_vendor', $vendor->get_id(), $data );

        $vendor->save();

        do_action( 'dokan_update_vendor', $vendor->get_id() );

        return $vendor->get_id();
    }

    /**
     * Delete vendor with reassign data
     *
     * @since 2.9.11
     *
     * @return array
     */
    public function delete( $vendor_id, $reassign = null ) {
        $vendor = dokan()->vendor->get( $vendor_id )->to_array();

        require_once ABSPATH . 'wp-admin/includes/user.php';
        wp_delete_user( $vendor_id, $reassign );

        return $vendor;
    }

    /**
     * Get all featured Vendor
     *
     * @return object
     */
    public function get_featured( $args = array() ) {

        $defaults = array(
            'number'   => 10,
            'offset'   => 0,
            'featured' => 'yes',
        );

        $args = wp_parse_args( $args, $defaults );

        return $this->get_vendors( $args );
    }
}
