<?php

namespace WeDevs\Dokan;

use WC_Payment_Gateway;

class WC_Aun_Payment_Gateway extends WC_Payment_Gateway {

    public function __construct() {
        $this->id                 = 'aun-payment'; // Unique ID for your gateway.
        $this->icon               = ''; // URL of the gateway icon.
        $this->has_fields         = false; // True if you need custom credit card form.
        $this->method_title       = 'Aun Gateway';
        $this->method_description = 'Description of my aun payment gateway';

        // Define form fields
        $this->init_form_fields();

        // Load the settings.
        $this->init_settings();
        $this->title       = $this->get_option( 'title' );
        $this->description = $this->get_option( 'description' );

        // Save settings
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    }

    public function process_admin_options() {
        return parent::process_admin_options();
    }


    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'       => 'Enable/Disable',
                'label'       => 'Enable Aun Gateway',
                'type'        => 'checkbox',
                'description' => '',
                'default'     => 'no',
            ),
            'title' => array(
                'title'       => 'Aun Title',
                'type'        => 'text',
                'description' => 'This controls the title which the user sees during checkout. of aun payment gateway',
                'default'     => 'My Aun Payment',
                'desc_tip'    => true,
            ),
            // Add other form fields as needed.
        );
    }

    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );

        // Payment processing logic goes here.

        // Mark as on-hold (we're awaiting the payment)
        $order->update_status( 'on-hold', 'Awaiting payment' );

        // Reduce stock levels
        wc_reduce_stock_levels( $order_id );

        // Remove cart
        WC()->cart->empty_cart();

        // Return thankyou redirect
        return array(
            'result'   => 'success',
            'redirect' => $this->get_return_url( $order ),
        );
    }
}
