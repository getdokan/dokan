<?php

namespace WeDevs\Dokan\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Include dependencies.
 */
if ( ! class_exists( 'WC_CSV_Batch_Exporter', false ) ) {
    include_once WC_ABSPATH . 'includes/export/abstract-wc-csv-batch-exporter.php';
}

/**
 * WithdrawLogExporter for Log Export.
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
class WithdrawLogExporter extends \WC_CSV_Batch_Exporter {
    /**
     * Type of export used in filter names.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $export_type = 'withdraw';

    /**
     * Filename to export to.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $filename = 'dokan-withdraw-log-export.csv';

    /**
     * Query parameters.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected $items = [];

    /**
     * Query parameters.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected $total_rows = 0;

    /**
     * Decimal places.
     *
     * @since DOKAN_SINCE
     *
     * @var int
     */
    protected $decimal_places = 2;

    /**
     * Get column names.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_column_names() {
        return $this->column_names;
    }

    /**
     * Set items for export.
     *
     * @since DOKAN_SINCE
     *
     * @param array $items
     */
    public function set_items( $items = [] ) {
        $this->items = $items;
    }

    /**
     * Set total rows.
     *
     * @since DOKAN_SINCE
     *
     * @param array $total_rows
     */
    public function set_total_rows( $total_rows ) {
        $this->total_rows = absint( $total_rows );
    }

    /**
     * Return an array of columns to export.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_default_column_names() {
        return apply_filters(
            'dokan_withdraw_logs_export_columns', [
                'id'                   => __( 'ID', 'dokan' ),
                'vendor_id'            => __( 'Vendor ID', 'dokan-lite' ),
                'store_name'           => __( 'Store Name', 'dokan-lite' ),
                'amount'               => __( 'Withdraw Total', 'dokan-lite' ),
                'status'               => __( 'Status', 'dokan-lite' ),
                'method_title'         => __( 'Method', 'dokan-lite' ),
                'date'                 => __( 'Date', 'dokan-lite' ),
                'details'              => __( 'Details', 'dokan-lite' ),
                'note'                 => __( 'Note', 'dokan-lite' ),
            ]
        );
    }

    /**
     * Prepare formatted data to export.
     *
     * @since DOKAN_SINCE
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
     * Take an withdraw item and generate row data from it for export.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @param $withdraw_item
     * @param $key
     *
     * @return mixed
     */
    protected function get_column_value( $withdraw_item, $key ) {
        switch ( $key ) {
            case 'vendor_id':
                $column_value = isset( $withdraw_item['user']['id'] ) ? $withdraw_item['user']['id'] : '';
                break;
            case 'store_name':
                $column_value = isset( $withdraw_item['user']['store_name'] ) ? $withdraw_item['user']['store_name'] : '';
                break;
            case 'date':
                $column_value = isset( $withdraw_item['created'] ) ? $withdraw_item['created'] : '';
                break;
            default:
                $column_value = isset( $withdraw_item[ $key ] ) ? $withdraw_item[ $key ] : '';
        }

        return $column_value;
    }

    /**
     * Get total % complete.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_percent_complete() {
        return $this->total_rows ? absint( floor( ( $this->get_total_exported() / $this->total_rows ) * 100 ) ) : 100;
    }
}
