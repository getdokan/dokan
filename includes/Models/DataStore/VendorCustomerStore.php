<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Utilities\OrderUtil;

/**
 * Read-only data store for the registered customers who have an order from a vendor.
 *
 * @since 5.3.4
 */
class VendorCustomerStore extends BaseDataStore {

    /**
     * {@inheritDoc}
     */
    protected function get_fields_with_format(): array {
        return [];
    }

    /**
     * {@inheritDoc}
     */
    public function get_table_name(): string {
        return OrderUtil::get_order_table_name();
    }

    /**
     * Get the SQL selecting a vendor's customer IDs, for use in an `IN ( ... )` clause.
     *
     * Matches dokan_customer_has_order_from_this_seller() defaults, without the dokan_get_vendor_orders_* filters.
     *
     * @since 5.3.4
     *
     * @param int $seller_id Seller ID.
     *
     * @return string Prepared, single-column SELECT of user IDs, or `SELECT 0` when there can be none.
     */
    public function get_customer_ids_sql_by_seller( int $seller_id ): string {
        global $wpdb;

        $statuses = array_keys( wc_get_order_statuses() );
        if ( ! $seller_id || empty( $statuses ) ) {
            return 'SELECT 0';
        }

        $placeholders = implode( ',', array_fill( 0, count( $statuses ), '%s' ) );
        $this->clear_all_clauses();

        // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
        if ( OrderUtil::is_hpos_enabled() ) {
            $this->add_sql_clause( 'select', 'DISTINCT o.customer_id' );
            $this->add_sql_clause( 'from', $this->get_table_name() . ' o' );
            $this->add_sql_clause( 'join', 'INNER JOIN ' . OrderUtil::get_table_for_order_meta() . " m ON m.order_id = o.id AND m.meta_key = '_dokan_vendor_id'" );
            $this->add_sql_clause( 'where', $wpdb->prepare( ' AND m.meta_value = %s', (string) $seller_id ) );
            $this->add_sql_clause( 'where', " AND o.type = 'shop_order' AND o.customer_id > 0" );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND o.status IN ({$placeholders})", $statuses ) );
        } else {
            $this->add_sql_clause( 'select', 'DISTINCT CAST( cu.meta_value AS UNSIGNED )' );
            $this->add_sql_clause( 'from', $this->get_table_name() . ' p' );
            $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->postmeta} v ON v.post_id = p.ID AND v.meta_key = '_dokan_vendor_id'" );
            $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->postmeta} cu ON cu.post_id = p.ID AND cu.meta_key = '_customer_user'" );
            $this->add_sql_clause( 'where', $wpdb->prepare( ' AND v.meta_value = %s', (string) $seller_id ) );
            $this->add_sql_clause( 'where', " AND p.post_type = 'shop_order' AND cu.meta_value > 0" );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND p.post_status IN ({$placeholders})", $statuses ) );
        }
        // phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

        // Assembled from the unfiltered clauses: this is an access check, so WooCommerce's analytics clause filters must not change it.
        return sprintf(
            'SELECT %s FROM %s %s WHERE 1=1 %s',
            $this->get_sql_clause( 'select' ),
            $this->get_sql_clause( 'from' ),
            $this->get_sql_clause( 'join' ),
            $this->get_sql_clause( 'where' )
        );
    }
}
