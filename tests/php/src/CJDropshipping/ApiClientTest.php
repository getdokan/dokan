<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Admin\Monitor;
use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Client;
use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Connection;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Security\Crypto;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * CJ API client, credentials, points and connection status.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class ApiClientTest extends DokanTestCase {

    /**
     * Queued fake responses: [ path fragment, http status, body array ].
     *
     * @var array[]
     */
    protected array $responses = [];

    /**
     * Requested URLs.
     *
     * @var string[]
     */
    protected array $requested = [];

    public function set_up() {
        parent::set_up();

        $this->responses = [];
        $this->requested = [];

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'pre_http_request', [ $this, 'fake_http' ], 10, 3 );

        delete_option( Credentials::OPTION );
        delete_option( Status::OPTION );
        delete_option( Points::OPTION );
    }

    public function tear_down() {
        remove_filter( 'pre_http_request', [ $this, 'fake_http' ], 10 );

        parent::tear_down();
    }

    public function fake_http( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        $this->requested[] = $url;

        foreach ( $this->responses as $index => [ $fragment, $status, $body ] ) {
            if ( false !== strpos( $url, $fragment ) ) {
                unset( $this->responses[ $index ] );

                return [
                    'headers'  => [],
                    'body'     => wp_json_encode( $body ),
                    'response' => [
                        'code'    => $status,
                        'message' => '',
                    ],
                    'cookies'  => [],
                ];
            }
        }

        return new \WP_Error( 'unexpected', 'Unexpected CJ call: ' . $url );
    }

    protected function queue( string $fragment, array $body, int $status = 200 ): void {
        $this->responses[] = [ $fragment, $status, $body ];
    }

    protected function connect(): void {
        $this->queue(
            'authentication/getAccessToken', [
				'code' => 200,
				'data' => [
					'openId'                 => 123,
					'accessToken'            => 'fake_access_token_1',
					'refreshToken'           => 'fake_refresh_token_1',
					'accessTokenExpiryDate'  => gmdate( 'c', time() + 100 * DAY_IN_SECONDS ),
					'refreshTokenExpiryDate' => gmdate( 'c', time() + 100 * DAY_IN_SECONDS ),
				],
			]
        );
        $this->queue(
            'setting/get', [
				'code' => 200,
				'data' => [
					'openName'  => 'Marketplace',
					'openEmail' => 'cj@example.com',
				],
			]
        );

        ( new Connection() )->connect( 'fake_api_key_123@api@abc' );
    }

    public function test_crypto_round_trip_and_tamper_detection() {
        $stored = Crypto::encrypt( 'fake_api_key_123' );

        $this->assertStringNotContainsString( 'fake_api_key_123', $stored );
        $this->assertSame( 'fake_api_key_123', Crypto::decrypt( $stored ) );
        $this->assertNull( Crypto::decrypt( substr( $stored, 0, -4 ) . 'AAAA' ) );
        $this->assertNull( Crypto::decrypt( 'plain-text' ) );
    }

    public function test_connect_stores_encrypted_secrets_and_masks_key() {
        $this->connect();

        $raw = get_option( Credentials::OPTION );

        $this->assertStringNotContainsString( 'fake_api_key_123', $raw['api_key'] );
        $this->assertSame( 'fake_access_token_1', Credentials::get( 'access_token' ) );
        $this->assertSame( '123', Credentials::get( 'open_id' ) );
        $this->assertTrue( Status::is_connected() );

        $summary = ( new Connection() )->summary();

        $this->assertSame( 'Marketplace', $summary['account_name'] );
        $this->assertStringNotContainsString( 'api@abc', $summary['masked_key'] );
    }

    public function test_unreadable_credentials_ask_admin_to_reconnect() {
        $this->connect();

        $raw                 = get_option( Credentials::OPTION );
        $raw['access_token'] = 'dcj1:' . base64_encode( str_repeat( 'x', 40 ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
        update_option( Credentials::OPTION, $raw, false );

        try {
            ( new Client() )->get( 'product/query', [ 'pid' => '1' ] );
            $this->fail( 'Expected an exception.' );
        } catch ( ApiException $e ) {
            $this->assertSame( ApiException::AUTH_FAILED, $e->get_reason() );
        }

        $this->assertSame( Status::NEEDS_RECONNECT, Status::get_state() );
    }

    public function test_points_info_is_recorded_and_data_unwrapped() {
        $this->connect();
        $this->queue(
            'product/query', [
				'code'       => 200,
				'data'       => [ 'pid' => 'p1' ],
				'pointsInfo' => [
					'usedToday' => 10,
					'remaining' => 49990,
					'total'     => 50000,
				],
			]
        );

        $data = ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ] );

        $this->assertSame( [ 'pid' => 'p1' ], $data );
        $this->assertSame( 49990, Points::get()['remaining'] );
    }

    /**
     * @dataProvider error_codes
     */
    public function test_error_codes_map_to_reasons( int $http, int $code, string $reason ) {
        $this->connect();
        $this->queue(
            'product/query', [
				'code'      => $code,
				'message'   => 'x',
				'requestId' => 'r1',
			], $http
        );

        try {
            ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ] );
            $this->fail( 'Expected an exception.' );
        } catch ( ApiException $e ) {
            $this->assertSame( $reason, $e->get_reason() );
            $this->assertSame( 'r1', $e->get_request_id() );
        }
    }

    public function error_codes(): array {
        return [
            'points exhausted (429 body)' => [ 429, 429, ApiException::POINTS_EXHAUSTED ],
            'points exhausted (appendix)' => [ 200, 16900500, ApiException::POINTS_EXHAUSTED ],
            'qps'                         => [ 429, 1600200, ApiException::RATE_LIMITED ],
            'not found'                   => [ 200, 1602001, ApiException::NOT_FOUND ],
            'param error'                 => [ 200, 1600300, ApiException::INVALID_REQUEST ],
            'suspended'                   => [ 200, 1600014, ApiException::SUSPENDED ],
        ];
    }

    public function test_suspension_blocks_calls_and_emails_admin_once() {
        $this->connect();
        $emails = 0;
        add_action(
            'dokan_cj_suspended', function () use ( &$emails ) {
				++$emails;
			}
        );
        $this->queue(
            'product/query', [
				'code'    => 1600014,
				'message' => 'disabled',
			]
        );

        try {
            ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ] );
        } catch ( ApiException $e ) {
            $this->assertSame( ApiException::SUSPENDED, $e->get_reason() );
        }

        $this->assertSame( Status::SUSPENDED, Status::get_state() );

        // No network call while suspended.
        $calls = count( $this->requested );
        try {
            ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ] );
        } catch ( ApiException $e ) {
            $this->assertSame( ApiException::SUSPENDED, $e->get_reason() );
        }
        $this->assertCount( $calls, $this->requested );

        // A failed recheck the same day doesn't email again.
        $this->queue(
            'setting/get', [
				'code'    => 1600014,
				'message' => 'disabled',
			]
        );
        try {
            ( new Connection() )->check();
        } catch ( ApiException $e ) {
            $this->assertSame( ApiException::SUSPENDED, $e->get_reason() );
        }

        $this->assertSame( 1, $emails );
    }

    public function test_auth_error_refreshes_token_and_retries_once() {
        $this->connect();
        $this->queue(
            'product/query', [
				'code'    => 1600001,
				'message' => 'expired',
			]
        );
        $this->queue(
            'authentication/refreshAccessToken', [
				'code' => 200,
				'data' => [
					'accessToken'           => 'fake_access_token_2',
					'refreshToken'          => 'fake_refresh_token_2',
					'accessTokenExpiryDate' => gmdate( 'c', time() + 180 * DAY_IN_SECONDS ),
				],
			]
        );
        $this->queue(
            'product/query', [
				'code' => 200,
				'data' => [ 'pid' => 'p1' ],
			]
        );

        $this->assertSame( [ 'pid' => 'p1' ], ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ] ) );
        $this->assertSame( 'fake_access_token_2', Credentials::get( 'access_token' ) );
    }

    public function test_points_reserve_keeps_budget_for_checkout() {
        update_option(
            Points::OPTION, [
				'used_today'  => 38000,
				'remaining'   => 12000,
				'total'       => 50000,
				'recorded_at' => time(),
			]
        );

        $this->assertTrue( Points::can_spend( 10, Points::CHECKOUT ) );
        $this->assertTrue( Points::can_spend( 10, Points::STOCK ) );
        $this->assertFalse( Points::can_spend( 50, Points::INTERACTIVE ) );
        $this->assertFalse( Points::can_spend( 10, Points::BACKGROUND ) );
    }

    public function test_points_refill_per_minute_up_to_total() {
        update_option(
            Points::OPTION, [
				'used_today'  => 50000,
				'remaining'   => 0,
				'total'       => 1440,
				'recorded_at' => time() - 10 * MINUTE_IN_SECONDS,
			]
        );

        $this->assertSame( 10, Points::estimated_remaining() );

        update_option(
            Points::OPTION, [
				'remaining'   => 1400,
				'total'       => 1440,
				'recorded_at' => time() - DAY_IN_SECONDS,
			]
        );

        $this->assertSame( 1440, Points::estimated_remaining() );
    }

    public function test_background_call_without_points_does_not_hit_cj() {
        $this->connect();
        update_option(
            Points::OPTION, [
				'remaining'   => 100,
				'total'       => 50000,
				'recorded_at' => time(),
			]
        );
        $calls = count( $this->requested );

        try {
            ( new Client() )->get( 'product/query', [ 'pid' => 'p1' ], Points::BACKGROUND );
            $this->fail( 'Expected an exception.' );
        } catch ( ApiException $e ) {
            $this->assertSame( ApiException::POINTS_EXHAUSTED, $e->get_reason() );
            $this->assertTrue( $e->is_temporary() );
        }

        $this->assertCount( $calls, $this->requested );
    }

    public function test_notices_follow_connection_state() {
        update_option( Settings::OPTION, [ 'enabled' => 'on' ] );
        wp_set_current_user( $this->admin_id );
        $monitor = new Monitor();

        $this->assertSame( [], $monitor->add_notices( [] ) );

        Status::mark_suspended();
        $notices = $monitor->add_notices( [] );
        $this->assertSame( 'global', $notices[0]['scope'] );
        $this->assertSame( Connection::REACTIVATE_URL, $notices[0]['actions'][0]['action'] );

        Status::mark_connected();
        update_option( Status::OPTION, array_merge( Status::raw(), [ 'active_since' => time() - 26 * DAY_IN_SECONDS ] ), false );
        $this->assertSame( 'warning', $monitor->add_notices( [] )[0]['type'] );

        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( [], $monitor->add_notices( [] ) );
    }

    public function test_disconnect_forgets_credentials() {
        $this->connect();
        $fired = did_action( 'dokan_cj_disconnected' );

        ( new Connection() )->disconnect();

        $this->assertFalse( Credentials::has_key() );
        $this->assertSame( Status::DISCONNECTED, Status::get_state() );
        $this->assertSame( $fired + 1, did_action( 'dokan_cj_disconnected' ) );
    }
}
