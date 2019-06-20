<?php

/**
 * Update update store settings
 *
 * @since 2.9.16
 *
 * @return void
 */
function dokan_update_store_settings() {
    $processor_file = DOKAN_INC_DIR . '/upgrades/background-processes/class_dokan_update_2_9_16_store_settings.php';

    include_once $processor_file;

    $processor = new Dokan_Update_2_9_16_Store_Settings();

    $args = array(
        'updating' => 'store_settings',
        'paged'    => 0
    );

    $processor->push_to_queue( $args )->dispatch_process( $processor_file );
}

dokan_update_store_settings();