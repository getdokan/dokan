<?php

namespace WeDevs\Dokan\Test\Product;

use WeDevs\Dokan\Product\ProductAttribute;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Covers ProductAttribute::contains_php_object(): the probe that keeps serialized PHP objects out of
 * product meta so a later maybe_unserialize() cannot revive them (PHP object injection).
 *
 * @group core-feature
 * @group dokan-security
 */
class ProductAttributeObjectTest extends DokanTestCase {

	public function test_detects_a_top_level_serialized_object() {
		$this->assertTrue( ProductAttribute::contains_php_object( serialize( new \stdClass() ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
	}

	public function test_detects_an_object_nested_inside_a_serialized_array() {
		$payload = serialize( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
			[
				'pa_color' => [ 'value' => 'red|blue' ],
				'evil'     => new \stdClass(),
			]
		);

		$this->assertTrue( ProductAttribute::contains_php_object( $payload ) );
	}

	public function test_detects_a_whitespace_prefixed_serialized_object() {
		// A leading space still counts as serialized, so the probe must trim too or it misses the object.
		$this->assertTrue( ProductAttribute::contains_php_object( ' ' . serialize( new \stdClass() ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$this->assertTrue( ProductAttribute::contains_php_object( "\n" . serialize( new \stdClass() ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
	}

	public function test_detects_a_whitespace_prefixed_array_nested_object() {
		$payload = serialize( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
			[
				'pa_color' => [ 'value' => 'red|blue' ],
				'evil'     => new \stdClass(),
			]
		);

		$this->assertTrue( ProductAttribute::contains_php_object( "\t" . $payload ) );
	}

	public function test_detects_an_object_wrapped_in_further_serialized_strings() {
		// Every extra serialized layer is only one more decode away from a live object.
		$once = serialize( serialize( new \stdClass() ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize

		$this->assertTrue( ProductAttribute::contains_php_object( $once ) );
		$this->assertTrue( ProductAttribute::contains_php_object( serialize( $once ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$this->assertFalse( ProductAttribute::contains_php_object( serialize( serialize( [ 'color' => 'red' ] ) ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
	}

	public function test_judges_a_value_that_only_looks_serialized_without_a_php_warning() {
		$this->assertFalse( ProductAttribute::contains_php_object( 'O:8:"stdClass":9:{}' ) );
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

		$this->assertFalse( ProductAttribute::contains_php_object( $payload ) );
	}

	public function test_passes_plain_and_scalar_values() {
		$this->assertFalse( ProductAttribute::contains_php_object( 'red|blue' ) );
		$this->assertFalse( ProductAttribute::contains_php_object( '' ) );
		$this->assertFalse( ProductAttribute::contains_php_object( serialize( 42 ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$this->assertFalse(
			ProductAttribute::contains_php_object(
				[
					'a' => 1,
					'b' => [ 2, 3 ],
				]
			)
		);
	}
}
