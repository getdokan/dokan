<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FormRenderer;

/**
 * Covers the front-end markup of the vendor registration form.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class FormRendererTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var FormRenderer */
    protected $renderer;

    public function set_up() {
        parent::set_up();

        $this->renderer = dokan_get_container()->get( FormRenderer::class );
        update_option( 'woocommerce_registration_generate_username', 'yes' );
        update_option( 'woocommerce_registration_generate_password', 'yes' );
    }

    /**
     * Render the form with the given attributes.
     *
     * @param array $attributes Block attributes.
     * @param array $context    Render context.
     *
     * @return string
     */
    private function render( array $attributes = [], array $context = [] ): string {
        return $this->renderer->render_form( $attributes, 42, $context );
    }

    public function test_built_in_fields_keep_dokans_names_and_ids() {
        $html = $this->render();

        foreach ( [ 'name="fname" id="first-name"', 'name="lname" id="last-name"', 'name="email" id="reg_email"', 'name="shopname" id="company-name"', 'name="shopurl" id="seller-url"', 'name="phone" id="shop-phone"' ] as $markup ) {
            $this->assertStringContainsString( $markup, $html );
        }

        $this->assertStringContainsString( 'id="url-alart-mgs"', $html );
        $this->assertStringContainsString( 'name="role" value="seller"', $html );
        $this->assertStringContainsString( 'name="dokan_vreg_form" value="42"', $html );
        $this->assertStringContainsString( 'name="woocommerce-register-nonce"', $html );
        $this->assertStringContainsString( 'name="dokan_vendor_registration_form_nonce"', $html );
        $this->assertStringContainsString( 'class="register dokan-vendor-register dokan-address-fields', $html );
    }

    public function test_hidden_rows_and_sections_are_not_rendered() {
        $html = $this->render(
            [
                'sections' => [
                    [
                        'id'   => 'store',
                        'rows' => [
                            [
                                'id'     => 'phone',
                                'hidden' => true,
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->assertStringNotContainsString( 'id="shop-phone"', $html );
        $this->assertStringNotContainsString( 'dokan_address[street_1]', $html );
    }

    public function test_username_and_password_follow_woocommerce() {
        $this->assertStringNotContainsString( 'id="reg_username"', $this->render() );
        $this->assertStringNotContainsString( 'id="reg_password"', $this->render() );
        $this->assertStringContainsString( 'link to set your password', $this->render() );

        update_option( 'woocommerce_registration_generate_username', 'no' );
        update_option( 'woocommerce_registration_generate_password', 'no' );

        $html = $this->render();

        $this->assertStringContainsString( 'id="reg_username"', $html );
        $this->assertStringContainsString( 'id="reg_password"', $html );
        $this->assertStringNotContainsString( 'id="reg_username"', $this->render( [], [ 'view' => 'customer' ] ) );
    }

    public function test_customers_do_not_see_the_email_field() {
        $this->assertStringNotContainsString( 'id="reg_email"', $this->render( [], [ 'view' => 'customer' ] ) );
    }

    public function test_terms_show_only_with_a_page() {
        $this->assertStringNotContainsString( 'id="tc_agree"', $this->render() );

        $html = $this->render( [], [ 'terms_url' => 'https://example.test/terms/' ] );

        $this->assertStringContainsString( 'id="tc_agree"', $html );
        $this->assertStringContainsString( 'href="https://example.test/terms/"', $html );
    }

    public function test_steps_render_one_panel_each_and_skip_empty_steps() {
        $html = $this->render(
            [
                'splitSteps' => true,
                'steps'      => [
                    [
                        'id'    => 'one',
                        'title' => 'One',
                    ],
                    [
                        'id'    => 'empty',
                        'title' => 'Nothing here',
                    ],
                    [
                        'id'    => 'two',
                        'title' => 'Two',
                    ],
                ],
                'sections'   => [
                    [
                        'id'   => 'account',
                        'step' => 'one',
                    ],
                    [
                        'id'   => 'store',
                        'step' => 'two',
                    ],
                ],
            ]
        );

        $this->assertSame( 2, substr_count( $html, 'class="dokan-vreg__step-item' ) );
        $this->assertStringNotContainsString( 'Nothing here', $html );
        $this->assertStringContainsString( 'Step 1 of 2: One', $html );
        $this->assertSame( 1, substr_count( $html, 'name="register"' ) );
    }

    public function test_a_row_claiming_a_hook_fires_it_at_its_position_only() {
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'       => 'eu_fields',
                    'section'  => 'account',
                    'position' => 5,
                    'label'    => 'EU business fields',
                    'hook'     => 'dokan_seller_registration_after_shopurl_field',
                ];

                return $rows;
            }
        );

        $fired = 0;
        add_action(
            'dokan_seller_registration_after_shopurl_field',
            function () use ( &$fired ) {
                ++$fired;
                echo '<span class="eu-marker"></span>';
            }
        );

        $html = $this->render();

        $this->assertSame( 1, $fired );
        $this->assertLessThan( strpos( $html, 'id="first-name"' ), strpos( $html, 'eu-marker' ) );
    }

    public function test_an_unclaimed_hook_fires_after_the_shop_url() {
        add_action(
            'dokan_seller_registration_after_shopurl_field',
            function () {
                echo '<span class="eu-marker"></span>';
            }
        );

        $html = $this->render();

        $this->assertGreaterThan( strpos( $html, 'id="seller-url"' ), strpos( $html, 'eu-marker' ) );
        $this->assertLessThan( strpos( $html, 'id="shop-phone"' ), strpos( $html, 'eu-marker' ) );
    }

    public function test_custom_fields_render_by_type() {
        $html = $this->render(
            [
                'sections' => [
                    [
                        'id'   => 'additional',
                        'rows' => [
                            [
                                'id'       => 'f1',
                                'custom'   => true,
                                'type'     => 'multiselect',
                                'label'    => 'Categories',
                                'metaKey'  => 'dokan_vreg_categories',
                                'required' => true,
                                'options'  => [
                                    [
                                        'label' => 'Books',
                                        'value' => 'books',
                                    ],
                                ],
                            ],
                            [
                                'id'      => 'f2',
                                'custom'  => true,
                                'type'    => 'date',
                                'label'   => 'Founded',
                                'metaKey' => 'dokan_vreg_founded',
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->assertStringContainsString( 'name="dokan_vreg[dokan_vreg_categories][]" multiple required', $html );
        $this->assertStringContainsString( '<option value="books">Books</option>', $html );
        $this->assertStringContainsString( 'type="date"', $html );
    }

    public function test_texts_fall_back_to_defaults() {
        $texts = $this->renderer->get_texts(
            [
                'texts' => [
                    'visitorButton'  => 'Open my shop',
                    'visitorHeading' => [ 'not text' ],
                ],
            ]
        );

        $this->assertSame( 'Open my shop', $texts['visitorButton'] );
        $this->assertSame( 'Register as a Vendor', $texts['visitorHeading'] );
    }

    public function test_the_terms_url_uses_the_blocks_page_then_dokans_setting() {
        $page_id = $this->factory()->post->create(
            [
                'post_type'   => 'page',
                'post_status' => 'publish',
            ]
        );

        $this->assertSame( get_permalink( $page_id ), $this->renderer->get_terms_url( [ 'termsPageId' => $page_id ] ) );
        $this->assertSame( '', $this->renderer->get_terms_url( [ 'termsPageId' => 0 ] ) );
    }

    public function test_the_setup_is_signed_into_the_form_and_verifies() {
        $attributes = [
            'splitSteps' => true,
            'texts'      => [ 'visitorButton' => 'Go' ],
        ];
        $signed     = $this->renderer->sign_setup( $attributes, 42 );
        $html       = $this->render( $attributes );

        $this->assertStringContainsString( 'name="dokan_vreg_setup" value="' . $signed['payload'] . '"', $html );
        $this->assertSame( [ 'splitSteps' => true ], $this->renderer->verify_setup( $signed['payload'], $signed['signature'], 42 ) );
        $this->assertNull( $this->renderer->verify_setup( $signed['payload'], $signed['signature'], 43 ) );
        $this->assertNull( $this->renderer->verify_setup( $signed['payload'], 'forged', 42 ) );
    }

    public function test_a_block_without_its_own_terms_page_follows_dokans_settings() {
        $page_id = $this->factory()->post->create(
            [
                'post_type'   => 'page',
                'post_status' => 'publish',
            ]
        );

        update_option( 'dokan_pages', [ 'reg_tc_page' => $page_id ] );
        update_option( 'dokan_general', [ 'enable_tc_on_reg' => 'off' ] );
        $this->flush_settings_caches();

        $this->assertSame( '', $this->renderer->get_terms_url( [] ) );

        update_option( 'dokan_general', [ 'enable_tc_on_reg' => 'on' ] );
        $this->flush_settings_caches();

        $this->assertSame( get_permalink( $page_id ), $this->renderer->get_terms_url( [] ) );

        wp_update_post(
            [
                'ID'          => $page_id,
                'post_status' => 'draft',
            ]
        );

        $this->assertSame( '', $this->renderer->get_terms_url( [] ) );
    }

    public static function style_provider(): array {
        return [
            'hex'              => [ '#7047eb', '--dokan-vreg-accent:#7047eb' ],
            'named'            => [ 'white', '--dokan-vreg-accent:white' ],
            'modern function'  => [ 'hsl(120deg 50% 50%)', '--dokan-vreg-accent:hsl(120deg 50% 50%)' ],
            'palette variable' => [ 'var(--wp--preset--color--primary)', '--dokan-vreg-accent:var(--wp--preset--color--primary)' ],
            'declaration end'  => [ 'red;background:url(x)', '' ],
            'url'              => [ 'url(https://evil.test/x.png)', '' ],
            'brace'            => [ 'red}body{display:none', '' ],
        ];
    }

    /**
     * @dataProvider style_provider
     */
    public function test_style_colors_are_sanitized( string $color, string $expected ) {
        $this->assertSame( $expected, $this->renderer->get_style_variables( [ 'styles' => [ 'accentColor' => $color ] ] ) );
    }

    public function test_style_sizes_are_clamped_and_step_style_falls_back() {
        $css = $this->renderer->get_style_variables(
            [
                'styles' => [
                    'inputRadius' => 500,
                    'fieldGap'    => '12',
                    'loginGap'    => [ 'x' ],
                ],
            ]
        );

        $this->assertSame( '--dokan-vreg-input-radius:30px;--dokan-vreg-field-gap:12px', $css );
        $this->assertSame( 'pills', $this->renderer->get_step_style( [ 'styles' => [ 'stepStyle' => 'pills' ] ] ) );
        $this->assertSame( 'bars', $this->renderer->get_step_style( [ 'styles' => [ 'stepStyle' => 'evil' ] ] ) );
    }

    public function test_an_optional_terms_box_does_not_lock_the_submit_button() {
        $context  = [ 'terms_url' => 'https://example.test/terms/' ];
        $optional = $this->render(
            [
                'sections' => [
                    [
                        'id'   => 'agreement',
                        'rows' => [
                            [
                                'id'       => 'terms',
                                'required' => false,
                            ],
                        ],
                    ],
                ],
            ],
            $context
        );

        $this->assertStringContainsString( 'class="tc_check_box"', $this->render( [], $context ) );
        $this->assertStringNotContainsString( 'tc_check_box', $optional );
    }
}
