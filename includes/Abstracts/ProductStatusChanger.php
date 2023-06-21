<?php

namespace WeDevs\Dokan\Abstracts;

use WeDevs\Dokan\Product\ProductCache;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // exit if accessed directly
}

/**
 * Product status changer abstract class
 *
 * @since 3.7.18
 */
abstract class ProductStatusChanger {
    /**
     * Vendor id
     *
     * @since 3.7.18
     *
     * @var int $vendor_id
     */
    private $vendor_id;

    /**
     * Current page
     *
     * @since 3.7.18
     *
     * @var int $page
     */
    private $page = 1;

    /**
     * Number of products to process per batch
     *
     * @string 3.7.18
     *
     * @var int $per_page
     */
    private $per_page = 100;

    /**
     * Task type
     *
     * @string 3.7.18
     *
     * @var string $task_type change_status|revert
     */
    private $task_type;

    /**
     * Class constructor
     *
     * @since 3.7.18
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_product_status_changer_async', [ $this, 'process_background_task' ] );
        add_action( 'dokan_clear_product_cache_async', [ $this, 'clear_product_cache' ] );
    }

    /**
     * Set vendor id
     *
     * @since 3.7.18
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
     * @since 3.7.18
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
     * @since 3.7.18
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
     * @since 3.7.18
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
     * @since 3.7.18
     *
     * @return int
     */
    public function get_vendor_id() {
        return $this->vendor_id;
    }

    /**
     * Get task type
     *
     * @since 3.7.18
     *
     * @return string
     */
    public function get_task_type() {
        return $this->task_type;
    }

    /**
     * Get current page
     *
     * @since 3.7.18
     *
     * @return int
     */
    public function get_current_page() {
        return $this->page;
    }

    /**
     * Increment current page
     *
     * @since 3.7.18
     *
     * @return void
     */
    protected function increment_current_page() {
        ++$this->page;
    }

    /**
     * Get number of products to process per batch
     *
     * @since 3.7.18
     *
     * @return int
     */
    public function get_per_page() {
        return $this->per_page;
    }

    /**
     * Reset properties
     *
     * @since 3.7.18
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
     * @since 3.7.18
     *
     * @return int[]
     */
    abstract public function get_products();

    /**
     * Add products to queue
     *
     * @since 3.7.18
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
                $args = [
                    'vendor_id' => $this->get_vendor_id(),
                ];
                // clear product cache.
                WC()->queue()->add( 'dokan_clear_product_cache_async', [ $args ] );
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
     * @since 3.7.18
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
     * Clear product cache
     *
     * @since 3.7.18
     *
     * @param string[] $args
     *
     * @return void
     */
    public function clear_product_cache( $args ) {
        if ( ! isset( $args['vendor_id'] ) ) {
            return;
        }

        ProductCache::delete( $args['vendor_id'] );
    }

    /**
     * Change product status
     *
     * @since 3.7.18
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

        // return if current_status is same as new status
        if ( $current_status === $status ) {
            return;
        }

        // set new product status
        $product->set_status( $status );

        // store previous product status
        $product->update_meta_data( '_dokan_previous_status', $current_status );

        do_action( 'dokan_product_change_status_before_save', $product, $status );

        // save product
        $product->save();

        do_action( 'dokan_product_change_status_after_save', $product, $status );
    }

    /**
     * Revert product status
     *
     * @since 3.7.18
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
            // if previous status not found, return from here.
            // for the first time, previous status will not be found. Admin need to manually change status first.
            return;
        }

        // revert product status
        $product->set_status( $previous_status );

        // delete previous product status
        $product->delete_meta_data( '_dokan_previous_status' );

        do_action( 'dokan_product_status_revert_before_save', $product, $previous_status );

        // save product
        $product->save();

        do_action( 'dokan_product_status_revert_after_save', $product, $previous_status );
    }
}
