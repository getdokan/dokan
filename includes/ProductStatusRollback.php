<?php

namespace WeDevs\Dokan;

use RuntimeException;
use Throwable;
use WC_Product;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class to handle product status rollback operations.
 *
 * This class is responsible for processing batch operations to change the status
 * of products from 'reject' to 'draft'. It includes methods to register necessary
 * hooks and to process the batch operation.
 *
 * Use cases:
 * - Automatically change the status of rejected products to draft.
 * - Log the status changes and handle errors during the process.
 * - Schedule the next batch operation if there are more products to process.
 */
class ProductStatusRollback implements Hookable {
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
    private const BATCH_SIZE = 10;

    /**
     * Constructor.
     *
     * @since DOKAN_PRO_SINCE
     */
    public function __construct() {
        $this->register_hooks();
    }

    /**
     * Set up necessary hooks
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_rollback_product_status_reject_to_draft_schedule', array( $this, 'process_reject_operation' ) );
    }

    /**
     * Process reject to draft batch operation
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return void
     */
    public function process_reject_operation(): void {
        global $wpdb;

        try {
            // Get products for this batch
            $products = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT ID FROM $wpdb->posts WHERE post_type = 'product' AND post_status = %s ORDER BY ID LIMIT %d",
                    'reject',
                    self::BATCH_SIZE,
                )
            );

            if ( empty( $products ) ) {
                return;
            }

            $processed = 0;
            foreach ( $products as $product_id ) {
                try {
                    $product = wc_get_product( $product_id );
                    if ( ! $product instanceof WC_Product ) {
                        throw new RuntimeException( 'Invalid product' );
                    }

                    /**
                     * Filter the target status for product rollback
                     *
                     * @since DOKAN_PRO_SINCE
                     *
                     * @param string $target_status Target rollback status
                     * @param WC_Product $product Product
                     */
                    $target_status = apply_filters( 'dokan_product_rollback_status', 'draft', $product );

                    /**
                     * Action before product rollback
                     *
                     * @since DOKAN_PRO_SINCE
                     *
                     * @param WC_Product $product Product
                     * @param string $target_status Target rollback status
                     */
                    do_action( 'dokan_before_product_rollback', $product, $target_status );

                    // Track previous status
                    $product->add_meta_data( '_dokan_previous_status', $product->get_status() );
                    $product->set_status( $target_status );
                    $product->save();

                    /**
                     * Action after product status rollback
                     *
                     * @since DOKAN_PRO_SINCE
                     *
                     * @param WC_Product $product Product
                     * @param string $target_status Target rollback status
                     */
                    do_action( 'dokan_after_product_status_rollback', $product, $target_status );

                    ++ $processed;
                } catch ( Throwable $e ) {
                    dokan_log(
                        sprintf(
                            'Error product status rolling back product #%d: %s',
                            $product_id,
                            $e->getMessage()
                        ),
                        'error'
                    );
                }
            }

            dokan_log( sprintf( 'Processed reject->draft : %d products', $processed ) );

            // Schedule next batch
            WC()->queue()->add( 'dokan_rollback_product_status_reject_to_draft_schedule', array(), self::QUEUE_GROUP );
        } catch ( Throwable $e ) {
            dokan_log(
                sprintf(
                    'Error processing product status reject->draft: %s',
                    $e->getMessage()
                ),
                'error'
            );
        }
    }
}
