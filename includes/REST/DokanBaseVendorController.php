<?php

namespace WeDevs\Dokan\REST;

/**
 * Vendor REST Controller for Dokan
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
abstract class DokanBaseVendorController extends DokanBaseController {

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $rest_base = 'vendor';

    /**
     * Check if user has vendor permission.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
