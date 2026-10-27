<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Server;
use WeDevs\Dokan\Abilities\Mcp\Transport;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Application_Passwords;
use WP_Error;
use WP_REST_Response;

/**
 * @group abilities
 * @group mcp
 *
 * The transport's authorization decision, in the order it is made, and the two ways WordPress
 * and WooCommerce sign a client in before it runs.
 */
class TransportTest extends DokanTestCase {

    /**
     * `$_SERVER` before the test touched it; core only restores it in its own suite.
     *
     * @var array
     */
    private array $server_backup = [];

    public function set_up() {
        parent::set_up();

        if ( ! class_exists( '\WP\MCP\Transport\HttpTransport' ) ) {
            $this->markTestSkipped( 'The MCP adapter is not loaded.' );
        }

        $this->server_backup = $_SERVER;

        RequestContext::reset();
        wp_set_current_user( 0 );
    }

    public function tear_down() {
        $_SERVER = $this->server_backup;

        parent::tear_down();
    }

    public function test_a_switched_off_server_refuses_everyone_the_same_way() {
        wp_set_current_user( $this->admin_id );

        $result = Transport::authorize();

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_mcp_disabled', $result->get_error_code() );
    }

    public function test_nobody_signed_in_is_a_401_naming_basic_auth() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $result = Transport::authorize();

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_mcp_unauthorized', $result->get_error_code() );
        $this->assertSame( 401, $result->get_error_data()['status'] );
        $this->assertNotFalse( has_filter( 'rest_post_dispatch', [ Transport::class, 'add_challenge_header' ] ) );

        $response = Transport::add_challenge_header( new WP_REST_Response() );

        $this->assertSame( 'Basic realm="Dokan MCP"', $response->get_headers()['WWW-Authenticate'] );
    }

    public function test_a_store_admin_may_connect_and_the_ability_context_is_flagged() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        wp_set_current_user( $this->admin_id );

        $this->assertTrue( Transport::authorize() );
        $this->assertTrue( RequestContext::is_ability_context() );
    }

    public function test_a_vendor_needs_vendor_access() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        wp_set_current_user( $this->seller_id1 );

        $denied = Transport::authorize();

        $this->assertInstanceOf( WP_Error::class, $denied );
        $this->assertSame( 'dokan_mcp_not_allowed', $denied->get_error_code() );
        $this->assertSame( 403, $denied->get_error_data()['status'] );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( Transport::authorize() );
        $this->assertTrue( RequestContext::is_vendor_ability_context() );
    }

    public function test_a_customer_is_never_allowed() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );
        wp_set_current_user( $this->customer_id );

        $denied = Transport::authorize();

        $this->assertInstanceOf( WP_Error::class, $denied );
        $this->assertSame( 'dokan_mcp_not_allowed', $denied->get_error_code() );
    }

    /**
     * WordPress core resolves an application password on `determine_current_user`; the transport
     * only ever sees the user that produced.
     */
    public function test_wordpress_signs_a_client_in_with_an_application_password() {
        add_filter( 'wp_is_application_passwords_available', '__return_true' );
        // Core only honours application passwords on REST (or XML-RPC) requests; PHPUnit is neither.
        add_filter( 'application_password_is_api_request', '__return_true' );

        $created = WP_Application_Passwords::create_new_application_password( $this->seller_id1, [ 'name' => 'Claude Code' ] );

        $this->assertIsArray( $created );

        $_SERVER['PHP_AUTH_USER'] = get_userdata( $this->seller_id1 )->user_login;
        $_SERVER['PHP_AUTH_PW']   = $created[0];

        $this->assertSame( $this->seller_id1, (int) apply_filters( 'determine_current_user', 0 ) );

        $_SERVER['PHP_AUTH_PW'] = 'not-the-password';

        $this->assertSame( 0, (int) apply_filters( 'determine_current_user', 0 ) );
    }

    /**
     * WooCommerce resolves a consumer key and secret on the routes it owns; the MCP route is
     * declared one of them.
     */
    public function test_woocommerce_signs_a_client_in_with_a_rest_api_key() {
        if ( ! class_exists( 'WC_REST_Authentication' ) ) {
            $this->markTestSkipped( 'WooCommerce REST authentication is not loaded.' );
        }

        global $wpdb;

        $server          = new Server();
        $consumer_key    = 'ck_' . wc_rand_hash();
        $consumer_secret = 'cs_' . wc_rand_hash();

        $wpdb->insert(
            $wpdb->prefix . 'woocommerce_api_keys',
            [
                'user_id'         => $this->admin_id,
                'description'     => 'Claude Code',
                'permissions'     => 'read_write',
                'consumer_key'    => wc_api_hash( $consumer_key ),
                'consumer_secret' => $consumer_secret,
                'truncated_key'   => substr( $consumer_key, -7 ),
            ]
        );

        $_SERVER['HTTPS']         = 'on';
        $_SERVER['REQUEST_URI']   = '/wp-json/dokan/mcp';
        $_SERVER['PHP_AUTH_USER'] = $consumer_key;
        $_SERVER['PHP_AUTH_PW']   = $consumer_secret;

        $this->assertTrue( $server->accept_woocommerce_api_keys( false ) );
        $this->assertSame( $this->admin_id, (int) apply_filters( 'determine_current_user', 0 ) );

        // WooCommerce's own answer is never overturned, and other Dokan routes stay out of it.
        $this->assertTrue( $server->accept_woocommerce_api_keys( true ) );

        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/v1/stores';

        $this->assertFalse( $server->accept_woocommerce_api_keys( false ) );
        $this->assertSame( 0, (int) apply_filters( 'determine_current_user', 0 ) );

        $wpdb->delete( $wpdb->prefix . 'woocommerce_api_keys', [ 'consumer_key' => wc_api_hash( $consumer_key ) ] );
    }

    public function test_the_server_only_answers_requests_to_its_endpoint() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $_SERVER['REQUEST_URI'] = '/wp-json/wc/store/v1/cart';
        $this->assertFalse( Server::serves_this_request() );

        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/mcp';
        $this->assertTrue( Server::serves_this_request() );

        remove_all_filters( 'dokan_mcp_enabled' );
        $this->assertFalse( Server::serves_this_request() );
    }
}
