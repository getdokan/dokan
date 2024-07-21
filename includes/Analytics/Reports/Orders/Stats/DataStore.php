<?php
/**
 * API\Reports\Orders\Stats\DataStore class file.
 */

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\API\Reports\DataStore as ReportsDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use Automattic\WooCommerce\Admin\API\Reports\SqlQuery;
use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use Automattic\WooCommerce\Admin\API\Reports\Customers\DataStore as CustomersDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;
use WeDevs\Dokan\Analytics\Reports\OrderType;

/**
 * API\Reports\Orders\Stats\DataStore.
 */
class DataStore extends ReportsDataStore implements DataStoreInterface {

	/**
	 * Table used to get the data.
	 *
	 * @var string
	 */
	protected static $table_name = 'dokan_order_stats';

	/**
	 * Cron event name.
	 */
	const CRON_EVENT = 'wc_order_stats_update';

	/**
	 * Cache identifier.
	 *
	 * @var string
	 */
	protected $cache_key = 'orders_stats';

	/**
	 * Type for each column to cast values correctly later.
	 *
	 * @var array
	 */
	protected $column_types = array(
		'sub_orders_count'          => 'intval',
		'seller_id'                 => 'intval',
		'total_seller_earning'      => 'floatval',
		'total_seller_gateway_fee'  => 'floatval',
		'total_seller_discount'     => 'floatval',
		'total_admin_commission'    => 'floatval',
		'total_admin_gateway_fee'   => 'floatval',
		'total_admin_discount'      => 'floatval',
		'total_admin_subsidy'       => 'floatval',
	);

	/**
	 * Data store context used to pass to filters.
	 *
	 * @var string
	 */
	protected $context = 'orders_stats';

	/**
	 * Dynamically sets the date column name based on configuration
	 */
	public function __construct() {
		// $this->date_column_name = get_option( 'woocommerce_date_type', 'date_paid' );
		parent::__construct();
	}

	/**
	 * Assign report columns once full table name has been assigned.
	 */
	protected function assign_report_columns() {
		$table_name = self::get_db_table_name();
		// Avoid ambigious columns in SQL query.
		$refunds     = "ABS( SUM( CASE WHEN {$table_name}.net_total < 0 THEN {$table_name}.net_total ELSE 0 END ) )";
		$gross_sales =
			"( SUM({$table_name}.total_sales)" .
			' + COALESCE( SUM(discount_amount), 0 )' . // SUM() all nulls gives null.
			" - SUM({$table_name}.tax_total)" .
			" - SUM({$table_name}.shipping_total)" .
			" + {$refunds}" .
			' ) as gross_sales';

		$this->report_columns = array(
			'orders_count'        => "SUM( CASE WHEN {$table_name}.parent_id = 0 THEN 1 ELSE 0 END ) as orders_count",
			'num_items_sold'      => "SUM({$table_name}.num_items_sold) as num_items_sold",
			'gross_sales'         => $gross_sales,
			'total_sales'         => "SUM({$table_name}.total_sales) AS total_sales",
			'coupons'             => 'COALESCE( SUM(discount_amount), 0 ) AS coupons', // SUM() all nulls gives null.
			'coupons_count'       => 'COALESCE( coupons_count, 0 ) as coupons_count',
			'refunds'             => "{$refunds} AS refunds",
			'taxes'               => "SUM({$table_name}.tax_total) AS taxes",
			'shipping'            => "SUM({$table_name}.shipping_total) AS shipping",
			'net_revenue'         => "SUM({$table_name}.net_total) AS net_revenue",
			'avg_items_per_order' => "SUM( {$table_name}.num_items_sold ) / SUM( CASE WHEN {$table_name}.parent_id = 0 THEN 1 ELSE 0 END ) AS avg_items_per_order",
			'avg_order_value'     => "SUM( {$table_name}.net_total ) / SUM( CASE WHEN {$table_name}.parent_id = 0 THEN 1 ELSE 0 END ) AS avg_order_value",
			'total_customers'     => "COUNT( DISTINCT( {$table_name}.customer_id ) ) as total_customers",
		);
	}

	/**
	 * Set up all the hooks for maintaining and populating table data.
	 */
	public static function init() {
		add_action( 'woocommerce_before_delete_order', array( __CLASS__, 'delete_order' ) );
		add_action( 'delete_post', array( __CLASS__, 'delete_order' ) );
	}

	/**
	 * Returns the report data based on parameters supplied by the user.
	 *
	 * @param array $query_args  Query parameters.
	 * @return stdClass|WP_Error Data.
	 */
	public function get_data( $query_args ) {
	}

	/**
	 * Get unique products based on user time query
	 *
	 * @param string $from_clause       From clause with date query.
	 * @param string $where_time_clause Where clause with date query.
	 * @param string $where_clause      Where clause with date query.
	 * @return integer Unique product count.
	 */
	public function get_unique_product_count( $from_clause, $where_time_clause, $where_clause ) {
	}

	/**
	 * Get unique coupons based on user time query
	 *
	 * @param string $from_clause       From clause with date query.
	 * @param string $where_time_clause Where clause with date query.
	 * @param string $where_clause      Where clause with date query.
	 * @return integer Unique product count.
	 */
	public function get_unique_coupon_count( $from_clause, $where_time_clause, $where_clause ) {
	}

	/**
	 * Add order information to the lookup table when orders are created or modified.
	 *
	 * @param int $post_id Post ID.
	 * @return int|bool Returns -1 if order won't be processed, or a boolean indicating processing success.
	 */
	public static function sync_order( $post_id ) {
		if ( ! OrderUtil::is_order( $post_id, array( 'shop_order', 'shop_order_refund' ) ) ) {
			return -1;
		}

		$order = wc_get_order( $post_id );
		if ( ! $order ) {
			return -1;
		}

		return self::update( $order );
	}

	/**
	 * Update the database with stats data.
	 *
	 * @param \WC_Order|\WC_Order_Refund $order Order or refund to update row for.
	 * @return int|bool Returns -1 if order won't be processed, or a boolean indicating processing success.
	 */
	public static function update( $order ) {
		global $wpdb;
		$table_name = self::get_db_table_name();

		if ( ! $order->get_id() || ! $order->get_date_created() ) {
			return -1;
		}

		/**
		 * Filters order stats data.
		 *
		 * @param array $data Data written to order stats lookup table.
		 * @param WC_Order $order  Order object.
		 *
		 * @since 4.0.0
		 */
		$data = apply_filters(
			'dokan_analytics_update_order_stats_data',
			array(
				'order_id'           => $order->get_id(),
				'seller_id'          => (int) $order->get_meta( '_dokan_vendor_id' ),
				'order_type'        => (int) ( ( new OrderType() )->get_type( $order ) ),
				'seller_earning'     => $order->get_meta( '_seller_earning' ),
				'seller_gateway_fee' => $order->get_meta( '_seller_gateway_fee' ),
				'seller_discount'    => $order->get_meta( '_seller_discount' ),
				'admin_commission'   => $order->get_meta( '_admin_commission' ),
				'admin_gateway_fee'  => $order->get_meta( '_admin_gateway_fee' ),
				'admin_discount'     => $order->get_meta( '_admin_discount' ),
				'admin_subsidy'      => $order->get_meta( '_admin_subsidy' ),
			),
            $order,
        );

			$format = array(
				'%d',
				'%d',
				'%d',
				'%f',
				'%f',
				'%f',
				'%f',
				'%f',
				'%f',
				'%f',
			);

			// Update or add the information to the DB.
			$result = $wpdb->replace( $table_name, $data, $format );

			/**
			 * Fires when Dokan order's stats reports are updated.
			 *
			 * @param int $order_id Order ID.
			 *
			 * @since DOKAN_SINCE
			 */
			do_action( 'dokan_analytics_update_order_stats', $order->get_id() );

			// Check the rows affected for success. Using REPLACE can affect 2 rows if the row already exists.
			return ( 1 === $result || 2 === $result );
	}

	/**
	 * Deletes the order stats when an order is deleted.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function delete_order( $post_id ) {
		global $wpdb;
		$order_id = (int) $post_id;

		if ( ! OrderUtil::is_order( $post_id, array( 'shop_order', 'shop_order_refund' ) ) ) {
			return;
		}

		// Retrieve customer details before the order is deleted.
		$order       = wc_get_order( $order_id );
		$customer_id = absint( CustomersDataStore::get_existing_customer_id_from_order( $order ) );

		// Delete the order.
		$wpdb->delete( self::get_db_table_name(), array( 'order_id' => $order_id ) );
		/**
		 * Fires when orders stats are deleted.
		 *
		 * @param int $order_id Order ID.
		 * @param int $customer_id Customer ID.
		 *
		 * @since 4.0.0
		 */
		do_action( 'dokan_analytics_delete_order_stats', $order_id, $customer_id );

		ReportsCache::invalidate();
	}

	/**
	 * Initialize query objects.
	 */
	protected function initialize_queries() {
		$this->clear_all_clauses();
		unset( $this->subquery );
		$this->total_query = new SqlQuery( $this->context . '_total' );
		$this->total_query->add_sql_clause( 'from', self::get_db_table_name() );

		$this->interval_query = new SqlQuery( $this->context . '_interval' );
		$this->interval_query->add_sql_clause( 'from', self::get_db_table_name() );
		$this->interval_query->add_sql_clause( 'group_by', 'time_interval' );
	}
}
