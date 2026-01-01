<?php

/**
 * Intercept the email report download link to rename the file and send custom link.
 *
 * @param int    $user_id     User ID that requested the email.
 * @param string $export_id   Unique ID for report.
 * @param string $report_type Report type.
 *
 * @return void
 */
function dokan_intercept_email_report_download_link( $user_id, $export_id, $report_type ) {
    if ( 'withdraws' !== $report_type ) { return; }

    remove_action( 'woocommerce_admin_email_report_download_link', array( 'Automattic\WooCommerce\Admin\ReportExporter', 'do_action_or_reschedule' ), 10 );

    if ( ! $filename = get_transient( 'dokan_export_filename_' . $export_id ) ) { return; }

    $upload_dir     = Automattic\WooCommerce\Admin\ReportCSVExporter::get_reports_directory();
    $email_filename = $filename . '-email';
    $source_path    = $upload_dir . 'wc-withdraws-report-export-' . $export_id . '.csv';
    $email_path     = $upload_dir . $email_filename . '.csv';

    if ( file_exists( $source_path ) ) {
        copy( $source_path, $email_path );
        if ( file_exists( $source_path . '.headers' ) ) {
            copy( $source_path . '.headers', $email_path . '.headers' );
        }
    }

    if ( class_exists( '\WC_Emails' ) && class_exists( '\Automattic\WooCommerce\Admin\ReportCSVEmail' ) ) {
        \WC_Emails::instance();
        $email = new \Automattic\WooCommerce\Admin\ReportCSVEmail();
        $download_url = add_query_arg( array( 'action' => 'woocommerce_admin_download_report_csv', 'filename' => $email_filename ), admin_url( 'admin-ajax.php' ) );
        $email->trigger( $user_id, $report_type, $download_url );
    }
}
add_action( 'woocommerce_admin_email_report_download_link', 'dokan_intercept_email_report_download_link', 5, 3 );
