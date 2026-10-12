<?php

namespace WeDevs\Dokan\Test\Admin;

use WeDevs\Dokan\Admin\Dashboard\Pages\ProFeatures;
use WeDevs\Dokan\Admin\Dashboard\Pages\Status;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Admin dashboard page scripts carry a text domain, so their JS strings can localize.
 *
 * Covers getdokan/dokan-pro#6131: `dokan-status` and `dokan-pro-features` were registered
 * without wp_set_script_translations(), so WordPress never loaded their translation JSON
 * and every string in those bundles stayed English no matter what the locale was.
 *
 * @group dokan-admin-dashboard
 *
 * @covers \WeDevs\Dokan\Admin\Dashboard\Pages\Status::register
 * @covers \WeDevs\Dokan\Admin\Dashboard\Pages\ProFeatures::register
 */
class AdminDashboardScriptTranslationsTest extends DokanTestCase {

    /**
     * Text domain every Lite script translates against.
     */
    const TEXT_DOMAIN = 'dokan-lite';

    /**
     * Assert a registered script is set up for JS translations.
     *
     * @param string $handle Script handle.
     *
     * @return void
     */
    protected function assertScriptIsTranslatable( string $handle ): void {
        $script = wp_scripts()->registered[ $handle ] ?? null;

        $this->assertNotNull( $script, sprintf( 'The %s script must be registered.', $handle ) );
        $this->assertSame(
            self::TEXT_DOMAIN,
            $script->textdomain ?? '',
            sprintf( 'The %s script must declare a text domain, or its JS strings cannot localize.', $handle )
        );
        $this->assertContains(
            'wp-i18n',
            (array) $script->deps,
            sprintf( 'The %s script must depend on wp-i18n so the translation data has somewhere to land.', $handle )
        );
    }

    /**
     * The Status page script can load translations.
     *
     * @return void
     */
    public function test_status_script_is_translatable(): void {
        ( new Status() )->register();

        $this->assertScriptIsTranslatable( 'dokan-status' );
    }

    /**
     * The Pro Features page script can load translations.
     *
     * @return void
     */
    public function test_pro_features_script_is_translatable(): void {
        if ( dokan()->is_pro_exists() ) {
            $this->markTestSkipped( 'The Pro Features page only registers its script when Dokan Pro is absent.' );
        }

        ( new ProFeatures() )->register();

        $this->assertScriptIsTranslatable( 'dokan-pro-features' );
    }
}
