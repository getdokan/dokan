<?php
/**
 * Add new table for vendor-balance
 *
 * @since 2.8.3
 *
 * @return void
 */
function create_vendor_balance_table_283() {
    $processes = get_option( 'dokan_background_processes', array() );

    if ( empty( $processes['dokan_update_2_8_3_vendor_balance'] ) ) {
        $updater_file = DOKAN_INC_DIR . '/upgrades/background-processes/class_dokan_update_2_8_3_vendor_balance.php';

        include_once $updater_file;

        $processor = new dokan_update_2_8_3_vendor_balance();

        $payload = array(
            'updating' => 'vendor_balance_table',
        );

        $processor->push_to_queue( $payload );
        $processor->save()->dispatch();

        $processes['dokan_update_2_8_3_vendor_balance'] = $updater_file;

        update_option( 'dokan_background_processes', $processes, 'no' );
    }
}

create_vendor_balance_table_283();
