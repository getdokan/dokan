<?php

namespace WeDevs\Dokan\Abstracts;

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
abstract class DokanRESTAdminController extends DokanRESTBaseController {

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
