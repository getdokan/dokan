<?php

/**
 * Lists all depricated classes
 */
class Dokan_Depricated_Classes {

    public function __construct() {
        $dir_path = DOKAN_DIR . '/depricated';

        require_once $dir_path . '/class-abstract-class-dokan-background-processes.php';
        require_once $dir_path . '/Singleton.php';
        require_once $dir_path . '/class-dokan-template-dashboard.php';
        require_once $dir_path . '/class-dokan-template-settings.php';
        require_once $dir_path . '/class-dokan-rest-controller.php';
        require_once $dir_path . '/class-dokan-rest-product-controller.php';
        require_once $dir_path . '/class-dokan-rest-store-controller.php';
        require_once $dir_path . '/class-abstrct-dokan-rest-store-controller.php';
    }
}

new Dokan_Depricated_Classes();
