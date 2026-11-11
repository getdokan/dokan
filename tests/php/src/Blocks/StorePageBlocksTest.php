<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\HeaderLayouts;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group blocks
 */
class StorePageBlocksTest extends DokanTestCase {

    /**
     * @var string
     */
    protected $store_var;

    public function set_up() {
        parent::set_up();

        $this->store_var = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );
    }

    public function tear_down() {
        set_query_var( $this->store_var, '' );
        set_query_var( 'toc', '' );
        set_query_var( 'author', '' );

        parent::tear_down();
    }

    /**
     * Render a store block with the given attributes.
     *
     * @param string $name  Block name.
     * @param array  $attrs Block attributes.
     *
     * @return string
     */
    protected function render( string $name, array $attrs = [] ): string {
        return render_block(
            [
                'blockName'    => $name,
                'attrs'        => $attrs,
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ]
        );
    }

    /**
     * View a vendor's store page, with the slug typed as given.
     *
     * @param string $slug Store slug in the URL.
     * @param bool   $toc  Whether the Terms tab is open.
     *
     * @return void
     */
    protected function view_store( string $slug, bool $toc = false ): void {
        set_query_var( $this->store_var, $slug );
        set_query_var( 'toc', $toc ? 'true' : '' );
    }

    /**
     * @test
     */
    public function the_current_tab_resolves_for_a_mixed_case_store_url() {
        $seller_id = $this->factory()->seller->create( [ 'shopurl' => 'acmeshop' ] );

        $this->view_store( 'AcmeShop' );
        $this->assertSame( 'products', dokan_get_current_store_tab( $seller_id ) );

        $this->view_store( 'AcmeShop', true );
        $this->assertSame( 'terms_and_conditions', dokan_get_current_store_tab( $seller_id ) );
    }

    /**
     * @test
     */
    public function another_vendor_does_not_adopt_the_viewed_store_tab() {
        $viewed_id = $this->factory()->seller->create( [ 'shopurl' => 'viewed-store' ] );
        $other_id  = $this->factory()->seller->create();

        $this->view_store( 'viewed-store', true );

        $this->assertSame( 'terms_and_conditions', dokan_get_current_store_tab( $viewed_id ) );
        $this->assertSame( '', dokan_get_current_store_tab( $other_id ) );
    }

    /**
     * @test
     */
    public function the_social_block_applies_the_social_profiles_filter() {
        $seller_id = $this->factory()->seller->create();
        $received  = null;

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename );

        $this->assertSame( '', $this->render( 'dokan/store-social' ), 'A vendor with no profiles renders nothing.' );

        add_filter(
            'dokan_store_social_profiles', function ( $profiles, $vendor ) use ( &$received ) {
                $received = $vendor->get_id();

                return [ 'fb' => 'https://example.com/filtered-profile' ];
            }, 10, 2
        );

        $html = $this->render( 'dokan/store-social' );

        $this->assertSame( $seller_id, $received, 'The filter receives the Vendor, as on the classic header.' );
        $this->assertStringContainsString( 'https://example.com/filtered-profile', $html );
    }

    /**
     * @test
     */
    public function the_header_layout_falls_back_to_a_layout_that_still_exists() {
        add_filter(
            'dokan_store_header_layouts', function ( $layouts ) {
                unset( $layouts['panel'] );

                return $layouts;
            }
        );

        $layouts = HeaderLayouts::get_layouts();

        $this->assertSame( 'default', HeaderLayouts::resolve( 'missing', $layouts ) );
        $this->assertArrayHasKey( HeaderLayouts::resolve( '', $layouts ), $layouts );
        $this->assertSame( '', HeaderLayouts::resolve( '', [] ) );
    }

    /**
     * @test
     */
    public function the_store_header_renders_nothing_when_every_layout_is_filtered_out() {
        $seller_id = $this->factory()->seller->create();

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename );
        add_filter( 'dokan_store_header_layouts', '__return_empty_array' );

        $this->assertSame( '', $this->render( 'dokan/store-header' ) );
    }

    /**
     * @test
     */
    public function two_tabs_blocks_fire_the_after_store_tabs_hook_once() {
        $seller_id = $this->factory()->seller->create();
        $calls     = 0;

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename );

        add_action(
            'dokan_after_store_tabs', function () use ( &$calls ) {
                $calls++;
            }
        );

        $this->render( 'dokan/store-tabs' );
        $this->render( 'dokan/store-tabs' );

        $this->assertSame( 1, $calls );
    }

    /**
     * A seller with a phone number and the given email setting.
     *
     * @param string $show_email Vendor's own `show_email` setting.
     *
     * @return int
     */
    protected function create_seller_with_contact( string $show_email ): int {
        $seller_id = $this->factory()->seller->create();
        $profile   = (array) get_user_meta( $seller_id, 'dokan_profile_settings', true );

        $profile['phone']      = '5551234567';
        $profile['show_email'] = $show_email;

        update_user_meta( $seller_id, 'dokan_profile_settings', $profile );

        return $seller_id;
    }

    /**
     * Set the admin's "hide vendor info" privacy options.
     *
     * @param array $hidden Field => 'field' for each hidden field.
     *
     * @return void
     */
    protected function hide_vendor_info( array $hidden ): void {
        $appearance = (array) get_option( 'dokan_appearance', [] );

        $appearance['hide_vendor_info'] = $hidden;

        update_option( 'dokan_appearance', $appearance );
    }

    /**
     * @test
     */
    public function store_info_shows_the_email_only_when_the_vendor_allows_it() {
        $hidden_id = $this->create_seller_with_contact( 'no' );
        $shown_id  = $this->create_seller_with_contact( 'yes' );

        $this->view_store( get_user_by( 'id', $hidden_id )->user_nicename );
        $this->assertStringNotContainsString( 'dokan-store-email', $this->render( 'dokan/store-info' ) );

        $this->view_store( get_user_by( 'id', $shown_id )->user_nicename );
        $this->assertStringContainsString( 'dokan-store-email', $this->render( 'dokan/store-info' ) );
    }

    /**
     * @test
     */
    public function store_info_honours_the_admin_privacy_options_over_block_and_vendor_settings() {
        $seller_id = $this->create_seller_with_contact( 'yes' );

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename );

        $html = $this->render( 'dokan/store-info' );
        $this->assertStringContainsString( 'dokan-store-phone', $html );
        $this->assertStringContainsString( 'dokan-store-email', $html );

        $this->hide_vendor_info(
            [
				'email' => 'email',
				'phone' => 'phone',
			]
        );

        // The block asks for both fields; the admin's privacy option still wins.
        $html = $this->render(
            'dokan/store-info',
            [
				'showEmail' => true,
				'showPhone' => true,
			]
        );

        $this->assertStringNotContainsString( 'dokan-store-phone', $html );
        $this->assertStringNotContainsString( 'dokan-store-email', $html );
        $this->assertStringNotContainsString( '5551234567', $html );
    }

    /**
     * @test
     */
    public function store_tab_content_restores_the_global_post_and_the_woocommerce_loop() {
        $page_id = $this->factory()->post->create(
            [
				'post_type'  => 'page',
				'post_title' => 'Host page',
			]
        );

        $this->factory()->product->create_simple_product();

        $this->go_to( get_permalink( $page_id ) );
        the_post();

        // The editor preview renders its own product query over the page's main query.
        set_current_screen( 'edit-page' );

        $html = $this->render( 'dokan/store-tab-content', [ 'columns' => 3 ] );

        $this->assertStringContainsString( 'seller-items', $html, 'The preview renders a product loop.' );
        $this->assertSame( $page_id, get_the_ID(), 'The global $post points back at the host page.' );
        $this->assertTrue( empty( $GLOBALS['woocommerce_loop'] ), 'The WooCommerce loop state is reset.' );

        set_current_screen( 'front' );
    }

    /**
     * @test
     */
    public function the_product_section_renders_only_on_the_products_tab() {
        $seller_id = $this->factory()->seller->create();
        $attrs     = [
            'sectionId' => 'latest',
            'emptyText' => 'Nothing here yet',
        ];

        // Sections are hidden until the admin turns them on ('off' = not hidden).
        update_option( 'dokan_appearance', [ 'product_sections' => [ 'latest' => 'off' ] ] );

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename );
        $this->assertStringContainsString( 'Nothing here yet', $this->render( 'dokan/store-product-section', $attrs ) );

        $this->view_store( get_user_by( 'id', $seller_id )->user_nicename, true );
        $this->assertSame( '', $this->render( 'dokan/store-product-section', $attrs ) );
    }
}
