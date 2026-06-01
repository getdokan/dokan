<?php

namespace WeDevs\Dokan\StructuredData;

class Manager {

    public function __construct() {
        if ( ! apply_filters( 'dokan_jsonld_enabled', true ) ) {
            return;
        }

        new ProductSchema();
        new VendorStoreSchema();
    }
}
