<?php

defined( 'ABSPATH' ) || exit;

class Dokan_Stock_Notifications {
    protected $job;

    public function __construct() {
        if ( ! dokan_is_wc_manage_stock() ) {
            return;
        }

        $this->job = 'dokan_send_stock_notifications';
        $this->maybe_register_corn_jobs();
        $this->hooks();
    }

    /**
     * Maybe register corn jobs
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return boolean
     */
    public function maybe_register_corn_jobs() {
        if ( ! wp_next_scheduled( $this->job ) ) {
            wp_schedule_event( current_time( 'mysql' ), 'daily', $this->job );
        }
    }

    /**
     * Init hooks
     *
     * @since DOKKAN_LITE_SINCE
     *
     * @return void
     */
    protected function hooks() {
        add_action( $this->job, [ $this, 'prepare_data_for_processing' ] );
    }

    /**
     * Prepare data for processing
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function prepare_data_for_processing() {
        $processor_file = DOKAN_INC_DIR . '/background-processes/class-dokan-stock-notifications-background-process.php';

        include_once $processor_file;

        $processor = new Dokan_Stock_Notifications_Background_Process;

        $args = [
            'numbers'    => 0,
            'processing' => 'send_stock_notifications'
        ];

        $processor->push_to_queue( $args )->dispatch_process( $processor_file );
    }
}