<?php

namespace WeDevs\Dokan\StoreProductsSections;

use Wedevs\Dokan\Traits\ChainableContainer;

/**
 * Dokan store products section manager class
 *
 * @since 3.3.6
 */
class Manager {
    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.3.6
     */
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Register all products section classes to chainable container
     *
     * @since 3.3.6
     *
     * @return void
     */
    public function init_classes() {
        $this->container['featured_products']     = new FeaturedProducts();
        $this->container['latest_products']       = new LatestProducts();
        $this->container['best_selling_products'] = new BestSellingProducts();
        $this->container['top_rated_products']    = new TopRatedProducts();
    }
}
