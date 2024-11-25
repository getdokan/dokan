<?php

namespace WeDevs\Dokan\Commission\Upugrader;

use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;

class Update_Vendor_Commission {

    /**
     * The hook name for processing batches
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_BATCH_HOOK = 'process_vendor_batch';

    /**
     *
     * @since DOKAN_PRO_SINCE
     */
    const PROCESS_ITEM_HOOK = 'process_vendor_item';

    /**
     * Initialize the processor
     *
     * @since DOKAN_PRO_SINCE
     */
    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 1 );
        add_action( self::PROCESS_ITEM_HOOK, [ $this, 'process_single_vendor' ], 10, 1 );
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
     * Process a batch of vendors
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Current page number
     *
     * @return void
     */
    public function process_batch( $page_number ) {
        // Get vendors for this batch
        $vendors = $this->get_vendors_batch( $page_number );

        if ( ! empty( $vendors ) ) {
            foreach ( $vendors as $vendor ) {
                $this->schedule_item( $vendor->get_id() );
            }

            // Schedule next batch since we have vendors in this batch
            $this->schedule_next_batch( $page_number + 1 );
        }
    }

    /**
     * Schedule the next batch of vendors
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
            'dokan_updater_vendor_processing'
        );
    }

    private function schedule_item( $item ) {
        WC()->queue()->add(
            self::PROCESS_ITEM_HOOK,
            [ $item ],
            'dokan_updater_vendor_item_processing'
        );
    }

    /**
     * Get a batch of vendors
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Page number to fetch
     *
     * @return \WeDevs\Dokan\Vendor\Vendor[] Array of vendor objects
     */
    protected function get_vendors_batch( $page_number ) {
        return dokan()->vendor->all(
            [
				'paged'  => $page_number,
			]
        );
    }

    /**
     * Process a single vendor
     * Customize this method based on what you need to do with each vendor
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param \WeDevs\Dokan\Vendor\Vendor $vendor Vendor object
     *
     * @return void
     */
    public function process_single_vendor( $vendor_id ) {
        $vendor = dokan()->vendor->get( $vendor_id );
        $commission = $vendor->get_commission_settings();

        $commission_type_old = $commission->get_type();
        $commission->set_type( Fixed::SOURCE );

        $percentage = $commission->get_percentage();

        if ( Flat::SOURCE === $commission_type_old ) {
            $commission->set_percentage( 0 );
            $commission->set_flat( $percentage );
        } elseif ( Percentage::SOURCE === $commission_type_old ) {
            $commission->set_percentage( $percentage );
            $commission->set_flat( 0 );
        }

        $vendor->save_commission_settings(
            [
                'type'                 => $commission->get_type(),
                'flat'                 => $commission->get_flat(),
                'percentage'           => $commission->get_percentage(),
                'category_commissions' => $commission->get_category_commissions(),
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
