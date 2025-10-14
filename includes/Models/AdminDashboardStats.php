<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\AdminDashboardStatsStore;

/**
 * Admin Dashboard Stats Model Class
 *
 * @since 4.1.0
 */
class AdminDashboardStats extends BaseModel {

    /**
     * This is the name of this object type.
     *
     * @since 4.1.0
     *
     * @var string
     */
    protected $object_type = 'admin_dashboard_stats';

    /**
     * Constructor.
     *
     * @since 4.1.0
     *
     * @param int $id ID to load from the DB (optional) or an AdminDashboardStats object.
     */
    public function __construct( int $id = 0 ) {
        $this->data_store = apply_filters( $this->get_hook_prefix() . 'data_store', dokan()->get_container()->get( AdminDashboardStatsStore::class ) );
        parent::__construct( $id );
    }

    /**
     * Get new customers' data.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array New customers data.
     */
    public static function get_new_customers_data( array $date_range ): array {
        return ( new static() )->get_data_store()->get_new_customers_data( $date_range );
    }

    /**
     * Get order cancellation rate data.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Order cancellation rate data.
     */
    public static function get_order_cancellation_rate_data( array $date_range ): array {
        return ( new static() )->get_data_store()->get_order_cancellation_rate_data( $date_range );
    }

    /**
     * Get new products data.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array New products data.
     */
    public static function get_new_products_data( array $date_range ): array {
        return ( new static() )->get_data_store()->get_new_products_data( $date_range );
    }

    /**
     * Get active vendors data.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Active vendors data.
     */
    public static function get_active_vendors_data( array $date_range ): array {
        return ( new static() )->get_data_store()->get_active_vendors_data( $date_range );
    }

    /**
     * Get monthly overview data.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Monthly overview data.
     */
    public static function get_monthly_overview( array $date_range ): array {
        return ( new static() )->get_data_store()->get_monthly_overview( $date_range );
    }

    /**
     * Get top-performing vendors.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format. Optional.
     * @param string $end_date   End date in Y-m-d format. Optional.
     * @param int    $limit Number of vendors to retrieve. Default 5.
     *
     * @return array Array of vendor data with sales metrics.
     */
    public static function get_top_performing_vendors( string $start_date, string $end_date, int $limit = 5 ): array {
        return ( new static() )->get_data_store()->get_top_performing_vendors( $start_date, $end_date, $limit );
    }

    /**
     * Get vendor metrics data.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array Vendor metrics data.
     */
    public static function get_vendor_metrics( string $start_date, string $end_date ): array {
        return ( new static() )->get_data_store()->get_vendor_metrics( $start_date, $end_date );
    }
}
