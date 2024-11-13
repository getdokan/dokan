<?php

namespace WeDevs\Dokan\Analytics\Reports\Stock;

use WeDevs\Dokan\Analytics\Reports\BaseQueryFilter;
use WP_REST_Request;
use WP_Query;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Product Stock.
 *
 * @since 3.13.0
 */
class QueryFilter extends BaseQueryFilter {
    protected $should_removed_where_filter = true;

	public function register_hooks(): void {
		add_filter( 'rest_pre_dispatch', [ $this,  'check_wc_analytics_reports_stock_path' ], 10, 3 );
	}

    /**
     * Undocumented function
     *
     * @param [type] $result
     * @param [type] $server
     * @param WP_REST_Request $request
     * @return mixed
     */
	public function check_wc_analytics_reports_stock_path( $result, $server, $request ) {
        // We must compare the current rest route to avoid global impact.
        if ( $request->get_route() === '/wc-analytics/reports/stock' ) {
		    add_filter( 'posts_clauses', array( $this, 'add_author_clause' ), 10, 2 );
        }

        return $result;
    }

    /**
     * Apply seller ID query param to where SQL Clause.
     *
     * @param WP_Query $wp_query
     * @return array
     */
    public function add_author_clause( $args, $wp_query ) {
		global $wpdb;

        $vendor_id = $this->get_vendor_id();

		if ( $vendor_id ) {
			$args['where'] = $args['where'] . $wpdb->prepare(
                " AND {$wpdb->posts}.post_author = %d ",
                $vendor_id
			);
		}

		return $args;
	}
}
