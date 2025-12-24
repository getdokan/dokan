<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\API\Reports\DataStore as ReportsDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use Automattic\WooCommerce\Admin\API\Reports\Customers\DataStore as CustomersDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;
use Exception;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Commission\OrderCommission;

/**
 * Dokan Orders stats data synchronizer.
 *
 * @since 3.13.0
 */
class DataStore extends ReportsDataStore implements DataStoreInterface {
	/**
	 * Max allowed Attemption to create table.
	 */
	const MAX_ATTEMPT = 2;

	/**
	 * Attemption count to create order table if DB throws error.
	 *
	 * @var integer
	 */
	protected static $attempt_count = 0;

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
			dokan_log( 'Dokan Analytics Order not found: ' . $order->get_id() );

			return -1;
		}

		$order_commission = null;

		// Override the values if order is a shop order.
		switch ( $order->get_type() ) {
			case 'shop_order':
				$order_commission = dokan_get_container()->get( OrderCommission::class );
				$order_commission->set_order( $order );
				$order_commission->get();
				break;

			case 'shop_order_refund':
				$parent_order = wc_get_order( $order->get_parent_id() );
				break;
			default:
				break;
		}

		/**
		 * Filters order stats data.
		 *
		 * @param array $data Data written to order stats lookup table.
		 * @param \WC_Order $order  Order object.
		 *
		 * @since 3.13.0
		 */
		$data = apply_filters(
			'dokan_analytics_update_order_stats_data',
			array(
                'order_id'            => $order->get_id(),
                'vendor_id'           => (int) self::get_vendor_id_from_order( $order ),
                'order_type'          => (int) ( ( new OrderType() )->get_type( $order ) ),
                // Seller Data
                'vendor_earning'      => $order_commission ? $order_commission->get_vendor_earning() : 0,
                'vendor_gateway_fee'  => $order_commission ? $order_commission->get_vendor_gateway_fee() : 0,
                'vendor_shipping_fee' => $order_commission ? $order_commission->get_vendor_shipping_fee() : 0,
                'vendor_discount'     => $order_commission ? $order_commission->get_vendor_discount() : 0,
                // 'vendor_tax_fee'          => $order_commission ? $order_commission->get_vendor_tax_fee() : 0,
                // 'vendor_shipping_tax_fee' => $order_commission ? $order_commission->get_vendor_shipping_tax_fee() : 0,
                // Admin Data
                'admin_commission'    => $order_commission ? $order_commission->get_admin_commission() : 0,
                'admin_gateway_fee'   => $order_commission ? $order_commission->get_admin_gateway_fee() : 0,
                'admin_shipping_fee'  => $order_commission ? $order_commission->get_admin_shipping_fee() : 0,
                'admin_discount'      => $order_commission ? $order_commission->get_admin_discount() : 0,
                'admin_subsidy'       => $order_commission ? $order_commission->get_admin_subsidy() : 0,
                // 'admin_tax_fee'           => $order_commission->get_admin_tax_fee(),
                // 'admin_shipping_tax_fee'  => $order_commission->get_admin_shipping_tax_fee(),
			),
            $order,
        );

		$format = array(
			'%d',
			'%d',
			'%d',
			// Seller data
			'%f',
			'%f',
			'%f',
			'%f',
			// Admin data
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
		 * @since 3.13.0
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
		 * @since 3.13.0
		 */
		do_action( 'dokan_analytics_delete_order_stats', $order_id, $customer_id );
	}

	/**
	 * Gets the vendor ID associated with an order.
	 *
	 * @param \WC_Order $order Order object.
	 *
	 * @return int Vendor ID.
	 */
	protected static function get_vendor_id_from_order( $order ) {
		$order_type = ( new OrderType() )->get_type( $order );

		switch ( $order_type ) {
			case OrderType::DOKAN_SUBORDER:
			case OrderType::DOKAN_SINGLE_ORDER:
				$vendor_id = $order->get_meta( '_dokan_vendor_id' );
				break;
			case OrderType::DOKAN_SUBORDER_REFUND:
			case OrderType::DOKAN_SINGLE_ORDER_REFUND:
				$parent_order = wc_get_order( $order->get_parent_id() );
				$vendor_id    = $parent_order->get_meta( '_dokan_vendor_id' );
				break;
			default:
				$vendor_id = 0;
				break;
		}

		return (int) $vendor_id;
	}
}
