<?php
/**
 * API\Reports\Orders\Stats\DataStore class file.
 */

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\API\Reports\DataStore as ReportsDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use Automattic\WooCommerce\Admin\API\Reports\Customers\DataStore as CustomersDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;
use Exception;
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
	protected $cache_key = 'dokan_orders_stats';


	/**
	 * Data store context used to pass to filters.
	 *
	 * @var string
	 */
	protected $context = 'dokan_orders_stats';

	/**
	 * Dynamically sets the date column name based on configuration
	 */
	public function __construct() {
		// $this->date_column_name = get_option( 'woocommerce_date_type', 'date_paid' );
		parent::__construct();
	}

	/**
	 * Get the data based on args.
	 *
	 * @param array $args Query parameters.
	 * @return stdClass|WP_Error
	 */
	public function get_data( $args ) {
		throw new Exception( 'Not supported by Dokan' );
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
}
