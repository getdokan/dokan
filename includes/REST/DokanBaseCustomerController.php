<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\REST\DokanBaseController;

/**
 * Customer REST Controller for Dokan
 *
 * @since 3.14.11
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
     * @since 3.14.11
     *
     * @return bool
     */
    public function check_permission() {
        return is_user_logged_in();
    }
}
