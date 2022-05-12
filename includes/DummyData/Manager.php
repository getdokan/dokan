<?php

namespace WeDevs\Dokan\DummyData;

/**
 * Include dependencies.
 */
if ( ! class_exists( 'WC_Product_Importer', false ) ) {
    include_once WC_ABSPATH . 'includes/import/abstract-wc-product-importer.php';
}

class Manager extends \WC_Product_Importer {

    /**
     * Process importer.
     *
     * Do not import products with IDs or SKUs that already exist if option
     * update existing is false, and likewise, if updating products, do not
     * process rows which do not exist if an ID/SKU is provided.
     *
     * @return array
     */
    public function import() {}
}
