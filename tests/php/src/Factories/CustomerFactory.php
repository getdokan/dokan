<?php
namespace WeDevs\Dokan\Test\Factories;

use WC_Customer;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Customer;
use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;

class CustomerFactory extends WP_UnitTest_Factory_For_Thing {
    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = array(
            'email' => new WP_UnitTest_Generator_Sequence( 'customer%s@example.com' ),
            'username' => new WP_UnitTest_Generator_Sequence( 'customer%s' ),
            'password' => new WP_UnitTest_Generator_Sequence( 'customer%s' ),
        );
    }

    public function create_object( $args ) {
        add_filter( 'dokan_register_nonce_check', '__return_false' ); // Disable Dokan nonce verification.

        if ( ! isset( $_POST['role'] ) ) { // 'role' is required to pass the Dokan Validation.
            $_POST['role'] = 'customer';
        }

        $customer = $this->create_customer( $args['email'], $args['password'], $args['email'] );

        if ( ! is_wp_error( $customer ) ) {
            return $this->update_object( $customer->get_id(), $args );
        }

        return 0;
    }

    public function update_object( $customer_id, $fields ) {
        $customer = new WC_Customer( $customer_id );

        if ( isset( $fields['email'] ) ) {
            wp_update_user(
                array(
					'ID' => $customer_id,
					'user_email' => $fields['email'],
                )
            );
        }

        if ( isset( $fields['first_name'] ) ) {
            $customer->set_first_name( $fields['first_name'] );
        }

        if ( isset( $fields['last_name'] ) ) {
            $customer->set_last_name( $fields['last_name'] );
        }

        $customer->save();

        return $customer_id;
    }

    public function get_object_by_id( $customer_id ) {
        return new WC_Customer( $customer_id );
    }

    /************ Start of WC Wrapper  ***************/

    /**
     * Create a mock customer for testing purposes.
     *
     * @return WC_Customer
     */
    public function create_mock_customer() {
        return WC_Helper_Customer::create_mock_customer();
    }

    /**
     * Creates a customer in the tests DB.
     */
    public function create_customer( $username = 'testcustomer', $password = 'hunter2', $email = 'test@woo.local' ) {
        return WC_Helper_Customer::create_customer( $username, $password, $email );
    }

    /**
     * Get the expected output for the store's base location settings.
     *
     * @return array
     */
    public function get_expected_store_location() {
        return WC_Helper_Customer::get_expected_store_location();
    }

    /**
     * Get the customer's shipping and billing info from the session.
     *
     * @return array
     */
    public function get_customer_details() {
        return WC_Helper_Customer::get_customer_details();
    }

    /**
     * Get the user's chosen shipping method.
     *
     * @return array
     */
    public function get_chosen_shipping_methods() {
        return WC_Helper_Customer::get_chosen_shipping_methods();
    }

    /**
     * Get the "Tax Based On" WooCommerce option.
     *
     * @return string base or billing
     */
    public function get_tax_based_on() {
        return WC_Helper_Customer::get_tax_based_on();
    }

    /**
     * Set the the current customer's billing details in the session.
     *
     * @param string $default_shipping_method Shipping Method slug.
     */
    public function set_customer_details( $customer_details ) {
        WC_Helper_Customer::set_customer_details( $customer_details );
    }

    /**
     * Set the user's chosen shipping method.
     *
     * @param string $chosen_shipping_method Shipping Method slug.
     */
    public function set_chosen_shipping_methods( $chosen_shipping_methods ) {
        WC_Helper_Customer::set_chosen_shipping_methods( $chosen_shipping_methods );
    }

    /**
     * Set the "Tax Based On" WooCommerce option.
     *
     * @param string $default_shipping_method Shipping Method slug.
     */
    public function set_tax_based_on( $default_shipping_method ) {
        WC_Helper_Customer::set_tax_based_on( $default_shipping_method );
    }
    /************ End of WC Wrapper  ***************/
}
