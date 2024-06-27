<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\Factories\DokanFactory;
use WP_UnitTestCase;

abstract class DokanTestCase extends WP_UnitTestCase {
	/**
	 * @
     * 
	 *
	 * @return DokanFactory The fixture factory.
	 */
	protected static function factory() {
		static $factory = null;
		if ( ! $factory ) {
			$factory = new DokanFactory();
		}
		return $factory;
	}

    protected function getDatabaseCount( string $table, array $data ) {
        global $wpdb;

        $placeholder = '%d';

        if ( count($data) ) {
            // $data = ['field1' => 'val1', 'field1' => 'val1'];
            $separator = "='%s' and ";
            $placeholder = implode( $separator , array_keys($data)); // $placeholder = "field1='%s' and field2";
            $placeholder = $placeholder . "='%s' "; // $placeholder = "field1='%s' and field2='%s' ";

        } else {
            $data = [1];
        }

        $sql = $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}{$table} WHERE $placeholder ", array_values($data)
        );

        $rows_count = $wpdb->get_var( $sql );

        return $rows_count;
    }


    public function assertDatabaseHas( string $table, array $data = [] ) {
        $rows_count = $this->getDatabaseCount($table, $data);

        $this->assertGreaterThanOrEqual(1, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }

    public function assertDatabaseCount( string $table, int $count,  array $data = [] ) {
        $rows_count = $this->getDatabaseCount($table, $data);

        $this->assertEquals($count, $rows_count, "No rows found in `$table` for given data " . json_encode( $data ) );
    }
}