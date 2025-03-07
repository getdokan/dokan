<?php

namespace WeDevs\Dokan\Commission\Upugrader;

use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WP_Term;

class Update_Category_Commission {
    /**
     * The batch size for processing categories
     *
     * @since 3.14.0
     */
    const BATCH_SIZE = 20;

    /**
     * The hook name for processing batches
     *
     * @since 3.14.0
     */
    const PROCESS_BATCH_HOOK = 'process_category_batch';
    const PROCESS_BATCH_HOOK_CREATOR = 'process_category_batch_creator';

    /**
     *
     * @since 3.14.0
     */
    const PROCESS_ITEM_HOOK = 'process_category_item';

    /**
     * Initialize the processor
     */
    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK_CREATOR, [ $this, 'process_batch_creator' ] );
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ] );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_category' ] );
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
            'dokan_updater_category_processing_creator'
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
        $total = $this->category_count();

        if ( is_wp_error( $total ) || $total === 0 ) {
            return;
        }

        $total = $total + 50;
        $offset = 0;

        do {
            $this->schedule_next_batch( $offset );

            // Calculate next offset
            $offset = $offset + self::BATCH_SIZE;
        } while ( $offset < $total );
    }

    /**
     * Process a batch of categories
     *
     * @since 3.14.0
     *
     * @param int $page_number Current page number
     *
     * @return void
     */
    public function process_batch( $offset ) {
        // Get categories for this batch
        $categories = $this->get_categories_batch( $offset );

        if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
            foreach ( $categories as $category ) {
                $this->schedule_cat_item( $category->term_id );
            }
        }
    }

    /**
     * Schedule the next batch of categories
     *
     * @since 3.14.0
     *
     * @param int $page_number Next page number to process
     *
     * @return void
     */
    protected function schedule_next_batch( $offset ) {
        WC()->queue()->add(
            self::PROCESS_BATCH_HOOK,
            [ $offset ],
            'dokan_updater_category_processing'
        );
    }

    /**
     * Schedule a category item for processing.
     *
     * @since 3.14.0
     *
     * @param $term
     *
     * @return void
     */
    private function schedule_cat_item( $term ) {
        WC()->queue()->add(
            self::PROCESS_ITEM_HOOK,
            [ $term ],
            'dokan_updater_category_item_processing'
        );
    }

    /**
     * Get a batch of categories.
     *
     * @since 3.14.0
     *
     * @param int $page_number Page number to fetch
     *
     * @return array Array of term objects
     */
    protected function get_categories_batch( $offset ) {
        $args = [
            'taxonomy'   => 'product_cat',
            'number'     => self::BATCH_SIZE,
            'orderby'    => 'name',
            'order'      => 'ASC',
            'hide_empty' => false,
            'offset'     => $offset,
        ];

        return get_terms( $args );
    }

    /**
     * Get the total number of categories
     *
     * @since 3.14.0
     *
     * @return int[]|string|string[]|\WP_Error|\WP_Term[]
     */
    protected function category_count() {
        return get_terms(
            array(
				'taxonomy' => 'product_cat',
				'hide_empty' => false,
				'fields' => 'count',
            )
        );
    }

    /**
     * Process a single category.
     *
     * @since 3.14.0
     *
     * @param int $term Category term object
     *
     * @return void
     */
    public function process_single_category( $term_id ) {
        $dokan_selling       = get_option( 'dokan_selling', [] );
        $category_commission = dokan_get_option( 'commission_category_based_values', 'dokan_selling', [] );

        $commission_type      = get_term_meta( $term_id, 'per_category_admin_commission_type', true );
        $admin_additional_fee = get_term_meta( $term_id, 'per_category_admin_additional_fee', true );
        $commission           = get_term_meta( $term_id, 'per_category_admin_commission', true );

        if ( ! empty( $commission_type ) ) {
            $category_commission_item = [
                'flat'       => $admin_additional_fee,
                'percentage' => $commission,
            ];

            if ( Flat::SOURCE === $commission_type ) {
                $category_commission_item['percentage'] = '';
                $category_commission_item['flat'] = $commission;
            } elseif ( Percentage::SOURCE === $commission_type ) {
                $category_commission_item['percentage'] = $commission;
                $category_commission_item['flat'] = '';
            }

            $category_commission['items'][ $term_id ] = $category_commission_item;
        }

        $dokan_selling['commission_category_based_values'] = $category_commission;
        update_option( 'dokan_selling', $dokan_selling );
    }

    /**
     * Check if processing is currently running.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    public function is_processing() {
        return WC()->queue()->get_next( self::PROCESS_BATCH_HOOK ) !== null;
    }
}
