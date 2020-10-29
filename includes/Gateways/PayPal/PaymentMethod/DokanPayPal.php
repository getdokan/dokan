<?php

namespace WeDevs\Dokan\Gateways\PayPal\PaymentMethod;

use WC_Logger;
use WC_Payment_Gateway;
use WeDevs\Dokan\Gateways\PayPal\Helper;
use WeDevs\Dokan\Gateways\PayPal\Utilities\Processor;

/**
 * Class DokanPayPal
 * @package WeDevs\Dokan\Gateways\PayPal\PaymentMethod
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class DokanPayPal extends WC_Payment_Gateway {

    public $notify_url;

    /**
     * Constructor for the gateway.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function __construct() {
        $this->init_fields();

        // Load the settings.
        $this->init_form_fields();
        $this->init_settings();

        // Logs
        if ( 'yes' === $this->debug ) {
            $this->log = new WC_Logger();
        }

        $this->init_hooks();

        if ( ! $this->is_valid_for_use() ) {
            $this->enabled = false;
        }
    }

    /**
     * Init essential fields
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_fields() {
        $this->id                 = Helper::get_gateway_id();
        $this->icon               = false;
        $this->has_fields         = true;
        $this->method_title       = __( 'Dokan PayPal Marketplace Payments', 'dokan-lite' );
        $this->method_description = __( 'Pay via paypal marketplace payment', 'dokan-lite' );
        $this->icon               = apply_filters( 'woocommerce_paypal_icon', DOKAN_PLUGIN_ASSEST . '/images/paypal-marketplace.png' );

        $title                = $this->get_option( 'title' );
        $this->title          = empty( $title ) ? __( 'PayPal Marketplace Payments', 'dokan-lite' ) : $title;
        $this->test_mode      = $this->get_option( 'test_mode' );
        $this->send_shipping  = $this->get_option( 'send_shipping' );
        $this->single_mode    = $this->get_option( 'single_mode' );
        $this->fees_payer     = $this->get_option( 'fees_payer' );
        $this->app_user       = $this->get_option( 'app_user' );
        $this->app_pass       = $this->get_option( 'app_pass' );
        $this->app_sig        = $this->get_option( 'app_sig' );
        $this->app_id         = $this->get_option( 'app_id' );
        $this->test_app_user  = $this->get_option( 'test_app_user' );
        $this->test_app_pass  = $this->get_option( 'test_app_pass' );
        $this->test_app_sig   = $this->get_option( 'test_app_sig' );
        $this->debug          = $this->get_option( 'debug' );
        $this->pa_admin_email = $this->get_option( 'pa_admin_email' );
        $this->notify_url     = str_replace( 'https:', 'http:', add_query_arg( 'wc-api', 'Dokan_PayPal', home_url( '/' ) ) );
    }

    /**
     * Initialise Gateway Settings Form Fields
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_form_fields() {
        $this->form_fields = [
            'enabled'        => [
                'title'   => __( 'Enable/Disable', 'dokan-lite' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable PayPal Marketplace', 'dokan-lite' ),
                'default' => 'no',
            ],
            'title'          => [
                'title'       => __( 'Title', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'dokan-lite' ),
                'default'     => __( 'PayPal Marketplace', 'dokan-lite' ),
                'desc_tip'    => true,
            ],
            'description'    => [
                'title'       => __( 'Description', 'dokan-lite' ),
                'type'        => 'textarea',
                'description' => __( 'This controls the description which the user sees during checkout.', 'dokan-lite' ),
                'default'     => __( 'Pay via PayPal Marketplace; you can pay with your credit card if you don\'t have a PayPal account', 'dokan-lite' ),
            ],
            'pa_admin_email' => [
                'title'       => __( 'PayPal Email', 'dokan-lite' ),
                'type'        => 'email',
                'description' => __( 'Please enter your PayPal email address; this is needed in order to take payment.', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'you@youremail.com',
            ],
            'test_mode'      => [
                'title'       => __( 'PayPal sandbox', 'dokan-lite' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable PayPal sandbox', 'dokan-lite' ),
                'default'     => 'no',
                'description' => sprintf(
                    __(
                        'PayPal sandbox can be used to test payments. Sign up for a developer account <a href="%s">here</a>.', 'dokan-lite'
                    ),
                    'https://developer.paypal.com/'
                ),
            ],
            'partner_id'     => [
                'title'       => __( 'Partner ID', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'api appID',
            ],
            'app_user'       => [
                'title'       => __( 'API Username', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'username',
            ],
            'app_pass'       => [
                'title'       => __( 'API Password', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'password',
            ],
            'app_sig'        => [
                'title'       => __( 'API Signature', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'signature',
            ],
            'test_app_user'  => [
                'title'       => __( 'Sandbox App Username', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'username',
            ],
            'test_app_pass'  => [
                'title'       => __( 'Sandbox App Password', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'password',
            ],
            'test_app_sig'   => [
                'title'       => __( 'Sandbox App Signature', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'signature',
            ],
            'button_type'    => [
                'title'   => __( 'Payment Button Type', 'dokan-lite' ),
                'type'    => 'select',
                'default' => 'standard',
                'options' => [
                    'standard' => 'Standard Button',
                    'smart'    => 'Smart Payment Buttons',
                ],
            ],
            'ucc_mode'       => [
                'title'   => __( 'Allow Unbranded Credit Card', 'dokan-lite' ),
                'type'    => 'checkbox',
                'label'   => __( 'Allow Unbranded Credit Card', 'dokan-lite' ),
                'default' => 'no',
            ],
            'max_error'      => [
                'title'       => __( 'Error Message', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'This is the error message displayed to a shopper when attempting to add too many vendor items to the cart due to PayPal limitation.', 'dokan-lite' ),
                'default'     => __( 'Cart item quantity total exceeded - item not added to cart. Please checkout to purchase the items in your cart.', 'dokan-lite' ),
                'desc_tip'    => true,
            ],
            'debug'          => [
                'title'       => __( 'Debug Log', 'dokan-lite' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable logging', 'dokan-lite' ),
                'default'     => 'no',
                'description' => sprintf(
                    __( 'Log PayPal events, such as IPN requests, inside <code>woocommerce/logs/paypal-%s.txt</code>', 'dokan-lite' ),
                    sanitize_file_name( wp_hash( 'paypal' ) )
                ),
            ],
        ];
    }

    /**
     * Initialize necessary actions
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_hooks() {
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, [ &$this, 'process_admin_options' ] );
        add_action( 'admin_footer', [ $this, 'admin_script' ] );
        add_filter( 'dokan_paypal_advanced_credit_card_debit_card_supported_countries', [ $this, 'supported_countries' ] );
    }

    /**
     * Check if this gateway is enabled and available in the user's country
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public function is_valid_for_use() {
        $supported_currencies = [
            'AUD',
            'BRL',
            'CAD',
            'MXN',
            'NZD',
            'HKD',
            'SGD',
            'USD',
            'EUR',
            'JPY',
            'TRY',
            'NOK',
            'CZK',
            'DKK',
            'HUF',
            'ILS',
            'MYR',
            'PHP',
            'PLN',
            'SEK',
            'CHF',
            'TWD',
            'THB',
            'GBP',
            'RMB',
            'RUB',
        ];

        if ( ! in_array( get_woocommerce_currency(), apply_filters( 'woocommerce_paypal_supported_currencies', $supported_currencies ), true ) ) {
            return false;
        }

        return true;
    }

    /**
     * Display information in frontend
     * after checkout process button
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function payment_fields() {
        echo $this->get_option( 'description' );

        $payment_fields = apply_filters( 'dokan_paypal_payment_fields', true );

        if ( $payment_fields && Helper::is_ucc_enabled_for_all_seller_in_cart() ) {
            dokan_get_template( 'gateways/paypal/3DS-payment-option.php' );
        }
    }

    /**
     * Process the payment and return the result
     *
     * @param int $order_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function process_payment( $order_id ) {
        $order      = wc_get_order( $order_id );
        $sub_orders = get_children(
            [
                'post_parent' => $order_id,
                'post_type'   => 'shop_order',
            ]
        );

        if ( get_post_meta( $order->get_id(), '_dokan_paypal_order_id', true ) ) {
            return [
                'result'              => 'success',
                'id'                  => $order_id,
                'paypal_redirect_url' => get_post_meta( $order->get_id(), '_dokan_paypal_redirect_url', true ),
                'paypal_order_id'     => get_post_meta( $order->get_id(), '_dokan_paypal_order_id', true ),
                'redirect'            => get_post_meta( $order->get_id(), '_dokan_paypal_redirect_url', true ),
                'success_redirect'    => $order->get_checkout_order_received_url(),
            ];
        }

        $process_payment = apply_filters( 'dokan_paypal_process_payment', $order );

        if ( isset( $process_payment['product_type'] ) && 'product_pack' === $process_payment['product_type'] ) {
            return $process_payment['data'];
        }

        $purchase_units = [];

        if ( $order->get_meta( 'has_sub_order' ) ) {
            foreach ( $sub_orders as $item ) {
                $sub_order        = wc_get_order( $item->ID );
                $purchase_units[] = $this->make_purchase_unit_data( $sub_order );
            }
        } else {
            $purchase_units[] = $this->make_purchase_unit_data( $order );
        }

        $create_order_data = [
            'intent'              => 'CAPTURE',
            'application_context' => [
                'return_url'  => $order->get_checkout_order_received_url(),
                'cancel_url'  => $order->get_cancel_order_url(),
                'brand_name'  => 'DOKAN',
                'user_action' => 'PAY_NOW',
            ],
            'purchase_units'      => $purchase_units,
        ];

        $processor        = Processor::init();
        $create_order_url = $processor->create_order( $create_order_data );

        if ( is_wp_error( $create_order_url ) ) {
            wc_add_wp_error_notices( $create_order_url );
            Helper::log_paypal_error( $order->get_id(), $create_order_url, 'create_order' );

            return [
                'result'   => 'error',
                'redirect' => $order->get_checkout_order_received_url(),
            ];
        }
        //store paypal debug id & create order id
        update_post_meta( $order->get_id(), '_dokan_paypal_create_order_debug_id', $create_order_url['paypal_debug_id'] );
        update_post_meta( $order->get_id(), '_dokan_paypal_order_id', $create_order_url['id'] );
        update_post_meta( $order->get_id(), '_dokan_paypal_redirect_url', $create_order_url['links'][1]['href'] );

        return [
            'result'              => 'success',
            'id'                  => $order_id,
            'paypal_redirect_url' => $create_order_url['links'][1]['href'],
            'paypal_order_id'     => $create_order_url['id'],
            'redirect'            => $create_order_url['links'][1]['href'],
            'success_redirect'    => $order->get_checkout_order_received_url(),
        ];
    }

    /**
     * Get the state to send to paypal
     *
     * @param string $cc
     * @param string $state
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_paypal_state( $cc, $state ) {
        if ( 'US' === $cc ) {
            return $state;
        }

        $states = WC()->countries->get_states( $cc );

        if ( isset( $states[ $state ] ) ) {
            return $states[ $state ];
        }

        return $state;
    }

    /**
     * Add to log file if debug enabled
     *
     * @param string $message
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function add_log( $message ) {
        if ( 'yes' === $this->debug ) {
            $this->log->add( 'dokan-paypal-marketplace', $message );
        }
    }

    /**
     * Admin script
     *
     * @since DOKAN_SINCE_LITE
     *
     * @return void
     */
    public function admin_script() {
        ?>
        <script type="text/javascript">
            ;(function ($) {
                var inputToggle = function (val) {
                    let payment_id_prefix = 'woocommerce_<?php echo $this->id; ?>_';

                    let settings_input_ids = [
                        'app_user',
                        'app_pass',
                        'app_sig'
                    ];

                    if (val) {
                        settings_input_ids.map(function (id) {
                            $('#' + payment_id_prefix + 'test_' + id).closest('tr').show();
                            $('#' + payment_id_prefix + id).closest('tr').hide();
                        });
                    } else {
                        settings_input_ids.map(function (id) {
                            $('#' + payment_id_prefix + id).closest('tr').show();
                            $('#' + payment_id_prefix + 'test_' + id).closest('tr').hide();
                        });
                    }
                };

                let payment_id_prefix = 'woocommerce_<?php echo $this->id; ?>_';
                let test_mode = $(`#${payment_id_prefix}test_mode`);

                inputToggle(test_mode.val());

                test_mode.on('change', function () {
                    inputToggle(this.checked);
                });

            })(jQuery);
        </script>
        <?php
    }

    /**
     * Make purchase unit data
     *
     * @param \WC_Order $order
     *
     * @return array
     */
    public function make_purchase_unit_data( \WC_Order $order ) {
        $tax_total    = $this->get_tax_amount( $order );
        $total_amount = $order->get_subtotal() + $tax_total + (float) $order->get_shipping_total();
        $total_amount = wc_format_decimal( $total_amount, 2 );

        $seller_id     = dokan_get_seller_id_by_order( $order->get_id() );
        $merchant_id   = get_user_meta( $seller_id, '_dokan_paypal_marketplace_merchant_id', true );
        $platform_fee  = wc_format_decimal( dokan()->commission->get_earning_by_order( $order, 'admin' ), 2 );
        $product_items = $this->get_product_items( $order );

        $purchase_units = [
            'reference_id'        => $order->get_order_key(),
            'amount'              => [
                'currency_code' => 'USD',
                'value'         => $total_amount,
                'breakdown'     => [
                    'item_total'        => [
                        'currency_code' => 'USD',
                        'value'         => wc_format_decimal( $order->get_subtotal(), 2 ),
                    ],
                    'tax_total'         => [
                        'currency_code' => 'USD',
                        'value'         => $tax_total,
                    ],
                    'shipping'          => [
                        'currency_code' => 'USD',
                        'value'         => wc_format_decimal( $order->get_shipping_total(), 2 ),
                    ],
                    'handling'          => [
                        'currency_code' => 'USD',
                        'value'         => '0.00',
                    ],
                    'shipping_discount' => [
                        'currency_code' => 'USD',
                        'value'         => '0.00',
                    ],
                    'insurance'         => [
                        'currency_code' => 'USD',
                        'value'         => '0.00',
                    ],
                ],
            ],
            'payee'               => [
                'merchant_id' => $merchant_id,
            ],
            'items'               => $product_items,
            'shipping'            => $this->get_shipping_address( $order ),
            'payment_instruction' => [
                'disbursement_mode' => 'INSTANT',
                'platform_fees'     => [
                    [
                        'amount' => [
                            'currency_code' => 'USD',
                            'value'         => $platform_fee,
                        ],
                    ],
                ],
            ],
            'invoice_id'          => $order->get_parent_id() ? $order->get_parent_id() : $order->get_id(),
            'custom_id'           => $order->get_id(),
        ];

        return $purchase_units;
    }

    /**
     * Get shipping address as paypal format
     *
     * @param $order
     *
     * @return array
     */
    public function get_shipping_address( \WC_Order $order ) {
        $address = [
            'address' => [
                'name'           => [
                    'given_name' => $order->get_billing_first_name(),
                    'surname'    => $order->get_billing_last_name(),
                ],
                'address_line_1' => $order->get_billing_address_1(),
                'address_line_2' => $order->get_billing_address_2(),
                'admin_area_2'   => $order->get_billing_city(),
                'admin_area_1'   => $order->get_billing_state(),
                'postal_code'    => $order->get_billing_postcode(),
                'country_code'   => $order->get_billing_country(),
            ],
        ];

        return $address;
    }

    /**
     * Get product items as PayPal format
     *
     * @param $order
     *
     * @return array
     */
    public function get_product_items( \WC_Order $order ) {
        $items = [];

        foreach ( $order->get_items( 'line_item' ) as $key => $line_item ) {
            $product  = wc_get_product( $line_item->get_product_id() );
            $category = $product->is_downloadable() || $product->is_virtual() ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS';

            $items[] = [
                'name'        => $line_item->get_name(),
                'sku'         => $product->get_sku(),
                'category'    => $category,
                'unit_amount' => [
                    'currency_code' => 'USD',
                    'value'         => $line_item->get_total(),
                ],
                'quantity'    => $line_item->get_quantity(),
            ];
        }

        return $items;
    }

    /**
     * Get tax amount
     *
     * @param $order
     *
     * @return int
     */
    public function get_tax_amount( \WC_Order $order ) {
        $tax_amount = 0;
        foreach ( $order->get_taxes() as $tax ) {
            $tax_amount += $tax['tax_total'] + $tax['shipping_tax_total'];
        }

        return wc_format_decimal( $tax_amount, 2 );
    }

    /**
     * Admin options with extra information
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function admin_options() {
        dokan_get_template( 'gateways/paypal/admin-options.php' );

        parent::admin_options();
    }

    /**
     * Currently supported countries
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function supported_countries() {
        $supported_countries = [
            'US' => 'United States',
            'AU' => 'Australia',
            'GB' => 'UK',
            'FR' => 'France',
            'IT' => 'Italy',
            'ES' => 'Spain',
        ];

        return $supported_countries;
    }

    /**
     * Process admin options
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool|void
     */
    public function process_admin_options() {
        parent::process_admin_options();

        update_user_meta( dokan_get_current_user_id(), '_dokan_paypal_marketplace_merchant_id', $this->get_option( 'partner_id' ) );
        update_user_meta( dokan_get_current_user_id(), '_dokan_paypal_enable_for_receive_payment', true );
    }

    /**
     * Check if this payment method is available with conditions
     * This payment method is only available if the 2 scenario passed which is mentioned below
     *
     * eg 1: if there is multi-vendor in a cart and one vendor is able to receive payment and another vendor is not,
     * we will show the payment method in Checkout
     *
     * eg 2: if there is multi-vendor/single-vendor in a cart and both cannot receive payment via paypal,
     * then the payment method will not show in Checkout
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public function is_available() {
        $is_available = parent::is_available();

        if ( is_admin() ) {
            return $is_available;
        }

        if ( ! $is_available ) {
            return false;
        }

        $total_seller_count                      = 0;
        $seller_is_able_to_receive_payment_count = 0;

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['data']->get_id();
            $seller_id  = get_post_field( 'post_author', $product_id );
            $total_seller_count ++;

            if ( Helper::is_seller_enable_for_receive_payment( $seller_id ) ) {
                $seller_is_able_to_receive_payment_count ++;
            }
        }

        //allow if seller is able to receive payment in a cart is less than or equal to total seller
        if ( $seller_is_able_to_receive_payment_count && $seller_is_able_to_receive_payment_count <= $total_seller_count ) {
            return true;
        }

        return false;
    }
}

