<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WP_Async_Request', false ) ) {
    include_once dirname( WC_PLUGIN_FILE ) . '/includes/libraries/wp-async-request.php';
}

if ( ! class_exists( 'WP_Background_Process', false ) ) {
    include_once dirname( WC_PLUGIN_FILE ) . '/includes/libraries/wp-background-process.php';
}

/**
 * Abstract Dokan_Background_Updater class
 */
abstract class Dokan_Background_Updater extends WP_Background_Process {

    /**
     * Action
     *
     * Override this action in your updater class
     *
     * @since 2.8.6
     *
     * @var string
     */
    protected $action = 'dokan_background_process';

    /**
     * Execute after complete a task
     *
     * @since 2.8.6
     *
     * @return void
     */
    public function complete() {
        $processes = get_option( 'dokan_background_updater_processes', array() );

        if ( array_key_exists( $this->action , $processes ) ) {
            unset( $processes[ $this->action ] );
            update_option( 'dokan_background_updater_processes', $processes, 'no' );
        }

        parent::complete();
    }
}
