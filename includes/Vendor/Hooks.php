<?php

namespace WeDevs\Dokan\Vendor;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.3.2 Added Cache
     *
     * @return void
     */
    public function __construct() {
        // Init Vendor Cache Class
        new VendorCache();

        // init Vendor Settings Manager
        new SettingsApi\Manager();
    }
}
