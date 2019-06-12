<?php

defined( 'ABSPATH' ) || exit;

// class Dokan_Cron_Jobs {

//     /**
//      * Register jobs queues
//      *
//      * @since DOKAN_LITE_SINCE
//      *
//      * @return void
//      */
//     public static function register_cron_jobs() {
//         error_log( var_export( 'register corn jobs', true ) );

//         // if ( version_compare( WC_VERSION, '3.5', '<' ) && ! wp_next_scheduled( 'dokan_send_stock_notifications' ) ) {
//         //     wp_schedule_event( time(), 'daily', 'dokan_send_stock_notifications' );
//         // } else {
//         //     WC()->queue()->schedule_recurring( time(), DAY_IN_SECONDS, 'dokan_send_stock_notifications' );
//         // }

//         do_action( 'dokan_register_cron_jobs', __CLASS__ );
//     }
// }