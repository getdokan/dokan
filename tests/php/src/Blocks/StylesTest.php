<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\HeaderLayouts;
use WeDevs\Dokan\Blocks\Styles;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group blocks
 */
class StylesTest extends DokanTestCase {

    /**
     * @test
     */
    public function an_empty_icon_setting_keeps_the_default_icon() {
        $this->assertSame( 'fas fa-mobile-alt', Styles::icon_class( '', 'fas fa-mobile-alt' ) );
        $this->assertSame( 'fas fa-mobile-alt', Styles::icon_class( '   ', 'fas fa-mobile-alt' ) );
    }

    /**
     * @test
     */
    public function none_removes_the_icon() {
        $this->assertSame( '', Styles::icon_class( 'none', 'fas fa-mobile-alt' ) );
        $this->assertSame( '', Styles::icon( 'none', 'fas fa-mobile-alt' ) );
    }

    /**
     * @test
     */
    public function a_custom_icon_is_reduced_to_class_name_characters() {
        $this->assertSame( 'fab fa-whatsapp', Styles::icon_class( 'fab  fa-whatsapp', '' ) );
        $this->assertSame( 'fas fa-phone onclickalert1', Styles::icon_class( 'fas fa-phone" onclick="alert(1)', '' ) );
        $this->assertSame(
            '<i class="fas fa-phone dokan-store-tab-icon" aria-hidden="true"></i>',
            Styles::icon( 'fas fa-phone', '', 'dokan-store-tab-icon' )
        );
    }

    /**
     * @test
     */
    public function colours_accept_only_colour_notations() {
        $this->assertSame( '#ff0000', Styles::color( '#ff0000' ) );
        $this->assertSame( 'rgba(0, 0, 0, 0.5)', Styles::color( 'rgba(0, 0, 0, 0.5)' ) );
        $this->assertSame( 'var(--wp--preset--color--primary)', Styles::color( 'var(--wp--preset--color--primary)' ) );
        $this->assertSame( 'transparent', Styles::color( 'transparent' ) );
        $this->assertSame( 'oklch(70% 0.1 200)', Styles::color( 'oklch(70% 0.1 200)' ) );
        $this->assertSame( 'hsl(210deg 50% 40%)', Styles::color( 'hsl(210deg 50% 40%)' ) );
        $this->assertSame( 'color-mix(in srgb, red 40%, var(--accent))', Styles::color( 'color-mix(in srgb, red 40%, var(--accent))' ) );
        $this->assertSame( '', Styles::color( 'red} body{color:blue' ) );
        $this->assertSame( '', Styles::color( 'image-set(x)' ) );
        $this->assertSame( '', Styles::color( 'red; background:url(x)' ) );
        $this->assertSame( '', Styles::color( 'expression(alert(1))' ) );
        $this->assertSame( '', Styles::color( '' ) );
    }

    /**
     * @test
     */
    public function custom_properties_skip_empty_values() {
        $this->assertSame(
            '', Styles::custom_properties(
                [
					'--a' => '',
					'--b' => '',
				]
            )
        );
        $this->assertSame(
            '--a:#fff;', Styles::custom_properties(
                [
					'--a' => '#fff',
					'--b' => '',
				]
            )
        );
    }

    /**
     * @test
     */
    public function text_falls_back_to_the_default_when_empty() {
        $this->assertSame( 'Featured', Styles::text( '', 'Featured' ) );
        $this->assertSame( 'Featured', Styles::text( '  ', 'Featured' ) );
        $this->assertSame( 'Top pick', Styles::text( 'Top pick', 'Featured' ) );
    }

    /**
     * @test
     */
    public function header_layout_follows_the_classic_appearance_option_when_unset() {
        $previous = get_option( 'dokan_appearance', [] );
        $set      = static function ( $template ) use ( $previous ) {
            update_option( 'dokan_appearance', array_merge( (array) $previous, [ 'store_header_template' => $template ] ) );
        };

        $set( 'layout2' );
        $this->assertSame( 'stacked', HeaderLayouts::resolve( '' ) );

        $set( 'default' );
        $this->assertSame( 'panel', HeaderLayouts::resolve( '' ) );

        update_option( 'dokan_appearance', $previous );

        $this->assertSame( 'split', HeaderLayouts::resolve( 'split' ) );
        $this->assertSame( 'panel', HeaderLayouts::resolve( 'no-such-layout' ), 'Unknown layouts fall back to the panel.' );
    }

    /**
     * @test
     */
    public function font_size_accepts_lengths_presets_and_fluid_sizes_only() {
        $this->assertSame( '18px', Styles::font_size( '18px' ) );
        $this->assertSame( '1.25rem', Styles::font_size( ' 1.25rem ' ) );
        $this->assertSame( 'var(--wp--preset--font-size--large)', Styles::font_size( 'var(--wp--preset--font-size--large)' ) );
        $this->assertSame( 'clamp(14px, 1rem + 1vw, 22px)', Styles::font_size( 'clamp(14px, 1rem + 1vw, 22px)' ) );
        $this->assertSame( '', Styles::font_size( '18px;color:red' ) );
        $this->assertSame( '', Styles::font_size( 'url(x)' ) );
        $this->assertSame( '', Styles::font_size( 'big' ) );
        $this->assertSame( '', Styles::font_size( [ '18px' ] ) );
    }
}
