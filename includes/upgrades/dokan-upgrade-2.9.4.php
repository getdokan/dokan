<?php

/**
 * Update post_author id for shop_orders
 *
 * @since 2.9.4
 *
 * @return void
 */
function dokan_update_shop_order_post_author() {
    $processor_file = DOKAN_INC_DIR . '/upgrades/background-processes/class_dokan_update_2_9_4_order_post_author.php';

    include_once $processor_file;

    $processor = new Dokan_Update_2_9_4_Order_Post_Author();

    $args = array(
        'updating' => 'shop_order_post_author',
        'paged'    => 0
    );

    $processor->push_to_queue( $args )->dispatch_process( $processor_file );
}

dokan_update_shop_order_post_author();

/**
 * Update refund table structure
 *
 * @return void
 */
function dokan_update_refund_table_2_9_4() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'dokan_refund';

    if ( $wpdb->get_var( $wpdb->prepare("SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
        return;
    }

    $columns = array( 'item_qtys', 'item_totals', 'item_tax_totals' );

      foreach ( $columns as $column ) {
        $wpdb->query(
            $wpdb->prepare(
                "ALTER TABLE `{$wpdb->prefix}dokan_refund`
                MODIFY COLUMN %s varchar(200)", $column
            )
        );
    }
}

dokan_update_refund_table_2_9_4();
