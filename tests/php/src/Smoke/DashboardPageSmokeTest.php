<?php

namespace WeDevs\Dokan\Test\Smoke;

use WeDevs\Dokan\Test\Helpers\PoisonWorld;

/**
 * Renders every vendor dashboard page as several vendors and as a customer.
 *
 * The dashboard shortcode dispatches on the rewrite endpoints Dokan registers
 * (`products`, `orders`, `withdraw`, ...). Each one is rendered through the real
 * request path (`go_to()` on the dashboard page URL) so `is_page()` and the query
 * vars look exactly as they do on a live site, then the shortcode output is
 * discarded. Templates that redirect or `wp_die()` count as a pass.
 *
 * Runs on an empty install and on the poison world, as a vendor with data, a vendor
 * whose selling is disabled, a seller role with no store, and a customer.
 *
 * @since DOKAN_SINCE
 *
 * @group smoke
 * @group fatal-smoke
 */
class DashboardPageSmokeTest extends SmokeTestCase {

    public function test_dashboard_pages_survive_an_empty_install(): void {
        $this->walk( 'dashboard:empty', null );
        $this->assert_no_fatals( 'dashboard:empty' );
    }

    public function test_dashboard_pages_survive_the_poison_world(): void {
        $world = $this->seed_poison_world();

        $this->walk( 'dashboard:poison', $world );
        $this->assert_no_fatals( 'dashboard:poison' );
    }

    /**
     * @param string           $walk  Walk name for labels.
     * @param PoisonWorld|null $world Seeded world.
     *
     * @return void
     */
    protected function walk( string $walk, ?PoisonWorld $world ): void {
        $dashboard_url = $this->dashboard_url();
        $this->assertNotEmpty( $dashboard_url, 'The vendor dashboard page is missing; set_dokan_pages() did not run.' );

        $actors = [
            'vendor'   => $this->seller_id1,
            'vendor2'  => $this->seller_id2,
            'customer' => $this->customer_id,
        ];
        if ( $world ) {
            $actors['vendor_without_store'] = (int) $world->id( 'vendor_without_store' );
        }

        foreach ( $this->pages( $world ) as $page => $request ) {
            foreach ( $actors as $actor => $user_id ) {
                $label = sprintf( '[%s][%s] %s', $walk, $actor, $page );

                $this->probe(
                    $label,
                    function () use ( $user_id, $dashboard_url, $request ) {
                        wp_set_current_user( $user_id );

                        $url = $dashboard_url . ltrim( $request['path'], '/' );
                        if ( ! empty( $request['query'] ) ) {
                            $url = add_query_arg( $request['query'], $url );
                        }

                        $this->go_to( $url );

                        // Rewrite endpoints only resolve when the rules are flushed; make the
                        // query var present either way so the shortcode dispatches the page.
                        foreach ( $request['vars'] as $var => $value ) {
                            $GLOBALS['wp']->query_vars[ $var ] = $value; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
                            set_query_var( $var, $value );
                        }

                        do_shortcode( '[dokan-dashboard]' );

                        return '';
                    }
                );
            }
        }
    }

    /**
     * Dashboard pages to render: name => request shape.
     *
     * @param PoisonWorld|null $world Seeded world.
     *
     * @return array<string,array{path:string,query:array<string,mixed>,vars:array<string,string>}>
     */
    protected function pages( ?PoisonWorld $world ): array {
        $pages = [
            'overview'            => $this->page( '', [], [ 'page' => '' ] ),
            'products'            => $this->page( 'products/', [], [ 'products' => '' ] ),
            'new-product'         => $this->page( 'new-product/', [], [ 'new-product' => '' ] ),
            'orders'              => $this->page( 'orders/', [], [ 'orders' => '' ] ),
            'withdraw'            => $this->page( 'withdraw/', [], [ 'withdraw' => '' ] ),
            'withdraw-requests'   => $this->page( 'withdraw-requests/', [], [ 'withdraw-requests' => '' ] ),
            'reverse-withdrawal'  => $this->page( 'reverse-withdrawal/', [], [ 'reverse-withdrawal' => '' ] ),
            'settings/store'      => $this->page( 'settings/store/', [], [ 'settings' => 'store' ] ),
            'settings/payment'    => $this->page( 'settings/payment/', [], [ 'settings' => 'payment' ] ),
            'edit-account'        => $this->page( 'edit-account/', [], [ 'edit-account' => '' ] ),
            'account-migration'   => $this->page( 'account-migration/', [], [ 'account-migration' => '' ] ),
            'orders?missing'      => $this->page( 'orders/', [ 'order_id' => PoisonWorld::MISSING_ID ], [ 'orders' => '' ] ),
            'products?missing'    => $this->page(
                'products/',
                [
                    'product_id'                => PoisonWorld::MISSING_ID,
                    'action'                    => 'edit',
                    '_dokan_edit_product_nonce' => wp_create_nonce( 'dokan_edit_product_nonce' ),
                ],
                [ 'products' => '' ]
            ),
        ];

        if ( ! $world ) {
            return $pages;
        }

        foreach ( [ 'order_with_refund', 'order_with_deleted_product', 'order_with_downloads', 'parent_order', 'suborder' ] as $fixture ) {
            $order_id = (int) $world->id( $fixture );
            if ( $order_id ) {
                $pages[ 'orders?' . $fixture ] = $this->page( 'orders/', [ 'order_id' => $order_id ], [ 'orders' => '' ] );
            }
        }

        foreach ( [ 'product', 'priceless_product', 'variable_product', 'downloadable_product', 'deleted_product' ] as $fixture ) {
            $product_id = (int) $world->id( $fixture );
            if ( $product_id ) {
                $pages[ 'products?' . $fixture ] = $this->page(
                    'products/',
                    [
                        'product_id'                => $product_id,
                        'action'                    => 'edit',
                        '_dokan_edit_product_nonce' => wp_create_nonce( 'dokan_edit_product_nonce' ),
                    ],
                    [ 'products' => '' ]
                );
            }
        }

        return $pages;
    }

    /**
     * @param string               $path  Path appended to the dashboard URL.
     * @param array<string,mixed>  $query Query arguments (`$_GET`).
     * @param array<string,string> $vars  Query vars the shortcode dispatches on.
     *
     * @return array{path:string,query:array<string,mixed>,vars:array<string,string>}
     */
    protected function page( string $path, array $query, array $vars ): array {
        return [
            'path'  => $path,
            'query' => $query,
            'vars'  => $vars,
        ];
    }

    /**
     * @return string Dashboard page permalink with a trailing slash, or '' when the page is missing.
     */
    protected function dashboard_url(): string {
        $page_id = (int) dokan_get_option( 'dashboard', 'dokan_pages', 0 );

        if ( ! $page_id ) {
            return '';
        }

        return trailingslashit( get_permalink( $page_id ) );
    }
}
