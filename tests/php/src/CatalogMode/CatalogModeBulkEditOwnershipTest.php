<?php

namespace WeDevs\Dokan\Test\CatalogMode;

use WeDevs\Dokan\CatalogMode\Dashboard\ProductBulkEdit;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Ownership guard for the catalog-mode product bulk-edit handler.
 *
 * Covers the cross-vendor IDOR (audit L9 / plugin-internal-tasks#2151): the vendor-dashboard
 * bulk edit wrote `_dokan_catalog_mode` meta to caller-supplied product ids with no ownership
 * check, while the sibling bulk-delete handler already guards each id.
 *
 * @since DOKAN_SINCE
 *
 * @group catalog-mode
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\CatalogMode\Dashboard\ProductBulkEdit::save_bulk_edit_catalog_mode_data
 */
class CatalogModeBulkEditOwnershipTest extends DokanTestCase {

    /**
     * Product owned by the caller (vendor A).
     *
     * @var int
     */
    protected int $own_product;

    /**
     * Product owned by another vendor (vendor B).
     *
     * @var int
     */
    protected int $foreign_product;

    public function set_up() {
        parent::set_up();

        update_option(
            'dokan_selling',
            [
                'catalog_mode_hide_add_to_cart_button' => 'on',
                'catalog_mode_hide_product_price'      => 'on',
            ]
        );

        $this->own_product = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name'          => 'Own Product',
                    'regular_price' => '10',
                ]
            );

        $this->foreign_product = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create(
                [
                    'name'          => 'Foreign Product',
                    'regular_price' => '20',
                ]
            );
    }

    /**
     * Vendor A cannot toggle catalog mode on Vendor B's product; their own product is still toggled.
     */
    public function test_vendor_cannot_toggle_catalog_mode_on_foreign_product() {
        wp_set_current_user( $this->seller_id1 );

        // The handler ends in wp_safe_redirect()+exit(); throw from the redirect filter to catch it.
        add_filter( 'wp_redirect', [ $this, 'block_redirect' ] );
        try {
            ( new ProductBulkEdit() )->save_bulk_edit_catalog_mode_data(
                'enable_catalog_mode',
                [ $this->own_product, $this->foreign_product ]
            );
            $this->fail( 'The handler should have redirected (and exited).' );
        } catch ( \RuntimeException $e ) {
            $this->assertSame( 'dokan_test_redirect', $e->getMessage() );
        } finally {
            remove_filter( 'wp_redirect', [ $this, 'block_redirect' ] );
        }

        $this->assertNotEmpty(
            get_post_meta( $this->own_product, '_dokan_catalog_mode', true ),
            'Vendor should toggle catalog mode on their own product.'
        );
        $this->assertEmpty(
            get_post_meta( $this->foreign_product, '_dokan_catalog_mode', true ),
            'Vendor must not toggle catalog mode on another vendor\'s product.'
        );
    }

    /**
     * Stand-in for the handler's wp_safe_redirect()+exit(), so the test can assert afterwards.
     */
    public function block_redirect( $location ) {
        throw new \RuntimeException( 'dokan_test_redirect' );
    }

    public function tear_down() {
        wp_set_current_user( 0 );
        parent::tear_down();
    }
}
