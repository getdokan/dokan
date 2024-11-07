<?php

namespace WeDevs\Dokan\Test\CustomAssertion;

/**
 * Trait DBAssertionTrait
 *
 * Provides database assertion methods for unit testing.
 */
trait DBAssertionTrait {
    /**
     * Get the count of rows in a given table matching the specified criteria.
     *
     * @param string $table The name of the table (without the prefix).
     * @param array  $data  An associative array of field-value pairs to match.
     * @return int The count of rows matching the criteria.
     */
    protected function getDatabaseCount( string $table, array $data ): int {
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

        if ( ! str_starts_with( $table, $wpdb->prefix ) ) {
            $table = $wpdb->prefix . $table;
        }

        $sql = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE $placeholders ",
            array_values( $data )
        );

        $rows_count = $wpdb->get_var( $sql );

        return $rows_count;
    }

    /**
     * Assert that a table contains at least one row matching the specified criteria.
     *
     * @param string $table The name of the table (without the prefix).
     * @param array  $data  An associative array of field-value pairs to match.
     * @return void
     */
    public function assertDatabaseHas( string $table, array $data = [] ): void {
        $rows_count = $this->getDatabaseCount( $table, $data );

        $this->assertGreaterThanOrEqual( 1, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }

    /**
     * Assert that a table contains the specified number of rows matching the criteria.
     *
     * @param string $table The name of the table (without the prefix).
     * @param int    $count The expected number of matching rows.
     * @param array  $data  An associative array of field-value pairs to match.
     * @return void
     */
    public function assertDatabaseCount( string $table, int $count, array $data = [] ): void {
        $rows_count = $this->getDatabaseCount( $table, $data );

        $this->assertEquals( $count, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }

    public function assertDatabaseMissing( string $table, array $data = [] ): void {
        $rows_count = $this->getDatabaseCount( $table, $data );

        $this->assertGreaterThanOrEqual( 0, $rows_count, "{$rows_count} rows found in `$table` for given data " . json_encode( $data ) );
    }
}
