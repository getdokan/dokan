<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WP_Async_Request', false ) ) {
    include_once dirname( WC_PLUGIN_FILE ) . '/includes/libraries/wp-async-request.php';
}

if ( ! class_exists( 'WP_Background_Process', false ) ) {
    include_once dirname( WC_PLUGIN_FILE ) . '/includes/libraries/wp-background-process.php';
}

/**
 * Abstract Dokan_Background_Processes class
 */
abstract class Abstract_Dokan_Background_Processes extends WP_Background_Process {

    /**
     * Action
     *
     * Override this action in your processor class
     *
     * @since 2.8.7
     *
     * @var string
     */
    protected $action = 'dokan_background_processes';

    /**
     * Execute after complete a task
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function complete() {
        $this->clear_process();
        parent::complete();
    }

    /**
     * Schedule cron healthcheck
     *
     * This override method supports cron_interval
     * property in extended child class.
     *
     * @see https://github.com/woocommerce/woocommerce/pull/21353
     *
     * @since 2.8.7
     *
     * @param mixed $schedules Schedules.
     *
     * @return mixed
     */
    public function schedule_cron_healthcheck( $schedules ) {
        if ( version_compare( WC_VERSION, '3.5.0', '>=' ) ) {
            return parent::schedule_cron_healthcheck( $schedules );
        }

        $interval = apply_filters( $this->identifier . '_cron_interval', 5 );

        if ( property_exists( $this, 'cron_interval' ) ) {
            $interval = apply_filters( $this->identifier . '_cron_interval', $this->cron_interval );
        }

        // Adds every 5 minutes to the existing schedules.
        $schedules[ $this->identifier . '_cron_interval' ] = array(
            'interval' => MINUTE_IN_SECONDS * $interval,
            'display'  => sprintf( __( 'Every %d Minutes' ), $interval ),
        );

        return $schedules;
    }

    /**
     * Cancel background process
     *
     * Override method to clear dokan_background_processes option
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function cancel_process() {
        $this->clear_process();
        parent::cancel_process();
    }

    /**
     * Dispatch process
     *
     * Calls save and dispatch and update dokan_background_processes option
     *
     * @since 2.8.7
     *
     * @param string $processor_file
     *
     * @return $this
     */
    public function dispatch_process( $processor_file ) {
        $this->save()->dispatch();

        $processes = get_option( 'dokan_background_processes', array() );
        $processes[ $this->action ] = $processor_file;

        update_option( 'dokan_background_processes', $processes, 'no' );

        return $this;
    }

    /**
     * Clean up dokan_background_processes option
     *
     * @since 2.8.7
     *
     * @return $this
     */
    public function clear_process() {
        $processes = get_option( 'dokan_background_processes', array() );

        if ( array_key_exists( $this->action , $processes ) ) {
            unset( $processes[ $this->action ] );
            update_option( 'dokan_background_processes', $processes, 'no' );
        }

        return $this;
    }
}
