<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Product\Drafts;
use WeDevs\Dokan\CJDropshipping\Product\OffSale;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * CJ products go to Draft when CJ goes away, and vendors put them back (B9).
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class OffSaleTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        Schema::install();
        as_unschedule_all_actions( OffSale::DRAFT_HOOK );
    }

    protected function cj_product( int $vendor_id, string $status, string $vid ): int {
        $product_id = $this->factory()->product->create(
            [
				'post_author' => $vendor_id,
				'post_status' => $status,
			]
        );
        // The factory may ignore post_status; set it for real.
        wp_update_post(
            [
				'ID'          => $product_id,
				'post_status' => $status,
			]
        );
        ( new LinkRepository() )->link( $product_id, $product_id, $vendor_id, $vid, 'P-' . $vid );

        return $product_id;
    }

    public function test_disconnect_drafts_every_cj_product_and_restore_puts_each_back() {
        $published = $this->cj_product( $this->seller_id1, 'publish', 'V1' );
        $pending   = $this->cj_product( $this->seller_id1, 'pending', 'V2' );
        $other     = $this->cj_product( $this->seller_id2, 'publish', 'V3' );
        $plain     = $this->factory()->product->create( [ 'post_status' => 'publish' ] );

        ( new OffSale() )->on_disconnect();
        $this->assertTrue( Queue::is_pending( OffSale::DRAFT_HOOK ) );
        ( new OffSale() )->draft_batch( 'disconnected', 0 );

        foreach ( [ $published, $pending, $other ] as $id ) {
            $this->assertSame( 'draft', get_post_status( $id ) );
        }
        $this->assertSame( 'publish', get_post_status( $plain ) );

        $this->assertSame( 2, ( new OffSale() )->restore( $this->seller_id1 ) );
        $this->assertSame( 'publish', get_post_status( $published ) );
        $this->assertSame( 'pending', get_post_status( $pending ) );
        $this->assertSame( 'draft', get_post_status( $other ), 'Only the vendor\'s own products' );
        $this->assertSame( '', get_post_meta( $published, Drafts::DRAFT_REASON_META, true ) );
    }

    public function test_loss_drafts_are_not_restored_by_the_bulk_action() {
        $product_id = $this->cj_product( $this->seller_id1, 'publish', 'V4' );
        Drafts::move( $product_id, 'loss' );

        ( new OffSale() )->draft_batch( 'disconnected', 0 );

        $this->assertSame( 'loss', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ), 'First reason kept' );
        $this->assertSame( 0, ( new OffSale() )->restore( $this->seller_id1 ) );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
    }

    public function test_turning_cj_off_queues_the_drafting() {
        ( new OffSale() )->on_settings_saved( Settings::OPTION, [ 'enabled' => 'on' ], [ 'enabled' => 'off' ] );
        $this->assertFalse( Queue::is_pending( OffSale::DRAFT_HOOK ) );

        ( new OffSale() )->on_settings_saved( Settings::OPTION, [ 'enabled' => 'off' ], [ 'enabled' => 'on' ] );
        $this->assertTrue( Queue::is_pending( OffSale::DRAFT_HOOK ) );
    }
}
