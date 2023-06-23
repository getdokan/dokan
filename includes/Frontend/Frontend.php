<?php

namespace WeDevs\Dokan\Frontend;

use WeDevs\Dokan\Frontend\MyAccount\BecomeAVendor;
use WeDevs\Dokan\Traits\ChainableContainer;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Frontend Manager
 *
 * @since 3.7.21
 */
class Frontend {

    use ChainableContainer;

    /**
     * Shortcodes container
     *
     * @since 3.7.21
     */
    public function __construct() {
        $this->set_controllers();
    }

    /**
     * Set controllers
     *
     * @since 3.7.21
     *
     * @return void
     */
    private function set_controllers() {
        $this->container['become_a_vendor'] = new BecomeAVendor();
    }
}
