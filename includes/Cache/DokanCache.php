<?php

namespace WeDevs\Dokan\Cache;

use WeDevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\Order\Cache as OrderCache;
use WeDevs\Dokan\Product\Cache as ProductCache;
use WeDevs\Dokan\Vendor\Cache as VendorCache;
use WeDevs\Dokan\Withdraw\Cache as WithdrawCache;

defined( 'ABSPATH' ) || exit;

/**
 * Cache Initialization class for Dokan.
 *
 * @since DOKAN_LITE_SINCE
 */
class DokanCache {

    use ChainableContainer;

    public function __construct() {
        $this->init_classes();
    }

    /**
     * Initializes all classes for caching independently
     *
     * @since DOKAN_LITE_SINCE
     */
    public function init_classes() {
        $this->container['product']  = new ProductCache();
        $this->container['order']    = new OrderCache();
        $this->container['vendor']   = new VendorCache();
        $this->container['withdraw'] = new WithdrawCache();
    }
}
