<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Traits\ChainableContainer;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handle permission related hooks for Orders
 *
 * @since 3.8.0
 */
class Controller {
    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.8.0
     */
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Load required classes
     *
     * @return void
     */
    public function init_classes() {
        $this->container['hooks']          = new Hooks();
        $this->container['misc_hooks']     = new MiscHooks();
        $this->container['email_hooks']    = new EmailHooks();
        $this->container['cache']          = new OrderCache();
        $this->container['frontend_hooks'] = new Frontend\Hooks();

        if ( is_admin() ) {
            $this->container['permission']  = new Admin\Permissions();
            $this->container['admin_hooks'] = new Admin\Hooks();
        }

        if ( wp_doing_ajax() ) {
            new Ajax();
        }
    }
}
