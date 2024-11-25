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
     * @since DOKAN_PRO_SINCE
     */
    const BATCH_SIZE = 10;

    /**
     * The hook name for processing batches
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_BATCH_HOOK = 'process_product_batch';

    /**
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_ITEM_HOOK = 'process_product_item';

    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 2 );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_product' ], 10, 1 );
    }

    /**
     * Start the batch processing
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return void
     */
    public function start_processing() {
        // Get total number of products
        $total_products = $this->get_total_products();

        if ( $total_products === 0 ) {
            return;
        }

        // Schedule the first batch
        $this->schedule_next_batch( 0, $total_products );
    }

    /**
     * Process a batch of products
     *
     * @since DOKAN_PRO_SINCE
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

        // Calculate next offset
        $next_offset = $offset + self::BATCH_SIZE;

        // If there are more products to process, schedule the next batch
        if ( $next_offset < $total_products ) {
            $this->schedule_next_batch( $next_offset, $total_products );
        }
    }

    /**
     * Schedule the next batch of products
     *
     * @since DOKAN_PRO_SINCE
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
     * @since DOKAN_PRO_SINCE
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
     * @since DOKAN_PRO_SINCE
     *
     * @return int
     */
    protected function get_total_products() {
        $args = [
            'status' => 'publish',
            'limit' => -1,
            'return' => 'ids',
        ];

        $products = wc_get_products( $args );
        return count( $products );
    }

    /**
     * Process a single product
     * Customize this method based on what you need to do with each product
     *
     * @since DOKAN_PRO_SINCE
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
            $commission->set_percentage( 0 );
        } elseif ( Percentage::SOURCE === $commission_type_old ) {
            $commission->set_flat( 0 );
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
     * @since DOKAN_PRO_SINCE
     *
     * @return bool
     */
    public function is_processing() {
        return WC()->queue()->get_next( self::PROCESS_BATCH_HOOK ) !== null;
    }
}
