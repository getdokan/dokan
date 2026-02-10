<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\AdminReportStatsStore;

/**
 * Admin Report Stats Model Class
 *
 * @since SUSPENDED
 */
class AdminReportStats extends BaseModel {

    /**
     * This is the name of this object type.
     *
     * @since SUSPENDED
     *
     * @var string
     */
    protected $object_type = 'admin_report_stats';

    /**
     * Constructor.
     *
     * @since SUSPENDED
     *
     * @param int $id ID to load from the DB (optional).
     */
    public function __construct( int $id = 0 ) {
        $this->data_store = apply_filters( $this->get_hook_prefix() . 'data_store', dokan()->get_container()->get( AdminReportStatsStore::class ) );
        parent::__construct( $id );
    }

    /**
     * Get net sales for a given date range.
     *
     * @since SUSPENDED
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return float Net sales amount.
     */
    public static function get_net_sales( string $start_date, string $end_date, int $seller_id = 0 ): float {
        return ( new static() )->get_data_store()->get_net_sales( $start_date, $end_date, $seller_id );
    }

    /**
     * Get commission earned for a given date range.
     *
     * @since SUSPENDED
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return float Commission earned amount.
     */
    public static function get_commission_earned( string $start_date, string $end_date, int $seller_id = 0 ): float {
        return ( new static() )->get_data_store()->get_commission_earned( $start_date, $end_date, $seller_id );
    }

    /**
     * Get order count for a given date range.
     *
     * @since SUSPENDED
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return int Order count.
     */
    public static function get_order_count( string $start_date, string $end_date, int $seller_id = 0 ): int {
        return ( new static() )->get_data_store()->get_order_count( $start_date, $end_date, $seller_id );
    }

    /**
     * Get overview chart data for a given date range.
     *
     * @since SUSPENDED
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param string $group_by   Group by 'day' or 'month'. Default 'day'.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return array Chart data rows.
     */
    public static function get_overview_chart_data( string $start_date, string $end_date, string $group_by = 'day', int $seller_id = 0 ): array {
        return ( new static() )->get_data_store()->get_overview_chart_data( $start_date, $end_date, $group_by, $seller_id );
    }

    /**
     * Get vendor data including signup counts and approval status.
     *
     * @since SUSPENDED
     *
     * @param string|null $from Start date. Optional.
     * @param string|null $to   End date. Optional.
     *
     * @return array Vendor data.
     */
    public static function get_vendor_data( $from = null, $to = null ): array {
        return ( new static() )->get_data_store()->get_vendor_data( $from, $to );
    }

    /**
     * Get product count data.
     *
     * @since SUSPENDED
     *
     * @param string|null $from      Start date. Optional.
     * @param string|null $to        End date. Optional.
     * @param int         $seller_id Seller ID. Optional.
     *
     * @return array Product count data.
     */
    public static function get_product_data( $from = null, $to = null, $seller_id = 0 ): array {
        return ( new static() )->get_data_store()->get_product_data( $from, $to, $seller_id );
    }

    /**
     * Get pending withdrawal count data.
     *
     * @since SUSPENDED
     *
     * @return array Withdraw data.
     */
    public static function get_withdraw_data(): array {
        return ( new static() )->get_data_store()->get_withdraw_data();
    }
}
