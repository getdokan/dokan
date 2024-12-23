<?php

namespace WeDevs\Dokan;

use RuntimeException;
use Throwable;
use WC_Product;

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
    private function register_hooks(): void {
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
                     * @param string $target_status Target status
                     * @param WC_Product $product Product object
                     */
                    $target_status = apply_filters( 'dokan_product_rollback_status', 'draft', $product );

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

                    ++$processed;
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

            // Register next schedule if needed
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
