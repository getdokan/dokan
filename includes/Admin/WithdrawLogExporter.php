<?php

namespace WeDevs\Dokan\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Include Dependencies.
 */
if ( ! class_exists( 'WC_CSV_Batch_Exporter', false ) ) {
    include_once WC_ABSPATH . 'includes/export/abstract-wc-csv-batch-exporter.php';
}

/**
 * WithdrawLogExporter for Log Export.
 *
 * @since 3.8.3
 *
 * @package dokan
 */
class WithdrawLogExporter extends \WC_CSV_Batch_Exporter {
    /**
     * Type of export used in filter names.
     *
     * @since 3.8.3
     *
     * @var string
     */
    protected $export_type = 'withdraw';

    /**
     * Filename to export to.
     *
     * @since 3.8.3
     *
     * @var string
     */
    protected $filename = 'dokan-withdraw-log-export.csv';

    /**
     * Items to export.
     *
     * @since 3.8.3
     *
     * @var array
     */
    protected $items = [];

    /**
     * Total rows to export.
     *
     * @since 3.8.3
     *
     * @var int
     */
    protected $total_rows = 0;

    /**
     * Decimal places.
     *
     * @since 3.8.3
     *
     * @var int
     */
    protected $decimal_places = 2;

    /**
     * Get column names.
     *
     * @since 3.8.3
     *
     * @return array
     */
    public function get_column_names() {
        return $this->column_names;
    }

    /**
     * Set items for export.
     *
     * @since 3.8.3
     *
     * @param array $items
     */
    public function set_items( $items = [] ) {
        $this->items = $items;
    }

    /**
     * Set total rows.
     *
     * @since 3.8.3
     *
     * @param int $total_rows
     */
    public function set_total_rows( $total_rows ) {
        $this->total_rows = absint( $total_rows );
    }

    /**
     * Return an array of columns to export.
     *
     * @since 3.8.3
     *
     * @return array
     */
    public function get_default_column_names() {
        return apply_filters(
            'dokan_withdraw_log_export_columns', [
                'id'                  => __( 'ID', 'dokan-lite' ),
                'vendor_id'           => __( 'Vendor ID', 'dokan-lite' ),
                'store_name'          => __( 'Store Name', 'dokan-lite' ),
                'amount'              => __( 'Withdraw Total', 'dokan-lite' ),
                'status'              => __( 'Status', 'dokan-lite' ),
                'method_title'        => __( 'Method', 'dokan-lite' ),
                'date'                => __( 'Date', 'dokan-lite' ),
                'bank_ac_name'        => __( 'Bank Acc Name', 'dokan-lite' ),
                'bank_ac_number'      => __( 'Bank Acc No.', 'dokan-lite' ),
                'bank_ac_type'        => __( 'Bank Acc Type', 'dokan-lite' ),
                'bank_bank_name'      => __( 'Bank Name', 'dokan-lite' ),
                'bank_bank_addr'      => __( 'Bank Address', 'dokan-lite' ),
                'bank_declaration'    => __( 'Bank Declaration', 'dokan-lite' ),
                'bank_iban'           => __( 'Bank IBAN', 'dokan-lite' ),
                'bank_routing_number' => __( 'Bank Routing No.', 'dokan-lite' ),
                'bank_swift'          => __( 'Bank SWIFT Code', 'dokan-lite' ),
                'paypal_email'        => __( 'Paypal Email', 'dokan-lite' ),
                'skrill_email'        => __( 'Skrill Email', 'dokan-lite' ),
                'dokan_custom_method' => __( 'Custom Payment Method', 'dokan-lite' ),
                'dokan_custom_value'  => __( 'Custom Payment Value', 'dokan-lite' ),
                'note'                => __( 'Note', 'dokan-lite' ),
            ]
        );
    }

    /**
     * Prepare formatted data to export.
     *
     * @since 3.8.3
     *
     * @return void
     */
    public function prepare_data_to_export() {
        $this->row_data = [];

        foreach ( $this->items as $item ) {
            $row = $this->generate_row_data( $item );
            if ( $row ) {
                $this->row_data[] = $row;
            }
        }
    }

    /**
     * Take a withdraw item and generate row data from it for export.
     *
     * @since 3.8.3
     *
     * @param $withdraw_item
     *
     * @return array
     */
    protected function generate_row_data( $withdraw_item ) {
        $columns = $this->get_column_names();
        $row     = [];

        foreach ( $columns as $column_id => $column_name ) {
            // Skip some columns if we're being selective.
            if ( ! $this->is_column_exporting( $column_id ) ) {
                continue;
            }

            $row[ $column_id ] = $this->get_column_value( $withdraw_item, $column_id );
        }

        return $row;
    }

    /**
     * Get value from withdraw item by key.
     *
     * @since 3.8.3
     *
     * @param $withdraw_item
     * @param $key
     *
     * @return mixed
     */
    protected function get_column_value( $withdraw_item, $key ) {
        switch ( $key ) {
            case 'vendor_id':
                $column_value = $withdraw_item['user']['id'] ?? '';
                break;

            case 'store_name':
                $column_value = $withdraw_item['user']['store_name'] ?? '';
                break;

            case 'date':
                $column_value = $withdraw_item['created'] ?? '';
                break;

            case "paypal_email":
                $column_value = $withdraw_item['details']['paypal']['email'] ?? '';
                break;

            case "skrill_email":
                $column_value = $withdraw_item['details']['skrill']['email'] ?? '';
                break;

            case "dokan_custom_method":
            case "dokan_custom_value":
                $field        = substr_replace( $key, '', 0, 13 );
                $column_value = $withdraw_item['details']['dokan_custom'][ $field ] ?? '';
                break;

            case "bank_ac_name":
            case "bank_ac_number":
            case "bank_ac_type":
            case "bank_bank_name":
            case "bank_bank_addr":
            case "bank_declaration":
            case "bank_iban":
            case "bank_routing_number":
            case "bank_swift":
                $field        = substr_replace( $key, '', 0, 5 );
                $column_value = $withdraw_item['details']['bank'][ $field ] ?? '';
                break;

            default:
                $column_value = $withdraw_item[$key] ?? '';
        }

        return $column_value;
    }

    /**
     * Get total % complete.
     *
     * @since 3.8.3
     *
     * @return int
     */
    public function get_percent_complete() {
        return $this->total_rows ? absint( floor( ( $this->get_total_exported() / $this->total_rows ) * 100 ) ) : 100;
    }
}
