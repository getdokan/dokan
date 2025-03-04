<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\REST\DokanBaseController;

/**
 * Customer REST Controller for Dokan
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
abstract class DokanBaseCustomerController extends DokanBaseController {

    /**
     * Endpoint base.
     *
     * @var string
     */
    protected $rest_base = 'customer';

    /**
     * Check if user has customer permission.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function check_permission() {
        return is_user_logged_in();
    }
}
