<?php

namespace WeDevs\Dokan\Test\Upgrade;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Upgrade\Upgrades\V_5_0_0;

/**
 * The 5.0.0 data update changes the order stats table with a single ALTER TABLE.
 *
 * The statement is captured through the `query` filter instead of being run: DDL would commit
 * the test transaction and change the real table.
 *
 * @group upgrade
 */
class OrderStatsUpgradeTest extends DokanTestCase {

    /**
     * Columns hidden from SHOW COLUMNS, so the upgrader believes they are missing.
     *
     * @var string[]
     */
    private $hidden_columns = [];

    /**
     * ALTER TABLE statements the upgrader sent.
     *
     * @var string[]
     */
    private $alter_statements = [];

    public function set_up() {
        parent::set_up();

        $this->hidden_columns   = [];
        $this->alter_statements = [];

        add_filter( 'query', [ $this, 'fake_schema_queries' ] );
    }

    public function tear_down() {
        remove_filter( 'query', [ $this, 'fake_schema_queries' ] );

        parent::tear_down();
    }

    public function fake_schema_queries( $query ) {
        global $wpdb;

        if ( $this->hidden_columns && 0 === strpos( $query, "SHOW COLUMNS FROM `{$wpdb->prefix}dokan_order_stats`" ) ) {
            return $query . " WHERE Field NOT IN ('" . implode( "','", $this->hidden_columns ) . "')";
        }

        if ( 0 === strpos( $query, 'ALTER TABLE' ) ) {
            $this->alter_statements[] = $query;

            return 'SELECT 1';
        }

        return $query;
    }

    public function table_state_provider() {
        return [
            'table from before 5.0.0' => [ [ 'vendor_shipping_tax', 'vendor_order_tax', 'admin_earning', 'admin_shipping_tax', 'admin_order_tax' ] ],
            'half updated table'      => [ [ 'vendor_order_tax', 'admin_order_tax' ] ],
            'already updated table'   => [ [] ],
        ];
    }

    /**
     * @dataProvider table_state_provider
     */
    public function test_missing_columns_are_added_in_one_statement( array $missing_columns ) {
        global $wpdb;

        $table_name    = $wpdb->prefix . 'dokan_order_stats';
        $fresh_columns = $wpdb->get_col( "SHOW COLUMNS FROM `{$table_name}`", 0 ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

        $this->hidden_columns = $missing_columns;

        V_5_0_0::alter_dokan_order_stats_table_and_regenerate();

        $this->assertCount( 1, $this->alter_statements );

        $statement = $this->alter_statements[0];

        $this->assertStringStartsWith( "ALTER TABLE `{$table_name}` ", $statement );
        $this->assertSame( count( $missing_columns ), substr_count( $statement, 'ADD COLUMN' ) );
        $this->assertSame( 1, substr_count( $statement, 'MODIFY COLUMN `order_type`' ) );

        foreach ( $missing_columns as $column ) {
            // Each column goes where a fresh install has it.
            $after = $fresh_columns[ array_search( $column, $fresh_columns, true ) - 1 ];

            $this->assertStringContainsString( "ADD COLUMN `{$column}` double NOT NULL DEFAULT '0' AFTER `{$after}`", $statement );
        }
    }
}
