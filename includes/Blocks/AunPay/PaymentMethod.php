<?php

namespace WeDevs\Dokan\Blocks\AunPay;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

class PaymentMethod extends AbstractPaymentMethodType {
    /**
     * Payment method name defined by payment methods extending this class.
     *
     * @var string
     */
    protected $name = 'aun-payment';

    public function initialize() {
        $this->settings = get_option('dokan_selling');
    }

    public function is_active() {
        return true;
    }

    /**
     * Returns an array of scripts/handles to be registered for this payment method.
     *
     * @return array
     */
    public function get_payment_method_script_handles() {
        $asset_path   = DOKAN_DIR . '/assets/blocks/aun-payment/aun-payment.asset.php';
        $version      = 1.0;
        $dependencies = [];
        if ( file_exists( $asset_path ) ) {
            $asset        = require $asset_path;
            $version      = is_array( $asset ) && isset( $asset['version'] )
                ? $asset['version']
                : $version;
            $dependencies = is_array( $asset ) && isset( $asset['dependencies'] )
                ? $asset['dependencies']
                : $dependencies;
        }
        wp_register_script(
            'wc-aun-pay-blocks-integration',
            DOKAN_PLUGIN_ASSEST . '/blocks/aun-payment/aun-payment.js',
            $dependencies,
            $version,
            true
        );

        return [ 'wc-aun-pay-blocks-integration' ];
    }

    public function get_payment_method_data() {
        return get_option('dokan_selling');
    }
}
