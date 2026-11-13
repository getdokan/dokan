<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Product\Drafts;
use WeDevs\Dokan\CJDropshipping\Product\Importer;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Security\Crypto;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\CJDropshipping\Sync\Synchronizer;
use WeDevs\Dokan\CJDropshipping\Sync\Webhooks;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Scheduled sync and CJ webhooks.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class SyncTest extends DokanTestCase {

    // What the fake CJ answers for product P1.
    protected array $cj = [];

    protected int $calls = 0;

    public function set_up() {
        parent::set_up();

        Schema::install();
        update_option(
            Settings::OPTION, [
				'enabled'      => 'on',
				'stock_source' => 'all',
			]
        );
        update_option(
            Status::OPTION, [
				'state'        => Status::CONNECTED,
				'active_since' => time(),
			]
        );
        update_option(
            Credentials::OPTION, [
				'access_token'   => Crypto::encrypt( 'fake_access_token_1' ),
				'access_expires' => time() + 100 * DAY_IN_SECONDS,
				'open_id'        => Crypto::encrypt( '123' ),
			]
        );
        delete_option( Points::OPTION );
        delete_user_meta( $this->seller_id1, Alerts::META );

        $this->cj    = [
            'code'  => 200,
            'cost'  => 2.0,
            'stock' => 50,
        ];
        $this->calls = 0;

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'dokan_cj_email_vendor_alerts', '__return_false' );
        add_filter( 'pre_http_request', [ $this, 'fake_cj' ], 10, 3 );
    }

    public function fake_cj( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        ++$this->calls;

        if ( 200 !== $this->cj['code'] ) {
            $body = [
				'code'    => $this->cj['code'],
				'message' => 'x',
			];
        } elseif ( false !== strpos( $url, 'getInventoryByPid' ) ) {
            $body = [
                'code' => 200,
                'data' => [
					'variantInventories' => [
						[
							'vid'       => 'V1',
							'inventory' => [
								[
									'countryCode'      => 'CN',
									'cjInventory'      => 0,
									'factoryInventory' => $this->cj['stock'],
								],
							],
						],
					],
				],
            ];
        } else {
            $body = [
                'code' => 200,
                'data' => [
                    'pid'      => 'P1',
                    'status'   => '3',
                    'variants' => [
						[
							'vid'              => 'V1',
							'variantSku'       => 'CJ-V1',
							'variantSellPrice' => $this->cj['cost'],
						],
					],
                ],
            ];
        }

        return [
            'headers'  => [],
            'body'     => wp_json_encode( $body ),
            'response' => [ 'code' => 200 ],
            'cookies'  => [],
        ];
    }

    protected function import_product(): int {
        wp_set_current_user( $this->seller_id1 );
        $category = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

        return ( new Importer() )->import(
            $this->seller_id1, [
				'pid'          => 'P1',
				'vids'         => [ 'V1' ],
				'prices'       => [ 'V1' => 10 ],
				'category_ids' => [ $category ],
			]
        );
    }

    protected function make_stale(): void {
        ( new VariantRepository() )->save( 'V1', [ 'synced_at' => gmdate( 'Y-m-d H:i:s', time() - 2 * DAY_IN_SECONDS ) ] );
    }

    public function test_batch_updates_stock_of_stale_products_only() {
        $product_id = $this->import_product();
        $this->cj['stock'] = 20;

        // Just imported, so fresh: nothing to do.
        $this->assertSame( 0, ( new Synchronizer() )->run_batch() );

        $this->make_stale();
        $this->assertSame( 1, ( new Synchronizer() )->run_batch() );
        $this->assertSame( 15, wc_get_product( $product_id )->get_stock_quantity() );
    }

    public function test_batch_stops_when_background_points_are_reserved() {
        $this->import_product();
        $this->make_stale();
        update_option(
            Points::OPTION, [
				'remaining'   => 20000,
				'total'       => 50000,
				'recorded_at' => time(),
			]
        );
        $calls = $this->calls;

        $this->assertSame( 0, ( new Synchronizer() )->run_batch() );
        $this->assertSame( $calls, $this->calls );
    }

    public function test_cost_rise_that_causes_a_loss_moves_product_to_draft() {
        $product_id = $this->import_product();
        $status     = get_post_status( $product_id );
        $this->cj['cost'] = 15.0;

        ( new Synchronizer() )->sync_product( 'P1' );

        $this->assertSame( 'draft', get_post_status( $product_id ) );
        $this->assertSame( $status, get_post_meta( $product_id, Drafts::PREV_STATUS_META, true ) );
        $this->assertSame( 'loss', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ) );
        $this->assertArrayHasKey( 'loss:' . $product_id, Alerts::all( $this->seller_id1 ) );

        // Vendor raises the price and publishes again: alert gone.
        wp_update_post(
            [
				'ID'          => $product_id,
				'post_status' => 'publish',
			]
        );
        $this->assertArrayNotHasKey( 'loss:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }

    public function test_product_cj_stopped_selling_goes_out_of_stock() {
        $product_id = $this->import_product();
        $status     = get_post_status( $product_id );
        $this->cj['code'] = 1602001;

        ( new Synchronizer() )->sync_product( 'P1' );

        $product = wc_get_product( $product_id );
        $this->assertSame( 'outofstock', $product->get_stock_status() );
        $this->assertSame( $status, get_post_status( $product_id ), 'Removed by CJ is out of stock, not Draft' );
        $this->assertNotEmpty( get_post_meta( $product_id, Synchronizer::REMOVED_META, true ) );
        $this->assertArrayHasKey( 'removed:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }

    public function test_two_failed_checks_alert_but_keep_product_on_sale() {
        $product_id = $this->import_product();
        $this->cj['code'] = 1605003;

        ( new Synchronizer() )->sync_product( 'P1' );
        $this->assertArrayNotHasKey( 'sync_failed:' . $product_id, Alerts::all( $this->seller_id1 ) );

        ( new Synchronizer() )->sync_product( 'P1' );
        $this->assertArrayHasKey( 'sync_failed:' . $product_id, Alerts::all( $this->seller_id1 ) );
        $this->assertSame( 'instock', wc_get_product( $product_id )->get_stock_status() );

        // Next good check clears it.
        $this->cj['code'] = 200;
        ( new Synchronizer() )->sync_product( 'P1' );
        $this->assertArrayNotHasKey( 'sync_failed:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }

    public function test_webhook_signature_matches_cj_docs_test_vector() {
        $body = '{"messageId":"123111","messageType":"INSERT","params":"123","type":"PRODUCT"}';

        $this->assertTrue( Webhooks::is_signed( $body, 'AHxoGFMoS/4mZfJ5vFes5//Pz2QibFQhh3GlrTtnWpk=' ) );
        $this->assertFalse( Webhooks::is_signed( $body, 'forged' ) );
        $this->assertFalse( Webhooks::is_signed( $body . ' ', 'AHxoGFMoS/4mZfJ5vFes5//Pz2QibFQhh3GlrTtnWpk=' ) );
    }

    public function test_signed_stock_push_for_linked_product_queues_one_check() {
        $this->import_product();
        $this->make_stale();
        as_unschedule_all_actions( Synchronizer::PRODUCT_HOOK );

        $body    = wp_json_encode(
            [
				'messageId'   => 'm-1',
				'type'        => 'STOCK',
				'messageType' => 'UPDATE',
				'params'      => [
					'V1'      => [
						[
							'vid'        => 'V1',
							'storageNum' => 3,
						],
					],
					'UNKNOWN' => [],
				],
			]
        );
        $request = new WP_REST_Request( 'POST', '/dokan/v1/cj-dropshipping/webhook' );
        $request->set_body( $body );
        $request->set_header( 'sign', base64_encode( hash_hmac( 'sha256', $body, '123', true ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

        $this->assertSame( 200, rest_do_request( $request )->get_status() );
        $this->assertTrue( Queue::is_pending( Synchronizer::PRODUCT_HOOK, [ 'pid' => 'P1' ] ) );

        // Same message again, or an unsigned one: answered, ignored.
        as_unschedule_all_actions( Synchronizer::PRODUCT_HOOK );
        rest_do_request( $request );
        $request->set_header( 'sign', 'forged' );
        $this->assertSame( 200, rest_do_request( $request )->get_status() );
        $this->assertFalse( Queue::is_pending( Synchronizer::PRODUCT_HOOK, [ 'pid' => 'P1' ] ) );
    }

    public function test_removed_product_leaves_queue_head_and_does_not_realert() {
        $product_id = $this->import_product();
        $this->make_stale();
        $this->cj['code'] = 1602001;

        ( new Synchronizer() )->run_batch();
        $this->assertSame( [], array_filter( ( new VariantRepository() )->due_for_sync( 10 ), fn( $row ) => strtotime( $row['synced_at'] . ' UTC' ) < time() - HOUR_IN_SECONDS ) );

        Alerts::clear( $this->seller_id1, 'removed', $product_id );
        ( new Synchronizer() )->sync_product( 'P1' );
        $this->assertArrayNotHasKey( 'removed:' . $product_id, Alerts::all( $this->seller_id1 ) );

        wp_set_current_user( $this->admin_id );
        $data = rest_get_server()->response_to_data( rest_do_request( new WP_REST_Request( 'GET', '/wc/v3/products/' . $product_id ) ), false );
        $this->assertTrue( $data['dokan_cj']['removed'] );

        // CJ lists it again: back in stock, mark and alert gone.
        $this->cj['code'] = 200;
        ( new Synchronizer() )->sync_product( 'P1' );
        $this->assertSame( 'instock', wc_get_product( $product_id )->get_stock_status() );
        $this->assertSame( '', get_post_meta( $product_id, Synchronizer::REMOVED_META, true ) );
    }

    public function test_server_error_counts_as_failure_and_does_not_stop_batch() {
        $this->import_product();
        $this->make_stale();
        $this->cj['code'] = 1605003;

        $this->assertTrue( ( new Synchronizer() )->sync_product( 'P1' ) );
        $this->assertSame( 1, (int) ( new VariantRepository() )->get( 'V1' )['sync_failures'] );

        // Account-wide trouble stops the batch without blaming the product.
        $this->cj['code'] = 1600005;
        $this->assertFalse( ( new Synchronizer() )->sync_product( 'P1' ) );
    }

    public function test_webhook_request_skips_fresh_products_and_waits_for_stale_ones() {
        $this->import_product();
        as_unschedule_all_actions( Synchronizer::PRODUCT_HOOK );

        Synchronizer::request( 'P1' );
        $this->assertFalse( Queue::is_pending( Synchronizer::PRODUCT_HOOK, [ 'pid' => 'P1' ] ) );

        $this->make_stale();
        Synchronizer::request( 'P1' );
        $next = as_next_scheduled_action( Synchronizer::PRODUCT_HOOK, [ 'pid' => 'P1' ], Queue::GROUP );
        $this->assertGreaterThan( time() + 5 * MINUTE_IN_SECONDS, $next );
    }
}
