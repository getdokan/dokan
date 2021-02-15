<?php

namespace WeDevs\Dokan\Gateways;

use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Class Manager
 * @package WeDevs\Dokan\Gateways
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class Manager {

    use ChainableContainer;

    /**
     * @var string
     */
    private static $class_name;

    /**
     * Manager constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->container['paypal_marketplace'] = new PayPal\Manager();
    }

    /**
     * Set payment gateway
     *
     * @param $class_name
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public static function set_gateway( $class_name ) {
        self::$class_name = $class_name;

        add_filter( 'woocommerce_payment_gateways', [ self::class, 'register_gateway' ] );
    }

    /**
     * Register Payment gateway
     *
     * @param $gateways
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function register_gateway( $gateways ) {
        $gateways[] = self::$class_name;

        return $gateways;
    }
}
