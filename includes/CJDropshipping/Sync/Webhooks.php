<?php

namespace WeDevs\Dokan\CJDropshipping\Sync;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Catalog;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\Contracts\Hookable;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Optional CJ pushes: product and stock changes trigger an early check (F4, F8).
 *
 * @since DOKAN_SINCE
 */
class Webhooks implements Hookable {

    public const OPTION = 'dokan_cj_webhooks';

    // CJ pushes changes for at most this many products per account; the rest are checked daily.
    public const LIMIT = 1000;

    // CJ caps request bodies far below this; anything bigger is not CJ.
    private const MAX_BODY = 262144;

    protected LinkRepository $links;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param LinkRepository|null $links Links.
     */
    public function __construct( ?LinkRepository $links = null ) {
        $this->links = $links ?? new LinkRepository();
    }

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'rest_api_init', [ $this, 'register_route' ] );
        add_action( 'dokan_cj_product_imported', [ $this, 'subscribe_imported' ], 10, 3 );
        add_action( 'dokan_cj_before_disconnect', [ $this, 'cancel' ] );
        add_action( 'dokan_cj_disconnected', [ $this, 'forget' ] );
        add_action( 'before_delete_post', [ $this, 'unsubscribe_deleted' ], 5 );
    }

    /**
     * Public route CJ posts to.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_route(): void {
        register_rest_route(
            'dokan/v1',
            '/cj-dropshipping/webhook',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'receive' ],
                'permission_callback' => '__return_true',
            ]
        );
    }

    /**
     * Webhook URL to give CJ.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function url(): string {
        return rest_url( 'dokan/v1/cj-dropshipping/webhook' );
    }

    /**
     * Whether a push really comes from our CJ account.
     *
     * @since DOKAN_SINCE
     *
     * @param string $body      Raw request body.
     * @param string $signature `sign` header.
     *
     * @return bool
     */
    public static function is_signed( string $body, string $signature ): bool {
        $open_id = Credentials::get( 'open_id' );

        if ( ! $open_id || '' === $signature ) {
            return false;
        }

        // CJ signs the raw body: base64( HMAC-SHA256( openId, body ) ).
        $expected = base64_encode( hash_hmac( 'sha256', $body, (string) $open_id, true ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

        return hash_equals( $expected, $signature );
    }

    /**
     * Take a push: always answer 200 fast; act only on verified pushes about linked products.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response
     */
    public function receive( $request ) {
        $ok   = new WP_REST_Response(
            [
                'code'    => 200,
                'result'  => 'success',
                'message' => 'ok',
            ],
            200
        );
        $body = (string) $request->get_body();

        // CJ's registration test and anything unverified get 200 and nothing else.
        if ( strlen( $body ) > self::MAX_BODY || ! self::is_signed( $body, (string) $request->get_header( 'sign' ) ) ) {
            return $ok;
        }

        $message = json_decode( $body, true );

        if ( ! is_array( $message ) || empty( $message['messageId'] ) ) {
            return $ok;
        }

        $seen_key = 'dokan_cj_msg_' . md5( (string) $message['messageId'] );

        if ( get_transient( $seen_key ) ) {
            return $ok;
        }

        set_transient( $seen_key, 1, DAY_IN_SECONDS );

        foreach ( $this->products_in( $message ) as $pid ) {
            Synchronizer::request( $pid );
        }

        return $ok;
    }

    /**
     * CJ products a push is about that some vendor here sells.
     *
     * @since DOKAN_SINCE
     *
     * @param array $message Decoded push.
     *
     * @return string[]
     */
    protected function products_in( array $message ): array {
        $params   = is_array( $message['params'] ?? null ) ? $message['params'] : [];
        $type     = strtoupper( (string) ( $message['type'] ?? '' ) );
        $variants = new VariantRepository();
        $pids     = [];

        if ( 'PRODUCT' === $type && ! empty( $params['pid'] ) ) {
            $pids[] = (string) $params['pid'];
        } elseif ( 'VARIANT' === $type && ! empty( $params['vid'] ) ) {
            $variant = $variants->get( (string) $params['vid'] );
            $pids[]  = $variant ? $variant['pid'] : '';
        } elseif ( 'STOCK' === $type ) {
            // Keyed by vid; trust nothing in it except which variants changed.
            foreach ( array_keys( $params ) as $vid ) {
                $variant = $variants->get( (string) $vid );
                $pids[]  = $variant ? $variant['pid'] : '';
            }
        }

        return array_values(
            array_filter(
                array_unique( $pids ),
                fn( $pid ) => '' !== $pid && $this->links->for_cj_product( $pid )
            )
        );
    }

    /**
     * Products CJ can push changes for.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function limit(): int {
        return max( 0, (int) apply_filters( 'dokan_cj_webhook_product_limit', self::LIMIT ) );
    }

    /**
     * Point CJ's pushes here and subscribe the first linked products, up to CJ's limit (F4, F8).
     *
     * @since DOKAN_SINCE
     *
     * @return array Registration summary.
     * @throws ApiException When CJ refuses.
     */
    public function register(): array {
        $catalog = new Catalog();
        $catalog->register_webhooks( self::url() );

        $pids   = array_slice( array_map( 'strval', $this->links_cj_products() ), 0, self::limit() );
        $failed = $pids ? $catalog->subscribe( $pids ) : [];

        $state = [
            'registered_at' => time(),
            'url'           => self::url(),
            'failed'        => count( $failed ),
            'pids'          => array_values( array_diff( $pids, array_map( 'strval', $failed ) ) ),
        ];

        update_option( self::OPTION, $state, false );

        return self::summary();
    }

    /**
     * What the admin's status box shows; null when pushes are off.
     *
     * @since DOKAN_SINCE
     *
     * @return array|null registered_at, url, subscribed, failed, linked, limit.
     */
    public static function summary(): ?array {
        $state = get_option( self::OPTION );

        if ( ! is_array( $state ) ) {
            return null;
        }

        return [
            'registered_at' => (int) ( $state['registered_at'] ?? 0 ),
            'url'           => (string) ( $state['url'] ?? '' ),
            'subscribed'    => count( (array) ( $state['pids'] ?? [] ) ),
            'failed'        => (int) ( $state['failed'] ?? 0 ),
            'linked'        => count( ( new self() )->links_cj_products() ),
            'limit'         => self::limit(),
        ];
    }

    /**
     * Subscribe CJ products while there is room under CJ's limit.
     *
     * @since DOKAN_SINCE
     *
     * @param string[] $candidates CJ product ids, in the order they should get a slot.
     *
     * @return void
     */
    protected function fill( array $candidates ): void {
        $state = get_option( self::OPTION );

        if ( ! is_array( $state ) ) {
            return;
        }

        $current = array_map( 'strval', (array) ( $state['pids'] ?? [] ) );
        $room    = self::limit() - count( $current );
        $new     = array_slice( array_values( array_diff( array_map( 'strval', $candidates ), $current ) ), 0, max( 0, $room ) );

        if ( ! $new ) {
            return;
        }

        try {
            $failed = array_map( 'strval', ( new Catalog() )->subscribe( $new ) );
        } catch ( ApiException $e ) {
            dokan_log( '[CJ Dropshipping] Webhook subscribe failed: ' . $e->getMessage(), 'error' );

            return;
        }

        $state['pids'] = array_values( array_merge( $current, array_diff( $new, $failed ) ) );
        update_option( self::OPTION, $state, false );
    }

    /**
     * Subscribe a newly imported product when webhooks are on and CJ's limit has room.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $product_id Product id.
     * @param int    $vendor_id  Vendor id.
     * @param string $pid        CJ product id.
     *
     * @return void
     */
    public function subscribe_imported( $product_id, $vendor_id, $pid ): void {
        $this->fill( [ (string) $pid ] );
    }

    /**
     * Ask CJ to stop pushing to this site, while the account is still known.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function cancel(): void {
        if ( ! get_option( self::OPTION ) ) {
            return;
        }

        try {
            ( new Catalog() )->cancel_webhooks( self::url() );
        } catch ( ApiException $e ) {
            dokan_log( '[CJ Dropshipping] Webhook cancel failed: ' . $e->getMessage(), 'error' );
        }
    }

    /**
     * Unsubscribe a CJ product when its last linked product is deleted (CJ caps subscriptions).
     *
     * @since DOKAN_SINCE
     *
     * @param int $post_id Post being deleted.
     *
     * @return void
     */
    public function unsubscribe_deleted( $post_id ): void {
        $link = $this->links->get( (int) $post_id );

        if ( ! $link || ! get_option( self::OPTION ) ) {
            return;
        }

        $others = array_filter( $this->links->for_cj_product( $link['pid'] ), static fn( $row ) => (int) $row['parent_id'] !== (int) $link['parent_id'] );

        if ( $others ) {
            return;
        }

        $state   = get_option( self::OPTION );
        $current = array_map( 'strval', (array) ( $state['pids'] ?? [] ) );

        // Only products holding a slot are subscribed on CJ.
        if ( ! in_array( (string) $link['pid'], $current, true ) ) {
            return;
        }

        try {
            ( new Catalog() )->unsubscribe( [ $link['pid'] ] );
        } catch ( ApiException $e ) {
            dokan_log( '[CJ Dropshipping] Webhook unsubscribe failed: ' . $e->getMessage(), 'error' );

            return;
        }

        $state['pids'] = array_values( array_diff( $current, [ (string) $link['pid'] ] ) );
        update_option( self::OPTION, $state, false );

        // Hand the freed slot to the next product waiting for one.
        $this->fill( array_diff( $this->links_cj_products(), [ (string) $link['pid'] ] ) );
    }

    /**
     * Forget the registration when the account is disconnected.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function forget(): void {
        delete_option( self::OPTION );
    }

    /**
     * Distinct CJ products that are linked, first imported first.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    protected function links_cj_products(): array {
        global $wpdb;

        return array_map( 'strval', (array) $wpdb->get_col( 'SELECT pid FROM ' . \WeDevs\Dokan\CJDropshipping\Data\Schema::tables()['links'] . " WHERE pid <> '' GROUP BY pid ORDER BY MIN(created_at), MIN(product_id)" ) ); // phpcs:ignore WordPress.DB
    }
}
