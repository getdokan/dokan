<?php

namespace WeDevs\Dokan\REST;

/**
* Admin REST Controller for Dokan
*
* @since 3.14.11
* @package dokan
*/
abstract class DokanBaseAdminController extends DokanBaseController {
    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1/admin';

    /**
     * Check if user has admin permission.
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'manage_woocommerce' );
    }
}
