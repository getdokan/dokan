<?php

namespace WeDevs\Dokan\Abstracts;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // exit if accessed directly
}

/**
 * Product status changer abstract class
 *
 * @since DOKAN_SINCE
 */
abstract class ProductStatusChanger {
    /**
     * Vendor id
     *
     * @since DOKAN_SINCE
     *
     * @var int $vendor_id
     */
    private $vendor_id;

    /**
     * Current page
     *
     * @since DOKAN_SINCE
     *
     * @var int $page
     */
    private $page = 1;

    /**
     * Number of products to process per batch
     *
     * @string DOKAN_SINCE
     *
     * @var int $per_page
     */
    private $per_page = 100;

    /**
     * Task type
     *
     * @string DOKAN_SINCE
     *
     * @var string $task_type change_status|revert
     */
    private $task_type;

    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_product_status_changer_async', [ $this, 'process_background_task' ] );
    }

    /**
     * Set vendor id
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function set_vendor_id( $vendor_id ) {
        $this->vendor_id = $vendor_id;
    }

    /**
     * Set task type
     *
     * @since DOKAN_SINCE
     *
     * @param string $task_type change_status|revert
     *
     * @return void
     */
    public function set_task_type( $task_type ) {
        $task_type       = in_array( $task_type, [ 'change_status', 'revert' ], true ) ? $task_type : 'change_status';
        $this->task_type = $task_type;
    }

    /**
     * Set current page
     *
     * @since DOKAN_SINCE
     *
     * @param int $page
     *
     * @return void
     */
    public function set_page( $page ) {
        $this->page = $page;
    }

    /**
     * Set number of products to process per batch
     *
     * @since DOKAN_SINCE
     *
     * @param int $per_page
     *
     * @return void
     */
    public function set_per_page( $per_page ) {
        $this->per_page = apply_filters( 'dokan_product_status_changer_per_page', $per_page );
    }

    /**
     * Get vendor id
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_vendor_id() {
        return $this->vendor_id;
    }

    /**
     * Get task type
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_task_type() {
        return $this->task_type;
    }

    /**
     * Get current page
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_current_page() {
        return $this->page;
    }

    /**
     * Increment current page
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function increment_current_page() {
        ++$this->page;
    }

    /**
     * Get number of products to process per batch
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_per_page() {
        return $this->per_page;
    }

    /**
     * Reset properties
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function reset() {
        $this->vendor_id = 0;
        $this->page      = 1;
        $this->per_page  = apply_filters( 'dokan_product_status_changer_per_page', 100 );
        $this->task_type = 'change_status';
    }

    /**
     * Get products to process
     *
     * @since DOKAN_SINCE
     *
     * @return int[]
     */
    abstract public function get_products();

    /**
     * Add products to queue
     *
     * @since DOKAN_SINCE
     *
     * @param string      $task_type change_status|revert
     * @param string|null $status
     *
     * @return void
     */
    public function add_to_queue( $task_type = 'change_status', $status = null ) {
        // set task type.
        $this->set_task_type( $task_type );

        while ( $products = $this->get_products() ) { // phpcs:ignore
            // break if no products found.
            if ( empty( $products ) ) {
                break;
            }

            $args = [
                'products'  => $products,
                'task_type' => $task_type,
                'status'    => $status,
            ];
            // add task to queue to process in background.
            WC()->queue()->add( 'dokan_product_status_changer_async', [ $args ] );

            // increment current page.
            $this->increment_current_page();
        }

        do_action( 'dokan_product_status_changer_after_queued', $this );
    }

    /**
     * Process background task
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return void
     */
    public function process_background_task( $args ) {
        if ( ! isset( $args['products'], $args['task_type'] ) ) {
            return;
        }
        foreach ( $args['products'] as $product_id ) {
            switch ( $args['task_type'] ) {
                case 'change_status':
                    $this->change_status( $product_id, $args['status'] );
                    break;
                case 'revert':
                    $this->revert( $product_id );
                    break;
            }
        }
    }

    /**
     * Change product status
     *
     * @since DOKAN_SINCE
     *
     * @param int         $product_id
     * @param string|null $status
     *
     * @return void
     */
    private function change_status( $product_id, $status ) {
        $status = null === $status ? 'pending' : $status;

        // get product object
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }

        // temporary store current status
        $current_status = $product->get_status();
        $product->set_status( $status );

        // store previous product status
        $product->update_meta_data( '_dokan_previous_status', $current_status );

        do_action( 'dokan_product_status_changer_before_save', $product, $status );

        // save product
        $product->save();
    }

    /**
     * Revert product status
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id
     *
     * @return void
     */
    private function revert( $product_id ) {
        // get product object
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }

        // get previous product status
        $previous_status = $product->get_meta( '_dokan_previous_status' );
        if ( ! $previous_status ) {
            // if previous status not found, set product status to publish, this was the old implementation.
            // after this change, we will store previous status in meta, so this is just a fallback.
            $previous_status = 'publish';
        }

        // revert product status
        $product->set_status( $previous_status );

        // delete previous product status
        $product->delete_meta_data( '_dokan_previous_status' );

        // save product
        $product->save();
    }
}
