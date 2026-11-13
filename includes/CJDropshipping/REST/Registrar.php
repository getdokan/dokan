<?php

namespace WeDevs\Dokan\CJDropshipping\REST;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Adds the CJ Dropshipping REST controllers to Dokan's REST manager.
 *
 * @since DOKAN_SINCE
 */
class Registrar implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_rest_api_class_map', [ $this, 'add_controllers' ] );
    }

    /**
     * Add the CJ controllers.
     *
     * @since DOKAN_SINCE
     *
     * @param array $class_map File => class.
     *
     * @return array
     */
    public function add_controllers( $class_map ): array {
        $class_map                 = (array) $class_map;
        $dir                       = DOKAN_DIR . '/includes/CJDropshipping/REST/';
        $class_map[ $dir . 'AdminController.php' ] = AdminController::class;
        $class_map[ $dir . 'VendorController.php' ] = VendorController::class;

        return $class_map;
    }
}
