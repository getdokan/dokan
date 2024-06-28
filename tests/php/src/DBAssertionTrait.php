<?php

namespace WeDevs\Dokan\Test;

trait DBAssertionTrait {
    protected function getDatabaseCount( string $table, array $data ) {
        global $wpdb;

        $placeholders = '%d';

        if ( count( $data ) ) {
            // $data = ['field1' => 'val1', 'field1' => 'val1'];
            // $placeholders = "field1='%s' AND field2='%s' ";
            $placeholders = implode(
                ' AND ', array_map(
                    function ( $key ) {
                        return "{$key} = %s";
                    }, array_keys( $data )
                )
            );
        } else {
            $data = [ 1 ];
        }

        $sql = $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}{$table} WHERE $placeholders ",
            array_values( $data )
        );

        $rows_count = $wpdb->get_var( $sql );

        return $rows_count;
    }

    public function assertDatabaseHas( string $table, array $data = [] ) {
        $rows_count = $this->getDatabaseCount( $table, $data );

        $this->assertGreaterThanOrEqual( 1, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }

    public function assertDatabaseCount( string $table, int $count, array $data = [] ) {
        $rows_count = $this->getDatabaseCount( $table, $data );

        $this->assertEquals( $count, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }
}
