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
     * Initialize the processor
     *
     * @since DOKAN_PRO_SINCE
     */
    public function init_hooks() {
        add_action( self::PROCESS_BATCH_HOOK, [ $this, 'process_batch' ], 10, 1 );
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
                $this->process_single_vendor( $vendor );
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
            'vendor_processing'
        );
    }

    /**
     * Get a batch of vendors
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param int $page_number Page number to fetch
     *
     * @return array Array of vendor objects
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
    protected function process_single_vendor( $vendor ) {
        error_log(
            sprintf(
                'Processing vendor #%d: %s',
                $vendor->get_id(),
                $vendor->get_shop_name()
            )
        );

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
