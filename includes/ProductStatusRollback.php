<?php

namespace WeDevs\Dokan;

use Exception;
use Throwable;
use WC_Product;
use WC_Queue_Interface;

class ProductStatusRollback {
    /**
     * Queue group identifier
     *
     * @var string
     */
    private const QUEUE_GROUP = 'dokan-product-status-rollback';

    /**
     * Batch size for processing
     *
     * @var int
     */
    private const BATCH_SIZE = 20;

    /**
     * Constructor.
     *
     * @since DOKAN_PRO_SINCE
     */
    public function __construct() {
        $this->setup_hooks();
    }

    /**
     * Set up necessary hooks
     *
     * @return void
     * @since DOKAN_PRO_SINCE
     *
     */
    private function setup_hooks(): void {
        add_action( 'dokan_rollback_product_status_draft_to_reject_schedule', [ $this, 'process_batch_draft_operation' ], 10, 2 );
        add_action( 'dokan_rollback_product_status_reject_to_draft_schedule', [ $this, 'process_batch_reject_operation' ], 10, 2 );
    }

    /**
     * Process draft to reject batch operation
     *
     * @param int $batch Current batch number
     * @param int $total_batches Total number of batches
     *
     * @return void
     * @since DOKAN_PRO_SINCE
     *
     */
    public function process_batch_draft_operation( int $batch, int $total_batches ): void {
        global $wpdb;

        try {
            $queue = WC()->queue();
            if ( ! $queue instanceof WC_Queue_Interface ) {
                throw new Exception( 'WooCommerce queue not available' );
            }

            // Get draft products with previous rejection status
            $products = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT p.ID
                    FROM $wpdb->posts p
                    INNER JOIN $wpdb->postmeta pm ON p.ID = pm.post_id
                    WHERE p.post_type = 'product'
                    AND p.post_status = %s
                    AND pm.meta_key = %s
                    ORDER BY p.ID
                    LIMIT %d OFFSET %d",
                    'draft',
                    '_dokan_previous_status',
                    self::BATCH_SIZE,
                    ( $batch - 1 ) * self::BATCH_SIZE
                )
            );

            if ( empty( $products ) ) {
                return;
            }

            $processed = 0;
            foreach ( $products as $product_id ) {
                if ( $this->rollback_product( $product_id, 'reject' ) ) {
                    ++ $processed;
                }
            }

            dokan_log(
                sprintf(
                    'Processed draft->reject batch %d/%d: %d products',
                    $batch,
                    $total_batches,
                    $processed
                )
            );

            // Schedule next batch if needed
            if ( $batch < $total_batches ) {
                $queue->add(
                    'dokan_rollback_product_status_draft_to_reject_schedule',
                    [
                        'batch'         => $batch + 1,
                        'total_batches' => $total_batches,
                    ],
                    self::QUEUE_GROUP
                );
            }
        } catch ( Throwable $e ) {
            dokan_log(
                sprintf(
                    'Error processing draft->reject batch %d: %s',
                    $batch,
                    $e->getMessage()
                ),
                'error'
            );
        }
    }

    /**
     * Process reject to draft batch operation
     *
     * @param int $batch
     * @param int $total_batches
     *
     * @return void
     * @since DOKAN_PRO_SINCE
     *
     */
    public function process_batch_reject_operation( int $batch, int $total_batches ): void {
        try {
            $queue = WC()->queue();
            if ( ! $queue instanceof WC_Queue_Interface ) {
                throw new Exception( 'WooCommerce queue not available' );
            }

            // Get products for this batch
            $products = $this->get_products_batch( 'reject', $batch );
            if ( empty( $products ) ) {
                return;
            }

            $processed = 0;
            foreach ( $products as $product_id ) {
                if ( $this->rollback_product( $product_id, 'draft' ) ) {
                    ++ $processed;
                }
            }

            dokan_log(
                sprintf(
                    'Processed reject->draft batch %d/%d: %d products',
                    $batch,
                    $total_batches,
                    $processed
                )
            );

            // Schedule next batch if needed
            if ( $batch < $total_batches ) {
                $queue->add(
                    'dokan_rollback_product_status_reject_to_draft_schedule',
                    [
                        'batch'         => $batch + 1,
                        'total_batches' => $total_batches,
                    ],
                    self::QUEUE_GROUP
                );
            }
        } catch ( Throwable $e ) {
            dokan_log(
                sprintf(
                    'Error processing reject->draft batch %d: %s',
                    $batch,
                    $e->getMessage()
                ),
                'error'
            );
        }
    }

    /**
     * Get batch of products
     *
     * @param string $status Current status to query
     * @param int $batch Batch number
     *
     * @return array
     */
    private function get_products_batch( string $status, int $batch ): array {
        global $wpdb;

        $offset = ( $batch - 1 ) * self::BATCH_SIZE;

        return $wpdb->get_col(
            $wpdb->prepare(
                "SELECT ID FROM $wpdb->posts
                WHERE post_type = 'product'
                AND post_status = %s
                ORDER BY ID
                LIMIT %d OFFSET %d",
                $status,
                self::BATCH_SIZE,
                $offset
            )
        );
    }

    /**
     * Rollback a single product's status
     *
     * @param int $product_id
     * @param string $target_status
     *
     * @return bool
     */
    private function rollback_product( int $product_id, string $target_status ): bool {
        try {
            $product = wc_get_product( $product_id );
            if ( ! $product instanceof WC_Product ) {
                throw new Exception( 'Invalid product' );
            }

            /**
             * Filter the target status for product rollback
             *
             * @since DOKAN_PRO_SINCE
             *
             * @param string $target_status Target status
             * @param WC_Product $product Product object
             */
            $target_status = apply_filters( 'dokan_product_rollback_status', $target_status, $product );

            /**
             * Action before product rollback
             *
             * @since DOKAN_PRO_SINCE
             *
             * @param WC_Product $product Product object
             * @param string $target_status Target status
             */
            do_action( 'dokan_before_product_rollback', $product, $target_status );

            // Track previous status
            $product->add_meta_data( '_dokan_previous_status', $product->get_status(), true );
            $product->save_meta_data();

            $product->set_status( $target_status );
            $product->save();

            /**
             * Action after product status rollback
             *
             * @since DOKAN_PRO_SINCE
             *
             * @param WC_Product $product Product object
             * @param string $target_status Target status
             */
            do_action( 'dokan_after_product_status_rollback', $product, $target_status );

            return true;
        } catch ( Throwable $e ) {
            dokan_log(
                sprintf(
                    'Error rolling back product #%d: %s',
                    $product_id,
                    $e->getMessage()
                ),
                'error'
            );

            return false;
        }
    }

}
