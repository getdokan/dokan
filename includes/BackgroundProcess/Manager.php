<?php

namespace WeDevs\Dokan\BackgroundProcess;

defined( 'ABSPATH' ) || exit;

use Wedevs\Dokan\Traits\ChainableContainer;

/**
 * Background Process Manager Class.
 *
 * @since DOKAN_LITE_SINCE
 */
class Manager {

    use ChainableContainer;

    /**
     * Class constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Initialize classes to chainable container.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_classes() {
        $this->container['rewrite_variable_products_author'] = new RewriteVariableProductsAuthor();

        $this->container = apply_filters( 'dokan_background_process_container', $this->container );
    }
}
