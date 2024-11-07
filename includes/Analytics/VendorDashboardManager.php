<?php

namespace WeDevs\Dokan\Analytics;

use WeDevs\Dokan\Contracts\Hookable;
use WP_REST_Request;

class VendorDashboardManager implements Hookable {
	public function register_hooks(): void {
		add_filter( 'woocommerce_rest_check_permissions', [ $this, 'woocommerce_rest_check_permissions' ], 20, 4 );

		// Dummy hook for testing.
		add_filter( 'dokan_product_listing_template_render', [ $this, 'control_product_listing_render' ] );
		add_action( 'dokan_dashboard_content_inside_before', [ $this, 'add_dashboard_content' ] );

		add_filter( 'woocommerce_rest_product_object_query', [ $this, 'product_query_args' ], 10, 2 );

		add_filter( 'woocommerce_rest_report_revenue_stats_schema', [ $this, 'revenue_stats_schema' ] );
		// add_filter( 'woocommerce_rest_report_orders_stats_schema', [ $this, 'revenue_stats_schema' ] );

		add_filter( 'woocommerce_rest_report_sort_performance_indicators', [ $this, 'sort_performance_indicators' ] );
	}

    /**
     * Determine whether to hide the product listing on the analytics report page.
     *
     * @since DOKAN_SINCE
     *
     * @param bool $render Whether to render the product listing.
     *
     * @return bool True to hide product listing on analytics report page, original $render otherwise.
     */
    public function control_product_listing_render( bool $render ): bool {
        $path = isset( $_GET['path'] ) ? sanitize_text_field( wp_unslash( $_GET['path'] ) ) : ''; // phpcs:ignore

        return $path !== '/analytics/products' ? $render : true;
    }

	/**
     * Add a dummy content to the dashboard.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
	public function add_dashboard_content() {
		echo '<div id="dokan-analytics-app"></div>';
	}

	public function woocommerce_rest_check_permissions( $permission, $context, $int_val, $obj ) {
		if ( ! $permission && in_array( $obj, [ 'reports', 'settings' ], true ) && $context === 'read' ) {
			$current_user_id = dokan_get_current_user_id();
			$permission      = dokan_is_user_seller( $current_user_id );
		}

		return $permission;
	}

	/**
	 * Filter product query by the Vendor.
	 *
	 * @param array $args
	 * @return array
	 */
	public function product_query_args( array $args, WP_REST_Request $request ) {
		if (
		! is_user_logged_in()
		|| ! is_admin()
		|| current_user_can( 'manage_woocommerce' )
		|| '/wc-analytics/products' !== $request->get_route()
		) {
			return $args;
		}

		$args['author'] = get_current_user_id();

		return $args;
	}

	public function add_additional_fields_schema1( $reports ) {
		$reports[] = array(
			'slug'        => 'revenue/total_seller_earning',
			'description' => __( 'Seller Totals.', 'dokan-lite' ),
		);

		return $reports;
	}

	public function revenue_stats_schema( $reports ) {
        $is_vendor_dashboard = dokan_is_seller_dashboard();

		$reports['totals']['properties']['total_seller_earning'] = array(
			'description' => $is_vendor_dashboard
                ? esc_html__( 'Total Earning', 'dokan-lite' )
                : esc_html__( 'Total Vendor Earning', 'dokan-lite' ),
			'type'        => 'number',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
			'indicator'   => true,
			'format'      => 'currency',
		);

		$reports['totals']['properties']['total_admin_commission'] = array(
			'description' => $is_vendor_dashboard
                ? esc_html__( 'Total Admin Commission', 'dokan-lite' )
                : esc_html__( 'Total Commission', 'dokan-lite' ),
			'type'        => 'number',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
			'indicator'   => true,
			'format'      => 'currency',
		);

		return $reports;
	}

	public function sort_performance_indicators( $reports ) {
		$first_indicator = array_shift( $reports );

		$vendor_indicators = [
			$first_indicator,
			'revenue/total_seller_earning',
			'revenue/total_admin_commission',
		];

		array_unshift( $reports, ...$vendor_indicators );

		return $reports;
	}
}
