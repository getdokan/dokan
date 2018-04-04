<?php

/**
 * Vendor Registration
 *
 * @since 2.8
 */
class Dokan_Registration {

    function __construct() {

        /* Register vendor registration shortcode */
        add_shortcode( 'dokan-vendor-registration', array( $this, 'render_shortcode' ) );

        // validate registration
        add_filter( 'woocommerce_process_registration_errors', array( $this, 'validate_registration' ) );
        add_filter( 'woocommerce_registration_errors', array( $this, 'validate_registration' ) );

        // after registration
        add_filter( 'woocommerce_new_customer_data', array( $this, 'set_new_vendor_names' ) );
        add_action( 'woocommerce_created_customer', array( $this, 'save_vendor_info' ), 10, 2 );
    }

    /**
     * Vendor regsitration form shortcode callback
     *
     * @return string
     */
    public function render_shortcode() {

        if ( is_user_logged_in() ) {
            _e( 'You are already logged in', 'dokan-lite' );
            return;
        }

        Dokan_Assets::load_form_validate_script();

        wp_enqueue_script( 'dokan-form-validate' );
        wp_enqueue_script( 'dokan-vendor-registration' );

        ob_start();
        $postdata = wc_clean( $_POST ); // WPCS: CSRF ok, input var ok.

        dokan_get_template_part( 'account/vendor-registration', false, array( 'postdata' => $postdata ) );
        $content = ob_get_clean();

        return apply_filters( 'dokan_vendor_reg_form', $content );
    }

    /**
     * Validate vendor registration
     *
     * @param  \WP_Error $error
     *
     * @return \WP_Error
     */
    function validate_registration( $error ) {
        $allowed_roles = apply_filters( 'dokan_register_user_role', array( 'customer', 'seller' ) );

        // is the role name allowed or user is trying to manipulate?
        if ( isset( $_POST['role'] ) && !in_array( $_POST['role'], $allowed_roles ) ) {
            return new WP_Error( 'role-error', __( 'Cheating, eh?', 'dokan-lite' ) );
        }

        $role = $_POST['role'];

        $required_fields = apply_filters( 'dokan_seller_registration_required_fields', array(
            'fname'    => __( 'Please enter your first name.', 'dokan-lite' ),
            'lname'    => __( 'Please enter your last name.', 'dokan-lite' ),
            'phone'    => __( 'Please enter your phone number.', 'dokan-lite' ),
            'shopname' => __( 'Please provide a shop name.', 'dokan-lite' ),
        ) );

        if ( $role == 'seller' ) {
            foreach ( $required_fields as $field => $msg ) {
                if ( empty( trim( $_POST[$field] ) ) ) {
                    return new WP_Error( "$field-error", $msg );
                }
            }
        }

        return $error;
    }

    /**
     * Inject first and last name to WooCommerce for new vendor registraion
     *
     * @param array $data
     * @return array
     */
    function set_new_vendor_names( $data ) {
        $allowed_roles = array( 'customer', 'seller' );
        $role          = ( isset( $_POST['role'] ) && in_array( $_POST['role'], $allowed_roles ) ) ? $_POST['role'] : 'customer';

        $data['role'] = $role;

        if ( $role != 'seller' ) {
            return $data;
        }

        $data['first_name']    = strip_tags( $_POST['fname'] );
        $data['last_name']     = strip_tags( $_POST['lname'] );
        $data['user_nicename'] = sanitize_user( $_POST['shopurl'] );

        return $data;
    }

    /**
     * Adds default dokan store settings when a new vendor registers
     *
     * @param int $user_id
     * @param array $data
     *
     * @return void
     */
    function save_vendor_info( $user_id, $data ) {
        if ( $data['role'] != 'seller' ) {
            return;
        }

        $dokan_settings = array(
            'store_name'     => strip_tags( $_POST['shopname'] ),
            'social'         => array(),
            'payment'        => array(),
            'phone'          => $_POST['phone'],
            'show_email'     => 'no',
            'location'       => '',
            'find_address'   => '',
            'dokan_category' => '',
            'banner'         => 0,
        );

        update_user_meta( $user_id, 'dokan_profile_settings', $dokan_settings );
        update_user_meta( $user_id, 'dokan_store_name', $dokan_settings['store_name'] );

        do_action( 'dokan_new_seller_created', $user_id, $dokan_settings );
    }
}
