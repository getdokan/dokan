<?php

namespace WeDevs\Dokan\Analytics\Reports\Categories;

use WeDevs\Dokan\Analytics\Reports\BaseQueryFilter;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Categories.
 *
 * @since 3.13.0
 */
class QueryFilter extends BaseQueryFilter {
    protected $wc_table = 'wc_order_product_lookup';

    /**
     * @var string The context of the query filter.
     */
    protected $context = 'categories';

    /**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
    public function register_hooks(): void {
        // add_filter( 'woocommerce_analytics_clauses_join_products', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_join_categories_subquery', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_where_categories_subquery', [ $this, 'add_where_subquery' ], 30 );
        // add_filter( 'woocommerce_analytics_clauses_select_products_subquery', [ $this, 'add_select_subquery' ] );
        // add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }
}
