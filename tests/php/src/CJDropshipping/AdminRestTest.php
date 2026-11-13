<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Admin\SettingsSchema;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Admin CJ connection endpoints and settings schema.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class AdminRestTest extends DokanTestCase {

    protected string $route = '/dokan/v1/admin/cj-dropshipping/connection';

    public function set_up() {
        parent::set_up();

        delete_option( Credentials::OPTION );
        delete_option( Status::OPTION );
        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter(
            'pre_http_request', function ( $pre, $args, $url ) {
				if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
					return $pre;
				}

				$body = false !== strpos( $url, 'getAccessToken' )
                ? [
					'code' => 1600005,
					'message' => 'bad key',
				]
                : [ 'code' => 200 ];

				return [
					'headers'  => [],
					'body'     => wp_json_encode( $body ),
					'response' => [ 'code' => 200 ],
					'cookies'  => [],
				];
			}, 10, 3
        );
    }

    public function test_vendor_cannot_read_or_change_the_connection() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( 403, rest_do_request( new WP_REST_Request( 'GET', $this->route ) )->get_status() );

        $request = new WP_REST_Request( 'POST', $this->route );
        $request->set_param( 'api_key', 'fake_api_key_123' );
        $this->assertSame( 403, rest_do_request( $request )->get_status() );
        $this->assertSame( 403, rest_do_request( new WP_REST_Request( 'DELETE', $this->route ) )->get_status() );
    }

    public function test_admin_reads_connection_without_secrets() {
        wp_set_current_user( $this->admin_id );

        $response = rest_do_request( new WP_REST_Request( 'GET', $this->route ) );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'disconnected', $response->get_data()['state'] );
        $this->assertArrayNotHasKey( 'api_key', $response->get_data() );
    }

    public function test_rejected_key_returns_actionable_error_and_stays_disconnected() {
        wp_set_current_user( $this->admin_id );

        $request = new WP_REST_Request( 'POST', $this->route );
        $request->set_param( 'api_key', 'fake_api_key_123' );
        $response = rest_do_request( $request );

        $this->assertSame( 400, $response->get_status() );
        $this->assertSame( 'dokan_cj_auth_failed', $response->as_error()->get_error_code() );
        $this->assertFalse( Credentials::has_key() );
        $this->assertSame( Status::DISCONNECTED, Status::get_state() );
    }

    public function test_schema_adds_cj_subpage_with_unique_ids() {
        $elements = ( new SettingsSchema() )->append_schema( [] );
        $ids      = array_column( $elements, 'id' );

        $this->assertContains( 'cj_dropshipping', $ids );
        $this->assertContains( 'cj_connection', $ids );
        $this->assertSame( count( $ids ), count( array_unique( $ids ) ) );
    }
}
