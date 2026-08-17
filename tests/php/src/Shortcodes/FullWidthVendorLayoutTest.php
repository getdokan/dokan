<?php

namespace WeDevs\Dokan\Test\Shortcodes;

use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Shortcodes\FullWidthVendorLayout;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class FullWidthVendorLayoutTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        // The shared repository memoizes per-section snapshots, which would let a
        // settings read at registration time slip past the assertions below.
        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                dokan_get_container()->get( LegacySettingsRepository::class )->flush_cache( null );
            } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $e );
            }
        }
    }

    /**
     * Count `dokan_appearance` reads while running `$callback`.
     *
     * @param callable $callback Code under test.
     *
     * @return int
     */
    private function count_appearance_reads( callable $callback ): int {
        $reads   = 0;
        $counter = function ( $pre ) use ( &$reads ) {
            ++$reads;
            return $pre;
        };

        add_filter( 'pre_option_dokan_appearance', $counter );

        try {
            $callback();
        } finally {
            remove_filter( 'pre_option_dokan_appearance', $counter );
        }

        return $reads;
    }

    /**
     * `register_hooks()` runs on `plugins_loaded` (see `WeDevs_Dokan::init_hooks()`).
     * Reading a Dokan setting there resolves the legacy settings bridge, which
     * builds the translated admin settings schema — before `init`, where
     * `load_plugin_textdomain()` runs. WordPress 6.7+ answers that with a
     * `_load_textdomain_just_in_time` doing-it-wrong notice on every request.
     */
    public function test_register_hooks_does_not_read_settings(): void {
        $layout = new FullWidthVendorLayout();

        $this->assertSame( 0, $this->count_appearance_reads( [ $layout, 'register_hooks' ] ) );
    }

    /**
     * Gating moved from hook registration into the callbacks, so the template
     * override must still be inert while the marketplace runs the legacy layout.
     */
    public function test_template_is_untouched_for_legacy_layout(): void {
        update_option( 'dokan_appearance', [ 'vendor_layout_style' => 'legacy' ] );

        $layout = new FullWidthVendorLayout();
        $layout->register_hooks();

        $this->assertSame( 'theme-template.php', $layout->rewrite_vendor_dashboard_template( 'theme-template.php' ) );
    }

    /**
     * The deferred gate must still consult the setting when a callback runs.
     */
    public function test_layout_setting_is_read_when_a_callback_runs(): void {
        update_option( 'dokan_appearance', [ 'vendor_layout_style' => 'legacy' ] );

        $layout = new FullWidthVendorLayout();
        $layout->register_hooks();

        $reads = $this->count_appearance_reads(
            function () use ( $layout ) {
                $layout->rewrite_vendor_dashboard_template( 'theme-template.php' );
            }
        );

        $this->assertGreaterThan( 0, $reads );
    }
}
