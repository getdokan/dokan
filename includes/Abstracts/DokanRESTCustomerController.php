<?php

namespace WeDevs\Dokan\Abstracts;

/**
 * Customer REST Controller for Dokan
 *
 * @since DOKAN_PRO_SINCE
 *
 * @package dokan
 */
abstract class DokanRESTCustomerController extends DokanRESTBaseController {

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $rest_base = 'customer';

    /**
     * Check if user has customer permission.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return is_user_logged_in();
    }
}
