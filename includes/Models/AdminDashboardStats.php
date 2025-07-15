<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\AdminDashboardStatsStore;

/**
 * Admin Dashboard Stats Model Class
 *
 * @since DOKAN_SINCE
 */
class AdminDashboardStats extends BaseModel {

    /**
     * This is the name of this object type.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $object_type = 'admin_dashboard_stats';

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $id ID to load from the DB (optional) or an AdminDashboardStats object.
     */
    public function __construct( int $id = 0 ) {
        $this->data_store = new AdminDashboardStatsStore();
        parent::__construct( $id );
    }

    /**
     * Get customer metrics data.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array Customer metrics data.
     */
    public static function get_customer_metrics( string $start_date, string $end_date ): array {
        return ( new static() )->get_data_store()->get_customer_metrics( $start_date, $end_date );
    }

    /**
     * Get new customers' data.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @param int $limit Number of vendors to retrieve. Default 5.
     *
     * @return array Array of vendor data with sales metrics.
     */
    public static function get_top_performing_vendors( int $limit = 5 ): array {
        return ( new static() )->get_data_store()->get_top_performing_vendors( $limit );
    }
}
