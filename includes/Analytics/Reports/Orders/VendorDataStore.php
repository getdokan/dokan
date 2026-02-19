<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\API\Reports\Orders\DataStore as WcOrdersDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore as DokanOrderStatsDataStore;

/**
 * Vendor Orders DataStore.
 *
 * Extends WooCommerce Orders DataStore to include Dokan vendor-specific data
 * by joining the dokan_order_stats table.
 *
 * Usage:
 *   $data_store = new VendorDataStore( $query_args );
 *   $stats_data = $data_store->get_data();
 *
 * @since 4.0.0
 */
class VendorDataStore extends WcOrdersDataStore implements DataStoreInterface {

	/**
	 * Cache identifier.
	 *
	 * @var string
	 */
	protected $cache_key = 'vendor_orders';

	/**
	 * Data store context used to pass to filters.
	 *
	 * @var string
	 */
	protected $context = 'vendor_orders';

	/**
	 * Mapping columns to data type to return correct response types.
	 *
	 * @var array
	 */
	protected $column_types = array(
		'order_id'            => 'intval',
		'parent_id'           => 'intval',
		'date_created'        => 'strval',
		'date_created_gmt'    => 'strval',
		'status'              => 'strval',
		'customer_id'         => 'intval',
		'net_total'           => 'floatval',
		'total_sales'         => 'floatval',
		'num_items_sold'      => 'intval',
		'customer_type'       => 'strval',
		'vendor_id'           => 'intval',
		'vendor_earning'      => 'floatval',
		'vendor_gateway_fee'  => 'floatval',
		'vendor_discount'     => 'floatval',
		'admin_commission'    => 'floatval',
		'admin_gateway_fee'   => 'floatval',
		'admin_discount'      => 'floatval',
		'admin_subsidy'       => 'floatval',
	);

	/**
	 * Query args passed during construction.
	 *
	 * @var array
	 */
	protected $query_args = array();

	/**
	 * Constructor.
	 *
	 * @param array $query_args Optional query arguments.
	 */
	public function __construct( $query_args = array() ) {
		$this->query_args = $query_args;
		parent::__construct();
	}

	/**
	 * Assign report columns including vendor-specific columns from dokan_order_stats.
	 *
	 * @return void
	 */
	protected function assign_report_columns() {
		parent::assign_report_columns();

		$dokan_table = DokanOrderStatsDataStore::get_db_table_name();

		$this->report_columns['vendor_id']           = "{$dokan_table}.vendor_id";
		$this->report_columns['vendor_earning']      = "{$dokan_table}.vendor_earning";
		$this->report_columns['vendor_gateway_fee']  = "{$dokan_table}.vendor_gateway_fee";
		$this->report_columns['vendor_discount']     = "{$dokan_table}.vendor_discount";
		$this->report_columns['admin_commission']    = "{$dokan_table}.admin_commission";
		$this->report_columns['admin_gateway_fee']   = "{$dokan_table}.admin_gateway_fee";
		$this->report_columns['admin_discount']      = "{$dokan_table}.admin_discount";
		$this->report_columns['admin_subsidy']       = "{$dokan_table}.admin_subsidy";
	}

	/**
	 * Get the default query arguments.
	 *
	 * @return array Query parameters.
	 */
	public function get_default_query_vars() {
		$defaults = parent::get_default_query_vars();

		return array_merge(
			$defaults,
			array(
				'vendor_id' => null,
			)
		);
	}

	/**
	 * Initialize query objects with dokan_order_stats JOIN.
	 *
	 * @return void
	 */
	protected function initialize_queries() {
		parent::initialize_queries();

		$dokan_table = DokanOrderStatsDataStore::get_db_table_name();
		$wc_table    = self::get_db_table_name();

		$this->subquery->add_sql_clause(
			'join',
			"JOIN {$dokan_table} ON {$wc_table}.order_id = {$dokan_table}.order_id"
		);
	}

	/**
	 * Updates the database query with parameters used for vendor orders report.
	 *
	 * @param array $query_args Query arguments supplied by the user.
	 */
	protected function add_sql_query_params( $query_args ) {
		parent::add_sql_query_params( $query_args );

		$dokan_table = DokanOrderStatsDataStore::get_db_table_name();

		if ( ! empty( $query_args['vendor_id'] ) ) {
			$vendor_id = absint( $query_args['vendor_id'] );
			$this->subquery->add_sql_clause( 'where', "AND {$dokan_table}.vendor_id = {$vendor_id}" );
		}
	}

	/**
	 * Get the data based on args.
	 *
	 * Convenience method that merges constructor args with runtime args.
	 *
	 * @param array $query_args Query parameters.
	 * @return \stdClass|\WP_Error
	 */
	public function get_data( $query_args = array() ) {
		$args = wp_parse_args( $query_args, $this->query_args );

		return parent::get_data( $args );
	}
}
