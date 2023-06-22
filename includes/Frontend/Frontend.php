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
 * @since DOKAN_SINCE
 */
class Frontend {

    use ChainableContainer;

    /**
     * Shortcodes container
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        $this->set_controllers();
    }

    /**
     * Set controllers
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    private function set_controllers() {
        $this->container['become_a_vendor'] = new BecomeAVendor();
    }
}
