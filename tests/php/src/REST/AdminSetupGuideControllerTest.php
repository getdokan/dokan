<?php
/**
 * Admin Setup Guide Controller Test
 *
 * Regression tests to ensure REST responses keep the expected
 * array-of-elements shape (matching the static admin-setup-data.json contract).
 *
 * @package WeDevs\Dokan\Test\REST
 */
namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group rest-api
 * @group field-migration
 * @group field-factory
 * @group rest-api-admin-setup-guide
 */
class AdminSetupGuideControllerTest extends DokanTestCase {
	/**
	 * REST namespace for admin endpoints.
	 *
	 * @var string
	 */
	protected $namespace = 'dokan/v1/admin';

	/**
	 * Rest base for this controller.
	 *
	 * @var string
	 */
	protected $rest_base = 'setup-guide';

	/**
	 * Set up test environment.
	 *
	 * @return void
	 */
	public function set_up(): void {
		parent::set_up();

		// Ensure admin can access admin REST endpoints.
		$admin = get_user_by( 'id', $this->admin_id );
		if ( $admin ) {
			$admin->add_cap( 'manage_woocommerce' );
		}

		wp_set_current_user( $this->admin_id );
	}

	/**
	 * Get expected field/subsection IDs for each step.
	 *
	 * IMPORTANT: keep these in sync with the setup-guide UI contract.
	 * We intentionally do NOT read JSON fixture files here because those
	 * may be removed in the future.
	 *
	 * @return array
	 */
	private function get_expected_step_child_ids_from_static( string $step_id ): array {
		$map = [
			'basic'      => [
				'shipping_fee_recipient',
				'tax_fee_recipient',
				'shipping_tax_fee_recipient',
				'order_status_change',
				'new_seller_enable_selling',
			],
			'commission' => [
				'commission_type',
				'admin_commission',
				'reset_sub_category_when_edit_all_category',
				'commission_category_based_values',
			],
			'withdraw'   => [
				'paypal',
				'bank',
				'skrill',
				'withdraw_limit',
				'withdraw_order_status',
			],
			'appearance' => [
				'store-info',
				'vendor-info',
			],
		];

		return $map[ $step_id ] ?? [];
	}

	/**
	 * Get expected children specs for each step.
	 *
	 * Each spec can include:
	 * - type (required)
	 * - variant (optional, for fields)
	 *
	 * @param string $step_id Step id.
	 *
	 * @return array<string, array<string, string>>
	 */
	private function get_expected_step_children_spec( string $step_id ): array {
		$map = [
			'basic'      => [
				'shipping_fee_recipient'     => [
					'type' => 'field',
					'variant' => 'radio_box',
				],
				'tax_fee_recipient'          => [
					'type' => 'field',
					'variant' => 'radio_box',
				],
				'shipping_tax_fee_recipient' => [
					'type' => 'field',
					'variant' => 'radio_box',
				],
				'order_status_change'        => [
					'type' => 'field',
					'variant' => 'switch',
				],
				'new_seller_enable_selling'  => [
					'type' => 'field',
					'variant' => 'switch',
				],
			],
			'commission' => [
				'commission_type'                           => [
					'type' => 'field',
					'variant' => 'select',
				],
				'admin_commission'                           => [
					'type' => 'field',
					'variant' => 'combine_input',
				],
				'reset_sub_category_when_edit_all_category' => [
					'type' => 'field',
					'variant' => 'switch',
				],
				'commission_category_based_values'           => [
					'type' => 'field',
					'variant' => 'category_based_commission',
				],
			],
			'withdraw'   => [
				'paypal'                => [
					'type' => 'field',
					'variant' => 'switch',
				],
				'bank'                  => [
					'type' => 'field',
					'variant' => 'switch',
				],
				'skrill'                => [
					'type' => 'field',
					'variant' => 'switch',
				],
				'withdraw_limit'         => [
					'type' => 'field',
					'variant' => 'currency',
				],
				'withdraw_order_status'  => [
					'type' => 'field',
					'variant' => 'multicheck',
				],
			],
			'appearance' => [
				'store-info'  => [ 'type' => 'subsection' ],
				'vendor-info' => [ 'type' => 'subsection' ],
			],
		];

		return $map[ $step_id ] ?? [];
	}

	/**
	 * Assert the element has the minimum required shape.
	 *
	 * @param array $element Element data.
	 *
	 * @return void
	 */
	private function assert_element_base_shape( array $element ): void {
		$this->assertArrayHasKey( 'id', $element );
		$this->assertArrayHasKey( 'type', $element );
		$this->assertArrayHasKey( 'hook_key', $element );
		$this->assertArrayHasKey( 'dependency_key', $element );
		$this->assertArrayHasKey( 'dependencies', $element );
		$this->assertArrayHasKey( 'children', $element );

		$this->assertIsArray( $element['dependencies'] );
		$this->assertIsArray( $element['children'] );
	}

	/**
	 * Ensure response is a numerically indexed array of elements.
	 *
	 * @param mixed $data Response data.
	 *
	 * @return void
	 */
	private function assert_is_list_of_elements( $data ): void {
		$this->assertIsArray( $data );
		$this->assertNotEmpty( $data );

		// Must be a "list" (0..n). If keys are strings, JSON becomes object and frontend breaks.
		$this->assertSame( array_keys( $data ), range( 0, count( $data ) - 1 ) );

		$first = $data[0] ?? null;
		$this->assertIsArray( $first );
		$this->assertArrayHasKey( 'id', $first );
		$this->assertArrayHasKey( 'type', $first );
	}

	/**
	 * Test if the endpoint exists.
	 *
	 * @test
	 */
	public function test_endpoint_exists(): void {
		$routes     = $this->server->get_routes( $this->namespace );
		$full_route = $this->get_route( $this->rest_base );

		$this->assertArrayHasKey( $full_route, $routes );
	}

	/**
	 * @dataProvider step_id_provider
	 *
	 * @test
	 *
	 * @param string $step_id Step id.
	 */
	public function test_get_step_returns_array_of_elements_matching_static_structure( string $step_id ): void {
		$response = $this->get_request( "/{$this->rest_base}/{$step_id}" );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assert_is_list_of_elements( $data );

		// First element should be the step section wrapper.
		$first = $data[0];
		$this->assertEquals( $step_id, $first['id'] );
		$this->assertEquals( 'section', $first['type'] );
		$this->assert_element_base_shape( $first );

		$expected_ids = $this->get_expected_step_child_ids_from_static( $step_id );
		$this->assertNotEmpty( $expected_ids, 'Static expected ids should not be empty.' );

		$children = $first['children'] ?? [];
		$actual_ids = array_map(
			static function ( $el ) {
				return is_array( $el ) ? (string) ( $el['id'] ?? '' ) : '';
			},
			$children
		);

		// Compare ids in order (static JSON is the contract).
		$this->assertSame( $expected_ids, $actual_ids );

		// Compare each expected child element basic shape + type/variant.
		$spec = $this->get_expected_step_children_spec( $step_id );
		$this->assertNotEmpty( $spec );

		foreach ( $children as $child ) {
			$this->assertIsArray( $child );
			$this->assert_element_base_shape( $child );
		}

		foreach ( $spec as $id => $expected ) {
			$found = null;
			foreach ( $children as $child ) {
				if ( isset( $child['id'] ) && $child['id'] === $id ) {
					$found = $child;
					break;
				}
			}

			$this->assertNotNull( $found, sprintf( 'Expected child "%s" not found for step "%s".', $id, $step_id ) );
			$this->assertSame( $expected['type'], $found['type'] );

			if ( isset( $expected['variant'] ) ) {
				$this->assertArrayHasKey( 'variant', $found );
				$this->assertSame( $expected['variant'], $found['variant'] );
			}

			// category_based_commission field must include categories + reset_subcategory (legacy contract).
			if ( 'commission_category_based_values' === $id ) {
				$this->assertArrayHasKey( 'categories', $found );
				$this->assertIsArray( $found['categories'] );
				$this->assertArrayHasKey( 'reset_subcategory', $found );
			}
		}
	}

	/**
	 * @dataProvider step_id_provider
	 *
	 * @test
	 *
	 * @param string $step_id Step id.
	 */
	public function test_post_step_returns_array_of_elements( string $step_id ): void {
		$get_response = $this->get_request( "/{$this->rest_base}/{$step_id}" );
		$this->assertEquals( 200, $get_response->get_status() );
		$payload = $get_response->get_data();

		// POST expects settings element array payload.
		$post_response = $this->post_request( "/{$this->rest_base}/{$step_id}", (array) $payload );
		$this->assertEquals( 200, $post_response->get_status() );

		$data = $post_response->get_data();
		$this->assert_is_list_of_elements( $data );
	}

	/**
	 * Step IDs covered by static admin-setup-data.json.
	 *
	 * @return array[]
	 */
	public function step_id_provider(): array {
		return [
			'basic'      => [ 'basic' ],
			'commission' => [ 'commission' ],
			'withdraw'   => [ 'withdraw' ],
			'appearance' => [ 'appearance' ],
		];
	}
}
