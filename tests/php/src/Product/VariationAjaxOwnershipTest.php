<?php

namespace WeDevs\Dokan\Test\Product;

use WeDevs\Dokan\Product\Hooks;
use WeDevs\Dokan\Test\DokanTestCase;
use WPAjaxDieStopException;

/**
 * A vendor must not run WooCommerce's variation AJAX on another vendor's product.
 *
 * @group product
 */
class VariationAjaxOwnershipTest extends DokanTestCase {

    /**
     * Whether the check stops the request for the given user and POST payload.
     */
    protected function is_denied( int $user_id, array $post ): bool {
        wp_set_current_user( $user_id );
        $_POST = $post;

        $die = static function () {
            return static function () {
                throw new WPAjaxDieStopException( 'denied' );
            };
        };
        add_filter( 'wp_die_handler', $die );
        add_filter( 'wp_die_ajax_handler', $die );

        try {
            dokan_get_container()->get( Hooks::class )->block_variation_ajax_on_foreign_products();

            return false;
        } catch ( WPAjaxDieStopException $e ) {
            return true;
        } finally {
            remove_filter( 'wp_die_handler', $die );
            remove_filter( 'wp_die_ajax_handler', $die );
            $_POST = [];
        }
    }

    /**
     * A product with one variation, both owned by the given vendor.
     */
    protected function create_variable_product( int $vendor_id ): array {
        $product_id   = self::factory()->post->create( [ 'post_type' => 'product', 'post_author' => $vendor_id ] ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
        $variation_id = self::factory()->post->create( [ 'post_type' => 'product_variation', 'post_parent' => $product_id, 'post_author' => $vendor_id ] ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

        return [ $product_id, $variation_id ];
    }

    public function test_only_the_owner_and_store_admins_pass(): void {
        [ $victim_product, $victim_variation ] = $this->create_variable_product( $this->seller_id1 );
        [ $attacker_product ]                  = $this->create_variable_product( $this->seller_id2 );

        // Every way the six handlers name their target: save/bulk/load, add/link, delete, and a foreign variation under an owned product.
        $payloads = [
            'product_id'       => [ 'product_id' => $victim_product ],
            'post_id'          => [ 'post_id' => $victim_product ],
            'variation_ids'    => [ 'variation_ids' => [ $victim_variation ] ],
            'variable_post_id' => [
                'product_id'       => $attacker_product,
                'variable_post_id' => [ $victim_variation ],
            ],
        ];

        $admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );

        foreach ( $payloads as $name => $payload ) {
            $this->assertTrue( $this->is_denied( $this->seller_id2, $payload ), "$name: another vendor must be denied" );
            $this->assertFalse( $this->is_denied( $admin_id, $payload ), "$name: a store admin must pass" );
        }

        $this->assertFalse( $this->is_denied( $this->seller_id1, [ 'product_id' => $victim_product, 'variable_post_id' => [ $victim_variation ] ] ), 'the owner must pass' ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
    }

    public function test_the_check_runs_before_woocommerce_on_all_six_actions(): void {
        $hooks = dokan_get_container()->get( Hooks::class );

        foreach ( [ 'load_variations', 'save_variations', 'bulk_edit_variations', 'add_variation', 'link_all_variations', 'remove_variations' ] as $action ) {
            $this->assertSame( 1, has_action( 'wp_ajax_woocommerce_' . $action, [ $hooks, 'block_variation_ajax_on_foreign_products' ] ), $action );
        }
    }
}
