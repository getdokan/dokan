<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * WC default data store modifier.
 *
 * @since 3.13.0
 */
class DataStoreModifier implements Hookable {

    /**
     * Register hooks for the data store modifier.
     * @inheritDoc
     * @since 3.13.0
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_data_stores', [ $this, 'modify_wc_products_stats_datastore' ], 20 );
        add_filter( 'woocommerce_rest_reports_column_types', [ $this, 'add_dokan_column_types' ], 10, 1 );
    }

    /**
     * Add Dokan column types to the WooCommerce reports.
     *
     * @since 4.2.8
     *
     * @param array $column_types
     * @return array
     */
    public function add_dokan_column_types( $column_types ) {
        $dokan_column_types = [
            'avg_admin_commission' => 'floatval',
            'avg_vendor_earning' => 'floatval',
            'total_admin_commission' => 'floatval',
            'total_vendor_earning' => 'floatval',
            'total_vendor_gateway_fee' => 'floatval',
            'total_vendor_discount' => 'floatval',
            'total_admin_gateway_fee' => 'floatval',
            'total_admin_discount' => 'floatval',
            'total_admin_subsidy' => 'floatval',
        ];

        return array_merge( $column_types, $dokan_column_types );
	}

	/**
	 * Customize the WooCommerce products stats datastore to override the $total_query and $interval_query properties.
	 * This modification replaces the Automattic\WooCommerce\Admin\API\Reports\SqlQuery class with WeDevs\Dokan\Analytics\Reports\WcSqlQuery
	 * to apply specific filters to queries.
	 * The reason for this change is that the "get_sql_clause" method's second parameter defaults to "unfiltered," which blocks the filters we need
	 * to add JOIN and WHERE clauses for the dokan_order_stats table.
	 *
	 * @see https://github.com/woocommerce/woocommerce/blob/9297409c5a705d1cd0ae65ec9b058271bd90851e/plugins/woocommerce/src/Admin/API/Reports/Products/Stats/DataStore.php#L170
	 *
	 * @param array $wc_stores An array of WooCommerce datastores.
	 * @return array Modified array of WooCommerce datastores.
	 */
	public function modify_wc_products_stats_datastore( $wc_stores ) {
		if ( isset( $wc_stores['report-products-stats'] ) ) {
			$wc_stores['report-products-stats'] = \WeDevs\Dokan\Analytics\Reports\Products\Stats\WcDataStore::class;
		}

		if ( isset( $wc_stores['report-taxes-stats'] ) ) {
			$wc_stores['report-taxes-stats'] = \WeDevs\Dokan\Analytics\Reports\Taxes\Stats\WcDataStore::class;
		}

		if ( isset( $wc_stores['report-orders-stats'] ) ) {
			$wc_stores['report-orders-stats'] = \WeDevs\Dokan\Analytics\Reports\Orders\Stats\WcDataStore::class;
		}

		if ( isset( $wc_stores['report-coupons-stats'] ) ) {
			$wc_stores['report-coupons-stats'] = \WeDevs\Dokan\Analytics\Reports\Coupons\Stats\WcDataStore::class;
		}

		if ( isset( $wc_stores['report-stock-stats'] ) ) {
			$wc_stores['report-stock-stats'] = \WeDevs\Dokan\Analytics\Reports\Stock\Stats\WcDataStore::class;
		}

		return $wc_stores;
	}
}
