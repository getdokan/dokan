<?php

/**
 * Lists all depricated classes
 */
class Dokan_Deprecated_Classes {

    /**
     * Initialize
     */
    public function __construct() {
        $dir_path = DOKAN_DIR . '/deprecated';

        require_once $dir_path . '/class-abstract-class-dokan-background-processes.php';
        require_once $dir_path . '/Singleton.php';
        require_once $dir_path . '/class-dokan-template-dashboard.php';
        require_once $dir_path . '/class-dokan-template-settings.php';
        require_once $dir_path . '/class-dokan-template-products.php';
        require_once $dir_path . '/class-dokan-rest-controller.php';
        require_once $dir_path . '/class-dokan-rest-product-controller.php';
        require_once $dir_path . '/class-dokan-rest-store-controller.php';
        require_once $dir_path . '/class-abstrct-dokan-rest-store-controller.php';
        require_once $dir_path . '/class-dokan-vendor.php';
        require_once $dir_path . '/class-dokan-email.php';
        require_once $dir_path . '/class-dokan-store-location-widget.php';
        require_once $dir_path . '/class-dokan-seller-setup-wizard.php';
        require_once $dir_path . '/class-dokan-withdraw.php';
        require_once $dir_path . '/class-dokan-store-category-walker.php';
    }
}

new Dokan_Deprecated_Classes();
