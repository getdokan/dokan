<?php

namespace WeDevs\Dokan\Abstracts;

/**
 * Vendor REST Controller for Dokan
 *
 * @since DOKAN_PRO_SINCE
 *
 * @package dokan
 */
abstract class DokanRESTVendorController extends DokanBaseRESTController {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $base = 'vendor';

    /**
     * Check if user has vendor permission.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
