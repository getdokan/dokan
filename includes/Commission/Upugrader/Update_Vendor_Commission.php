<?php

namespace WeDevs\Dokan\Commission\Upugrader;

use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;

class Update_Vendor_Commission {
    /**
     * Hook names for processing
     */
    const PROCESS_BATCH_HOOK_CREATOR = 'process_vendor_batch_creator';
    const PROCESS_BATCH_HOOK = 'process_vendor_batch';
    const PROCESS_ITEM_HOOK = 'process_vendor_item';

    /**
     * Batch size
     */
    const BATCH_SIZE = 10;

    /**
     * Initialize the processor
     *
     * @since 3.14.0
     */
    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK_CREATOR, [ $this, 'process_batch_creator' ], 10, 2 );
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 2 );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_vendor' ] );
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
            'dokan_updater_vendor_processing_creator'
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
        $counts      = dokan_get_seller_status_count();
        $total_items = $counts['total'];
        $max_pages   = ceil( $total_items / self::BATCH_SIZE );
        $max_pages = $max_pages + 5;

        for ( $page = 1; $page <= $max_pages; $page++ ) {
            // Schedule the current page for batch processing
            WC()->queue()->add(
                self::PROCESS_BATCH_HOOK,
                [ $page, $max_pages ],
                'dokan_updater_vendor_processing'
            );
        }
    }

    /**
     * Process a batch of vendors
     *
     * @since 3.14.0
     *
     * @param int $page_number Current page number
     * @param int $max_pages   Total number of pages
     *
     * @return void
     */
    public function process_batch( $page_number, $max_pages ) { // phpcs:ignore
        $vendors = $this->get_vendors_batch( $page_number );

        if ( ! empty( $vendors ) ) {
            foreach ( $vendors as $vendor ) {
                $this->schedule_item( $vendor->get_id() );
            }
        }
    }

    /**
     * Get a batch of vendors
     *
     * @since 3.14.0
     *
     * @param int $page_number Page number to fetch
     *
     * @return \WeDevs\Dokan\Vendor\Vendor[] Array of vendor objects
     */
    protected function get_vendors_batch( $page_number ) {
        return dokan()->vendor->all(
            [
				'paged'  => $page_number,
				'number' => self::BATCH_SIZE,
			]
        );
    }

    /**
     * Schedule an individual vendor for processing
     *
     * @since 3.14.0
     *
     * @param int $vendor_id
     *
     * @return void
     */
    private function schedule_item( $vendor_id ) {
        WC()->queue()->add(
            self::PROCESS_ITEM_HOOK,
            [ $vendor_id ],
            'dokan_updater_vendor_item_processing'
        );
    }

    /**
     * Process a single vendor
     *
     * @since 3.14.0
     *
     * @param int $vendor_id Vendor ID
     *
     * @return void
     */
    public function process_single_vendor( $vendor_id ) {
        try {
            $vendor     = dokan()->vendor->get( $vendor_id );
            $commission = $vendor->get_commission_settings();

            $commission_type_old = $commission->get_type();
            $commission->set_type( Fixed::SOURCE );

            $percentage = $commission->get_percentage();

            if ( Flat::SOURCE === $commission_type_old ) {
                $commission->set_percentage( '' );
                $commission->set_flat( $percentage );
            } elseif ( Percentage::SOURCE === $commission_type_old ) {
                $commission->set_percentage( $percentage );
                $commission->set_flat( '' );
            }

            $vendor->save_commission_settings(
                [
					'type'                 => $commission->get_type(),
					'flat'                 => $commission->get_flat(),
					'percentage'           => $commission->get_percentage(),
					'category_commissions' => $commission->get_category_commissions(),
				]
            );

            // Log success
            $this->log_vendor_update( $vendor_id, true );
        } catch ( \Exception $e ) {
            // Log error
            $this->log_vendor_update( $vendor_id, false, $e->getMessage() );
        }
    }

    /**
     * Log vendor update status
     *
     * @since 3.14.0
     *
     * @param int    $vendor_id
     * @param bool   $success
     * @param string $error_message
     *
     * @return void
     */
    private function log_vendor_update( $vendor_id, $success, $error_message = '' ) {
        $log_key = 'dokan_commission_upgrade_vendor_' . $vendor_id;
        update_option(
            $log_key, [
				'status'        => $success ? 'success' : 'error',
				'error_message' => $error_message,
				'timestamp'     => current_time( 'mysql' ),
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
        return WC()->queue()->get_next( self::PROCESS_BATCH_HOOK ) !== null
                || WC()->queue()->get_next( self::PROCESS_ITEM_HOOK ) !== null;
    }
}
