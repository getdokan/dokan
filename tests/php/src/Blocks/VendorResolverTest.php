<?php

namespace WeDevs\Dokan\Test\Blocks;

use RuntimeException;
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
    public function it_resolves_the_vendor_pinned_by_the_block() {
        $seller_id = $this->factory()->seller->create();
        $vendor    = $this->resolver->resolve( [], [ 'storeId' => $seller_id ] );

        $this->assertInstanceOf( Vendor::class, $vendor );
        $this->assertSame( $seller_id, $vendor->get_id() );
    }

    /**
     * @test
     */
    public function it_resolves_the_vendor_from_block_context() {
        $seller_id = $this->factory()->seller->create();
        $vendor    = $this->resolver->resolve( [ 'dokan/storeId' => $seller_id ] );

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
