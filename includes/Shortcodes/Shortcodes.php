<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Shortcodes\BestSellingProduct;
use WeDevs\Dokan\Shortcodes\Dashboard;
use WeDevs\Dokan\Shortcodes\MyOrders;
use WeDevs\Dokan\Shortcodes\Stores;
use WeDevs\Dokan\Shortcodes\TopRatedProduct;
use WeDevs\Dokan\Shortcodes\VendorRegistration;

class Shortcodes {

    private $shortcodes = [];

    /**
     *  Register Dokan shortcodes
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        $this->shortcodes = apply_filters( 'dokan_shortcodes', [
            'dokan-dashboard'            => new Dashboard(),
            'dokan-best-selling-product' => new BestSellingProduct(),
            'dokan-top-rated-product'    => new TopRatedProduct(),
            'dokan-my-orders'            => new MyOrders(),
            'dokan-stores'               => new Stores(),
            'dokan-vendor-registration'  => new VendorRegistration(),
        ] );
    }

    /**
     * Get registered shortcode classes
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_shortcodes() {
        return $this->shortcodes;
    }
}
