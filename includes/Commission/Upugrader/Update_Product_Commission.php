<?php

namespace WeDevs\Dokan\Commission\Upugrader;

use WC_Product;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;

class Update_Product_Commission {

    /**
     * The batch size for processing products
     *
     * @since 3.14.0
     */
    const BATCH_SIZE = 10;

    /**
     * The hook name for processing batches
     *
     * @since 3.14.0
     */
    const PROCESS_BATCH_HOOK = 'process_product_batch';
    const PROCESS_BATCH_HOOK_CREATOR = 'process_product_batch_creator';

    /**
     *
     * @since 3.14.0
     */
    const PROCESS_ITEM_HOOK = 'process_product_item';

    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK_CREATOR, [ $this, 'process_batch_creator' ] );
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 2 );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_product' ] );
    }

    /**
     * Start the batch processing
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function start_processing() {
        WC()->queue()->add(
            self::PROCESS_BATCH_HOOK_CREATOR,
            [],
            'dokan_updater_product_processing_creator'
        );
    }

    /**
     * Batch queue creator.
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function process_batch_creator() {
        // Get total number of products
        $total_products = $this->get_total_products();
        $total_products = $total_products + 50;

        if ( $total_products === 0 ) {
            return;
        }

        $offset = 0;

        do {
            $this->schedule_next_batch( $offset, $total_products );

            // Calculate next offset
            $offset = $offset + self::BATCH_SIZE;
        } while ( $offset < $total_products );
    }

    /**
     * Process a batch of products
     *
     * @since 3.14.0
     *
     * @param int $offset Current offset
     * @param int $total_products Total number of products
     *
     * @return void
     */
    public function process_batch( $offset, $total_products ) {
        // Get products for this batch
        $products = $this->get_products_batch( $offset );

        foreach ( $products as $product ) {
            $this->schedule_item( $product->get_id() );
        }
    }

    /**
     * Schedule the next batch of products
     *
     * @since 3.14.0
     *
     * @param int $offset Current offset
     * @param int $total_products Total number of products
     *
     * @return void
     */
    protected function schedule_next_batch( $offset, $total_products ) {
        WC()->queue()->add(
            self::PROCESS_BATCH_HOOK, [
				$offset,
				$total_products,
			],
            'dokan_updater_product_processing'
        );
    }

    /**
     * Schedule a single product for processing.
     *
     * @since 3.14.0
     *
     * @param $item
     *
     * @return void
     */
    private function schedule_item( $item ) {
        WC()->queue()->add(
            self::PROCESS_ITEM_HOOK,
            [ $item ],
            'dokan_updater_product_item_processing'
        );
    }

    /**
     * Get a batch of products
     *
     * @since 3.14.0
     *
     * @param int $offset Current offset
     *
     * @return WC_Product[] Array of product objects
     */
    protected function get_products_batch( $offset ) {
        $args = [
            'status' => 'publish',
            'limit' => self::BATCH_SIZE,
            'offset' => $offset,
            'orderby' => 'ID',
            'order' => 'ASC',
        ];

        return wc_get_products( $args );
    }

    /**
     * Get total number of products
     *
     * @since 3.14.0
     *
     * @return int
     */
    protected function get_total_products() {
        $args = [
            'status' => 'any',
            'limit'  => -1,
            'return' => 'ids',
        ];

        $products = wc_get_products( $args );

        return count( $products );
    }

    /**
     * Process a single product
     * Customize this method based on what you need to do with each product
     *
     * @since 3.14.0
     *
     * @param int $product
     *
     * @return void
     */
    public function process_single_product( $product_id ) {
        $commission = dokan()->product->get_commission_settings( $product_id );

        $commission_type_old = $commission->get_type();

        $commission->set_type( Fixed::SOURCE );

        if ( Flat::SOURCE === $commission_type_old ) {
            $commission->set_flat( $commission->get_percentage() );
            $commission->set_percentage( '' );
        } elseif ( Percentage::SOURCE === $commission_type_old ) {
            $commission->set_flat( '' );
        }

        dokan()->product->save_commission_settings(
            $product_id,
            [
                'type'       => $commission->get_type(),
                'percentage' => $commission->get_percentage(),
                'flat'       => $commission->get_flat(),
            ]
        );
    }

    /**
     * Check if processing is currently running
     *
     * @since 3.14.0
     *
     * @return bool
     */
    public function is_processing() {
        return WC()->queue()->get_next( self::PROCESS_BATCH_HOOK ) !== null;
    }
}
