<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Covers dokan_data_has_object(): the probe that keeps serialized PHP objects out of product meta,
 * blocking PHP object injection at the REST write boundary (getdokan/dokan-pro#6158, CVE-2026-89433).
 *
 * @group core-feature
 * @group dokan-security
 */
class DataHasObjectTest extends DokanTestCase {

	public function test_detects_a_top_level_serialized_object() {
		$this->assertTrue( dokan_data_has_object( serialize( new \stdClass() ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
	}

	public function test_detects_an_object_nested_inside_a_serialized_array() {
		$payload = serialize( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
			[
				'pa_color' => [ 'value' => 'red|blue' ],
				'evil'     => new \stdClass(),
			]
		);

		$this->assertTrue( dokan_data_has_object( $payload ) );
	}

	public function test_passes_a_legitimate_serialized_attribute_array() {
		$payload = serialize( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
			[
				'pa_color' => [
					'name'  => 'Color',
					'value' => 'red|blue',
				],
			]
		);

		$this->assertFalse( dokan_data_has_object( $payload ) );
	}

	public function test_passes_plain_and_scalar_values() {
		$this->assertFalse( dokan_data_has_object( 'red|blue' ) );
		$this->assertFalse( dokan_data_has_object( '' ) );
		$this->assertFalse( dokan_data_has_object( serialize( 42 ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$this->assertFalse( dokan_data_has_object( [ 'a' => 1, 'b' => [ 2, 3 ] ] ) );
	}
}
