<?php

defined( 'ABSPATH' ) || exit;

class Dokan_Stock_Notifications {
    /**
     * Cron job action
     *
     * @var string
     */
    protected $job;

    /**
     * Constructor method
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        if ( ! dokan_is_wc_manage_stock() ) {
            return;
        }

        $this->job = 'dokan_send_stock_notifications';
        $this->maybe_register_cron_jobs();
        $this->hooks();
    }

    /**
     * Maybe register cron jobs
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function maybe_register_cron_jobs() {
        if ( ! wp_next_scheduled( $this->job ) ) {
            wp_schedule_event( strtotime( current_time( 'mysql' ) ), 'daily', $this->job );
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
        add_action( 'woocommerce_before_product_object_save', [ $this, 'make_product_outofstock' ] );
        add_action( $this->job, [ $this, 'prepare_data_for_processing' ] );
    }

    /**
     * Override out of stock treshhold
     *
     * @param WC_Product $product
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function make_product_outofstock( $product ) {
        $vendor_id = dokan_get_current_user_id();
        $vendor    = dokan()->vendor->get( $vendor_id );

        if ( ! $vendor instanceof Dokan_Vendor ) {
            return;
        }

        if ( $product->get_stock_quantity() <= $vendor->get_out_of_stock_threshold() && 'no' === $product->get_backorders() ) {
            $product->set_stock_status( 'outofstock' );
        }
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