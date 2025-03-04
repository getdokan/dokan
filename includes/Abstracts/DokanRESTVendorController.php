<?php

namespace WeDevs\Dokan\Abstracts;

/**
 * Vendor REST Controller for Dokan
 *
 * @since 3.14.4
 *
 * @package dokan
 */
abstract class DokanRESTVendorController extends DokanRESTBaseController {

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $rest_base = 'vendor';

    /**
     * Check if user has vendor permission.
     *
     * @since 3.14.4
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }
}
