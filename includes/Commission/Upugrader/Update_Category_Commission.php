<?php

namespace WeDevs\Dokan\Commission\Upugrader;

use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WP_Term;

class Update_Category_Commission {
    /**
     * The batch size for processing categories
     *
     * @since DOKAN_PRO_SINCE
     */
    const BATCH_SIZE = 20;

    /**
     * The hook name for processing batches
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_BATCH_HOOK = 'process_category_batch';

    /**
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_ITEM_HOOK = 'process_category_item';

    /**
     * Initialize the processor
     */
    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 1 );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_category' ], 10, 1 );
    }

    /**
     * Start the batch processing
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return void
     */
    public function start_processing() {
        // Schedule the first batch with page 1
        $this->schedule_next_batch( 1 );
    }

    /**
     * Process a batch of categories
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Current page number
     *
     * @return void
     */
    public function process_batch( $page_number ) {
        // Get categories for this batch
        $categories = $this->get_categories_batch( $page_number );

        if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
            foreach ( $categories as $category ) {
                $this->schedule_cat_item( $category->term_id );
            }

            // Schedule next batch since we have categories in this batch
            $this->schedule_next_batch( $page_number + 1 );
        }
    }

    /**
     * Schedule the next batch of categories
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Next page number to process
     *
     * @return void
     */
    protected function schedule_next_batch( $page_number ) {
        WC()->queue()->add(
            self::PROCESS_BATCH_HOOK,
            [ $page_number ],
            'dokan_updater_category_processing'
        );
    }

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
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Page number to fetch
     *
     * @return array Array of term objects
     */
    protected function get_categories_batch( $page_number ) {
        $args = [
            'taxonomy'   => 'product_cat',
            'number'     => self::BATCH_SIZE,
            'orderby'    => 'name',
            'order'      => 'ASC',
            'hide_empty' => false,
            'offset'     => ( $page_number - 1 ) * self::BATCH_SIZE,
        ];

        return get_terms( $args );
    }

    /**
     * Process a single category.
     *
     * @since DOKAN_PRO_SINCE
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
                $category_commission_item['percentage'] = 0;
                $category_commission_item['flat'] = $commission;
            } elseif ( Percentage::SOURCE === $commission_type ) {
                $category_commission_item['percentage'] = $commission;
                $category_commission_item['flat'] = 0;
            }

            $category_commission['items'][ $term_id ] = $category_commission_item;
        }

        $dokan_selling['commission_category_based_values'] = $category_commission;
        update_option( 'dokan_selling', $dokan_selling );
    }

    /**
     * Check if processing is currently running.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return bool
     */
    public function is_processing() {
        return WC()->queue()->get_next( self::PROCESS_BATCH_HOOK ) !== null;
    }
}
