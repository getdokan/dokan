<?php

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
abstract class Dokan_REST_Admin_Controller extends WP_REST_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1/admin';

    /**
     * Perform permission checking
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function check_permission() {
        return current_user_can( 'manage_options' );
    }

}
