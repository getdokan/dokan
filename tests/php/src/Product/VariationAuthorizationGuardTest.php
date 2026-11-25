<?php

namespace WeDevs\Dokan\Test\Product;

use WeDevs\Dokan\Product\VariationAuthorizationGuard;
use WeDevs\Dokan\Test\DokanTestCase;
use WPAjaxDieStopException;

/**
 * A vendor must not touch another vendor's variations through WooCommerce's
 * variation AJAX handlers (getdokan/dokan-pro#6414 — PS-19/20/21/24 + link).
 *
 * The guard methods are invoked directly with a throwing `wp_die` handler
 * rather than through `_handleAjax()`, so the assertions don't depend on the
 * WooCommerce admin bootstrap the AJAX dispatcher would run.
 *
 * @group product
 * @group ajax
 */
class VariationAuthorizationGuardTest extends DokanTestCase {

    /**
     * Owner of the product under attack.
     *
     * @var int
     */
    protected $victim_id;

    /**
     * The attacking vendor.
     *
     * @var int
     */
    protected $attacker_id;

    /**
     * Victim's variable product.
     *
     * @var int
     */
    protected $product_id;

    /**
     * Victim's variation ids.
     *
     * @var int[]
     */
    protected $variation_ids = [];

    /**
     * The guard under test.
     *
     * @var VariationAuthorizationGuard
     */
    protected $guard;

    public function set_up() {
        parent::set_up();

        $this->victim_id   = $this->factory()->seller->create();
        $this->attacker_id = $this->factory()->seller->create();

        // The guard only reads post_author and post_parent, so plain posts are
        // enough — and they skip WC_Product::save(), whose woocommerce_new_product
        // hook trips an unrelated WC 11.3 deprecation notice in this harness.
        $this->product_id = wp_insert_post(
            [
                'post_type'   => 'product',
                'post_status' => 'publish',
                'post_title'  => 'Victim Variable',
                'post_author' => $this->victim_id,
            ]
        );
        wp_set_object_terms( $this->product_id, 'variable', 'product_type' );

        foreach ( [ 0, 1 ] as $index ) {
            $this->variation_ids[] = wp_insert_post(
                [
                    'post_type'   => 'product_variation',
                    'post_status' => 'publish',
                    'post_parent' => $this->product_id,
                    'post_author' => $this->victim_id,
                    'menu_order'  => $index,
                ]
            );
        }

        $this->guard = new VariationAuthorizationGuard();
    }

    /**
     * A product the attacker legitimately owns, for the foreign-id vector.
     *
     * @return int
     */
    protected function attacker_product(): int {
        $product_id = wp_insert_post(
            [
                'post_type'   => 'product',
                'post_status' => 'publish',
                'post_title'  => 'Attacker Own',
                'post_author' => $this->attacker_id,
            ]
        );
        wp_set_object_terms( $product_id, 'variable', 'product_type' );

        return $product_id;
    }

    public function tear_down() {
        $_POST = [];
        parent::tear_down();
    }

    /**
     * Run a guard method and report whether it denied the request.
     *
     * @param string $method Guard method name.
     *
     * @return bool True when the guard called `wp_die( -1 )`.
     */
    protected function denies( string $method ): bool {
        $handler = static function () {
            return static function ( $message ) {
                throw new WPAjaxDieStopException( (string) $message ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Not output; the message is carried on a test exception.
            };
        };

        add_filter( 'wp_die_ajax_handler', $handler );
        add_filter( 'wp_die_handler', $handler );

        try {
            $this->guard->{$method}();
        } catch ( WPAjaxDieStopException $e ) {
            return '-1' === $e->getMessage();
        } finally {
            remove_filter( 'wp_die_ajax_handler', $handler );
            remove_filter( 'wp_die_handler', $handler );
        }

        return false;
    }

    /**
     * The product-id payloads WooCommerce's handlers accept, one per vector.
     *
     * @return array<string, array{0:array}>
     */
    public function product_id_vectors(): array {
        return [
            'save (PS-19)'    => [ [ 'product_id' => true ] ],
            'bulk (PS-20)'    => [
				[
					'product_id' => true,
					'bulk_action' => 'variable_regular_price',
					'data' => [ 'value' => '0.01' ],
				],
			],
            'add (PS-24)'     => [
				[
					'post_id' => true,
					'loop' => 0,
				],
			],
            'link'            => [ [ 'post_id' => true ] ],
            'load'            => [ [ 'product_id' => true ] ],
        ];
    }

    /**
     * @dataProvider product_id_vectors
     * @test
     *
     * @param array $payload Payload shape; `true` is replaced with the victim product id.
     */
    public function a_vendor_cannot_touch_another_vendors_product( array $payload ): void {
        wp_set_current_user( $this->attacker_id );

        foreach ( [ 'product_id', 'post_id' ] as $key ) {
            if ( isset( $payload[ $key ] ) ) {
                $payload[ $key ] = $this->product_id;
            }
        }

        $_POST = $payload;

        $this->assertTrue( $this->denies( 'guard_product_action' ), 'a non-owner must be denied' );
    }

    /**
     * WooCommerce's save loop writes every variable_post_id without checking
     * its parent, so an owned product_id must not smuggle a foreign variation.
     *
     * @test
     */
    public function a_vendor_cannot_save_a_foreign_variation_under_their_own_product(): void {
        wp_set_current_user( $this->attacker_id );

        $_POST = [
            'product_id'       => $this->attacker_product(),
            'variable_post_id' => [ $this->variation_ids[0] ],
        ];

        $this->assertTrue( $this->denies( 'guard_product_action' ), 'a foreign variable_post_id must be denied' );
    }

    /**
     * @test
     */
    public function the_guard_hooks_every_variation_action(): void {
        $this->guard->register_hooks();

        $product_actions = [ 'add_variation', 'link_all_variations', 'save_variations', 'bulk_edit_variations', 'load_variations' ];

        foreach ( $product_actions as $action ) {
            $this->assertSame( 1, has_action( "wp_ajax_woocommerce_{$action}", [ $this->guard, 'guard_product_action' ] ), "woocommerce_{$action} must be guarded at priority 1" );
        }

        $this->assertSame( 1, has_action( 'wp_ajax_woocommerce_remove_variations', [ $this->guard, 'guard_remove_variations' ] ), 'remove_variations must be guarded at priority 1' );
    }

    /**
     * @test
     */
    public function a_vendor_cannot_delete_another_vendors_variation(): void {
        wp_set_current_user( $this->attacker_id );

        $_POST = [ 'variation_ids' => [ $this->variation_ids[0] ] ];

        $this->assertTrue( $this->denies( 'guard_remove_variations' ), 'a non-owner delete must be denied' );
        $this->assertSame( 'product_variation', get_post_type( $this->variation_ids[0] ), 'the variation must survive' );
    }

    /**
     * @test
     */
    public function the_product_owner_is_not_blocked(): void {
        wp_set_current_user( $this->victim_id );

        $_POST = [ 'product_id' => $this->product_id ];
        $this->assertFalse( $this->denies( 'guard_product_action' ), 'the owner must pass the guard' );

        $_POST = [ 'variation_ids' => [ $this->variation_ids[0] ] ];
        $this->assertFalse( $this->denies( 'guard_remove_variations' ), 'the owner must pass the delete guard' );
    }

    /**
     * @test
     */
    public function a_store_admin_is_not_blocked(): void {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        // The admin edits another vendor's product in wp-admin; the guard defers to WooCommerce.
        $_POST = [ 'product_id' => $this->product_id ];

        $this->assertFalse( $this->denies( 'guard_product_action' ), 'a manage_woocommerce user must not be blocked' );
    }
}
