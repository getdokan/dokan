<?php

namespace WeDevs\Dokan\Test\Blocks;

use RuntimeException;
use WeDevs\Dokan\Blocks\PreviewVendor;
use WeDevs\Dokan\Blocks\VendorResolver;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * @group blocks
 */
class VendorResolverTest extends DokanTestCase {

    /**
     * @var VendorResolver
     */
    protected $resolver;

    /**
     * @var string
     */
    protected $store_var;

    public function set_up() {
        parent::set_up();

        $this->resolver  = dokan()->get_container()->get( VendorResolver::class );
        $this->store_var = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );
    }

    public function tear_down() {
        set_query_var( $this->store_var, '' );
        set_query_var( 'author', '' );

        parent::tear_down();
    }

    /**
     * @test
     */
    public function it_ignores_a_store_id_pinned_in_block_attributes() {
        $seller_id = $this->factory()->seller->create();
        $admin_id  = $this->factory()->user->create( [ 'role' => 'administrator' ] );

        $this->assertNull( $this->resolver->resolve( [], [ 'storeId' => $seller_id ] ) );
        $this->assertNull( $this->resolver->resolve( [], [ 'storeId' => $admin_id ] ) );
    }

    /**
     * @test
     */
    public function it_ignores_a_store_id_passed_through_block_context() {
        $admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );

        $this->assertNull( $this->resolver->resolve( [ 'dokan/storeId' => $admin_id ] ) );
    }

    /**
     * @test
     */
    public function it_follows_the_viewed_store_over_a_pinned_store_id() {
        $seller_id = $this->factory()->seller->create();
        $admin_id  = $this->factory()->user->create( [ 'role' => 'administrator' ] );

        set_query_var( $this->store_var, get_user_by( 'id', $seller_id )->user_nicename );

        $vendor = $this->resolver->resolve( [ 'dokan/storeId' => $admin_id ], [ 'storeId' => $admin_id ] );

        $this->assertInstanceOf( Vendor::class, $vendor );
        $this->assertSame( $seller_id, $vendor->get_id() );
    }

    /**
     * @test
     */
    public function it_resolves_the_queried_store() {
        $seller_id = $this->factory()->seller->create();

        set_query_var( $this->store_var, get_user_by( 'id', $seller_id )->user_nicename );

        $this->assertSame( $seller_id, $this->resolver->resolve()->get_id() );
    }

    /**
     * @test
     */
    public function it_ignores_a_queried_slug_that_is_not_a_vendor() {
        $customer_id = $this->factory()->user->create( [ 'role' => 'customer' ] );

        set_query_var( $this->store_var, get_user_by( 'id', $customer_id )->user_nicename );

        $this->assertNull( $this->resolver->resolve() );
    }

    /**
     * @test
     */
    public function it_renders_nothing_outside_any_store_context_on_the_front_end() {
        $this->assertFalse( $this->resolver->is_editor_preview() );
        $this->assertNull( $this->resolver->resolve() );
    }

    /**
     * @test
     */
    public function it_previews_inside_the_admin_editor() {
        set_current_screen( 'edit-page' );

        $this->assertTrue( $this->resolver->is_editor_preview() );
        $this->assertInstanceOf( PreviewVendor::class, $this->resolver->resolve() );

        set_current_screen( 'front' );
    }

    /**
     * @test
     */
    public function it_does_not_leak_the_preview_vendor_into_admin_ajax() {
        set_current_screen( 'edit-page' );
        add_filter( 'wp_doing_ajax', '__return_true' );

        $this->assertFalse( $this->resolver->is_editor_preview(), 'admin-ajax requests come from the front end.' );
        $this->assertNull( $this->resolver->resolve() );

        set_current_screen( 'front' );
    }

    /**
     * @test
     */
    public function it_does_not_leak_the_preview_vendor_into_rest_rendered_content() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $page_id = $this->factory()->post->create(
            [
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:dokan/store-name /--><!-- wp:dokan/store-info /-->',
			]
        );

        foreach ( [ 'view', 'edit' ] as $context ) {
            $request = new \WP_REST_Request( 'GET', '/wp/v2/pages/' . $page_id );
            $request->set_param( 'context', $context );

            $response = rest_do_request( $request );
            $rendered = $response->get_data()['content']['rendered'] ?? null;

            $this->assertSame( 200, $response->get_status() );
            $this->assertIsString( $rendered );
            $this->assertStringNotContainsString( 'Store Name', $rendered, "No preview store over REST ({$context})." );
            $this->assertStringNotContainsString( 'dokan-store-info', $rendered, "No preview store info over REST ({$context})." );
        }
    }

    /**
     * @test
     */
    public function it_sets_up_the_store_context_around_a_render_and_restores_it() {
        $seller_id = $this->factory()->seller->create();
        $vendor    = dokan()->vendor->get( $seller_id );
        $seen      = [];

        set_query_var( 'author', 7 );
        set_query_var( $this->store_var, 'before' );

        $output = $this->resolver->render_in_store_context(
            $vendor, function () use ( &$seen ) {
                $seen = [ get_query_var( 'author' ), get_query_var( $this->store_var ), dokan_is_store_page() ];
                echo 'rendered';
            }
        );

        $this->assertSame( 'rendered', $output );
        $this->assertSame( [ $seller_id, get_user_by( 'id', $seller_id )->user_nicename, true ], $seen );
        $this->assertSame( 7, get_query_var( 'author' ) );
        $this->assertSame( 'before', get_query_var( $this->store_var ) );
    }

    /**
     * @test
     */
    public function it_restores_the_store_context_even_when_the_renderer_throws() {
        $vendor = dokan()->vendor->get( $this->factory()->seller->create() );
        $level  = ob_get_level();

        set_query_var( 'author', 7 );
        set_query_var( $this->store_var, 'before' );

        try {
            $this->resolver->render_in_store_context(
                $vendor, function () {
                    throw new RuntimeException( 'boom' );
                }
            );

            $this->fail( 'The renderer exception must propagate.' );
        } catch ( RuntimeException $e ) {
            $this->assertSame( 'boom', $e->getMessage() );
        }

        $this->assertSame( 7, get_query_var( 'author' ) );
        $this->assertSame( 'before', get_query_var( $this->store_var ) );
        $this->assertSame( $level, ob_get_level(), 'No output buffer is left open.' );
    }
}
