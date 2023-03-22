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
 * @since DOKAN_SINCE
 */
class Controller {
    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since DOKAN_PRO_SINCE
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
        $this->container['hooks']       = new Hooks();
        $this->container['misc_hooks']  = new MiscHooks();
        $this->container['email_hooks'] = new EmailHooks();

        if ( is_admin() ) {
            $this->container['permission']  = new Admin\Permissions();
            $this->container['admin_hooks'] = new Admin\Hooks();
        }
    }
}
