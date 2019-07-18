<?php
/**
 * Add new table for vendor-balance
 *
 * @since 2.8.3
 *
 * @return void
 */
function create_vendor_balance_table_283() {
    $processor_file = DOKAN_INC_DIR . '/upgrades/background-processes/class_dokan_update_2_8_3_vendor_balance.php';

    include_once $processor_file;

    $processor = new Dokan_Update_2_8_3_Vendor_Balance();

    $args = array(
        'updating' => 'vendor_balance_table',
    );

    $processor->push_to_queue( $args )->dispatch_process( $processor_file );
}

create_vendor_balance_table_283();
