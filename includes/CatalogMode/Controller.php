<?php

namespace WeDevs\Dokan\CatalogMode;

use WeDevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\CatalogMode\Admin\Settings as AdminSettings;
use WeDevs\Dokan\CatalogMode\Dashboard\ProductBulkEdit;
use WeDevs\Dokan\CatalogMode\Dashboard\Products;
use WeDevs\Dokan\CatalogMode\Dashboard\Settings as VendorSettings;

/**
 * Class Controller
 *
 * This class will include all the related files required for Catalog Mode feature and will work as an entry point for
 * all the hooks.
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode
 */
class Controller {

    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.6.4
     *
     * @return void
     */
    public function __construct() {
        $this->set_controllers();
    }

    /**
     * This method will load all the required files
     *
     * @since 3.6.4
     *
     * @return void
     */
    private function set_controllers() {
        // load admin stuff
        $this->container['admin_settings'] = new AdminSettings();
        // load frontend stuff
        if ( ! is_admin() ) {
            $this->container['products']  = new Products();
            $this->container['bulk_edit'] = new ProductBulkEdit();
        }

        // ajax hooks won't work with inline_edit
        $this->container['vendor_settings'] = new VendorSettings();
        $this->container['hooks']           = new Hooks();
    }
}
