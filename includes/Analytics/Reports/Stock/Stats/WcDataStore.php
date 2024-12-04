<?php

namespace WeDevs\Dokan\Analytics\Reports\Stock\Stats;

use Automattic\WooCommerce\Admin\API\Reports\Stock\Stats\DataStore as StockStatsDataStore;


/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Stock Stats.
 *
 * @since 3.13.0
 */
class WcDataStore extends StockStatsDataStore {
	/**
	 * Get stock counts for the whole store.
	 *
	 * @param array $query Not used for the stock stats data store, but needed for the interface.
	 * @return array Array of counts.
	 */
	public function get_data( $query ) {
		$vendor_id = $this->get_vendor_id();

		$report_data              = array();
		$cache_expire             = DAY_IN_SECONDS * 30;
		// Set seller specific key.
		$low_stock_transient_name = 'wc_admin_stock_count_lowstock' . $vendor_id;
		$low_stock_count          = get_transient( $low_stock_transient_name );

		if ( false === $low_stock_count ) {
			$low_stock_count = $this->get_low_stock_count();
			set_transient( $low_stock_transient_name, $low_stock_count, $cache_expire );
		} else {
			$low_stock_count = intval( $low_stock_count );
		}

		$report_data['lowstock'] = $low_stock_count;

		$status_options = wc_get_product_stock_status_options();
		foreach ( $status_options as $status => $label ) {
			// Set seller specific key.
			$transient_name = 'wc_admin_stock_count_' . $status . $vendor_id;
			$count          = get_transient( $transient_name );
			if ( false === $count ) {
				$count = $this->get_count( $status );
				set_transient( $transient_name, $count, $cache_expire );
			} else {
				$count = intval( $count );
			}
			$report_data[ $status ] = $count;
		}

		// Set seller specific key.
		$product_count_transient_name = 'wc_admin_product_count' . $vendor_id;
		$product_count                = get_transient( $product_count_transient_name );
		if ( false === $product_count ) {
			$product_count = $this->get_product_count();
			set_transient( $product_count_transient_name, $product_count, $cache_expire );
		} else {
			$product_count = intval( $product_count );
		}
		$report_data['products'] = $product_count;
		return $report_data;
	}

	/**
	 * Get low stock count (products with stock < low stock amount, but greater than no stock amount).
	 *
	 * @phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
     *
	 *
	 * @return int Low stock count.
	 */
	protected function get_low_stock_count() {
		global $wpdb;

		$no_stock_amount  = absint( max( get_option( 'woocommerce_notify_no_stock_amount' ), 0 ) );
		$low_stock_amount = absint( max( get_option( 'woocommerce_notify_low_stock_amount' ), 1 ) );
		$vendor_where = $this->get_vendor_where_query();

		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"
				SELECT count( DISTINCT posts.ID ) FROM {$wpdb->posts} posts
				LEFT JOIN {$wpdb->wc_product_meta_lookup} wc_product_meta_lookup ON posts.ID = wc_product_meta_lookup.product_id
				LEFT JOIN {$wpdb->postmeta} low_stock_amount_meta ON posts.ID = low_stock_amount_meta.post_id AND low_stock_amount_meta.meta_key = '_low_stock_amount'
				WHERE posts.post_type IN ( 'product', 'product_variation' )
				AND wc_product_meta_lookup.stock_quantity IS NOT NULL
				AND wc_product_meta_lookup.stock_status = 'instock'
				AND (
					(
						low_stock_amount_meta.meta_value > ''
						AND wc_product_meta_lookup.stock_quantity <= CAST(low_stock_amount_meta.meta_value AS SIGNED)
						AND wc_product_meta_lookup.stock_quantity > %d
					)
					OR (
						(
							low_stock_amount_meta.meta_value IS NULL OR low_stock_amount_meta.meta_value <= ''
						)
						AND wc_product_meta_lookup.stock_quantity <= %d
						AND wc_product_meta_lookup.stock_quantity > %d
					)
				)
				{$vendor_where}
				",
				$no_stock_amount,
				$low_stock_amount,
				$no_stock_amount
			)
		);
	}

	/**
	 * Get count for the passed in stock status.
	 *
	 * @param  string $status Status slug.
	 * @return int Count.
	 */
	protected function get_count( $status ) {
		global $wpdb;

		$vendor_where = $this->get_vendor_where_query();

		return (int) $wpdb->get_var(
			$wpdb->prepare(// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"
				SELECT count( DISTINCT posts.ID ) FROM {$wpdb->posts} posts
				LEFT JOIN {$wpdb->wc_product_meta_lookup} wc_product_meta_lookup ON posts.ID = wc_product_meta_lookup.product_id
				WHERE posts.post_type IN ( 'product', 'product_variation' )
				AND wc_product_meta_lookup.stock_status = %s {$vendor_where}
				",
				$status
			)
		);
	}

	/**
	 * Get product count for the store.
	 *
	 * @return int Product count.
	 */
	protected function get_product_count() {
		$query_args              = array();
		$query_args['post_type'] = array( 'product', 'product_variation' );
		$vendor_id = $this->get_vendor_id();

		if ( $vendor_id ) {
			$query_args['author'] = $vendor_id;
		}

		$query = new \WP_Query();
		$query->query( $query_args );

		return intval( $query->found_posts );
	}

	protected function get_vendor_id(): int {
		return (int) dokan()->get_container()->get( \WeDevs\Dokan\Analytics\Reports\Stock\QueryFilter::class )->get_vendor_id();
	}

	protected function get_vendor_where_query() {
		$vendor_id = $this->get_vendor_id();
		$where = '';

		if ( $vendor_id ) {
			global $wpdb;

			$where = $wpdb->prepare(
                ' AND posts.post_author = %d ',
                $vendor_id
			);
		}

		return $where;
	}
}
