<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Admin\Dashboard\LegacySwitcher;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\TestableSellerSetupWizard;

/**
 * The admin switch between the legacy onboarding and the React one.
 *
 * The stored default keeps an upgraded site on the legacy wizard; only the
 * admin setup wizard (fresh install) or an explicit opt-in flips it. Each
 * surface reads its own `dokan_appearance` key, so one switch must never move
 * another.
 *
 * @group setup-wizard
 */
class SetupWizardSwitcherTest extends DokanTestCase {

    /**
     * @var LegacySwitcher
     */
    protected $switcher;

    public function set_up() {
        parent::set_up();

        delete_option( 'dokan_appearance' );
        wp_set_current_user( $this->seller_id1 );

        $this->switcher = dokan_get_container()->get( LegacySwitcher::class );
    }

    public function tear_down() {
        delete_option( 'dokan_appearance' );

        parent::tear_down();
    }

    protected function set_appearance( array $appearance ): void {
        update_option( 'dokan_appearance', $appearance );
        wp_cache_delete( 'dokan_appearance', 'options' );
    }

    /**
     * @test
     */
    public function an_upgraded_site_keeps_the_legacy_wizard() {
        $this->assertTrue( $this->switcher->is_setup_wizard_legacy_preferred() );
    }

    /**
     * @test
     */
    public function opting_in_selects_the_react_wizard() {
        $this->set_appearance( [ 'vendor_setup_wizard' => 'latest' ] );

        $this->assertFalse( $this->switcher->is_setup_wizard_legacy_preferred() );
    }

    /**
     * Anything that isn't the opt-in value means legacy — including a stale value.
     *
     * @test
     */
    public function an_unknown_value_means_legacy() {
        $this->set_appearance( [ 'vendor_setup_wizard' => 'legacy' ] );
        $this->assertTrue( $this->switcher->is_setup_wizard_legacy_preferred() );

        $this->set_appearance( [ 'vendor_setup_wizard' => 'something-else' ] );
        $this->assertTrue( $this->switcher->is_setup_wizard_legacy_preferred() );
    }

    /**
     * Cron and mail run without a current user; those contexts get the new UI.
     *
     * @test
     */
    public function an_anonymous_context_gets_the_new_wizard() {
        wp_set_current_user( 0 );

        $this->assertFalse( $this->switcher->is_setup_wizard_legacy_preferred() );
    }

    /**
     * The three switchable surfaces share one implementation but not one option.
     *
     * @test
     */
    public function each_surface_reads_its_own_key() {
        $this->set_appearance( [ 'vendor_setup_wizard' => 'latest' ] );

        $this->assertFalse( $this->switcher->is_setup_wizard_legacy_preferred() );
        $this->assertTrue( $this->switcher->is_store_settings_legacy_preferred() );
        $this->assertTrue( $this->switcher->is_product_editor_legacy_preferred() );

        $this->set_appearance(
            [
                'vendor_store_settings' => 'latest',
                'vendor_product_editor' => 'latest',
            ]
        );

        $this->assertTrue( $this->switcher->is_setup_wizard_legacy_preferred() );
        $this->assertFalse( $this->switcher->is_store_settings_legacy_preferred() );
        $this->assertFalse( $this->switcher->is_product_editor_legacy_preferred() );
    }

    /**
     * The wizard resolves the preference once and every step agrees with it.
     *
     * @test
     */
    public function the_wizard_follows_the_switch() {
        $this->set_appearance( [ 'vendor_setup_wizard' => 'legacy' ] );

        $legacy = new TestableSellerSetupWizard();
        $legacy->prime( $this->seller_id1 );

        $this->assertFalse( $legacy->uses_react() );

        $this->set_appearance( [ 'vendor_setup_wizard' => 'latest' ] );

        if ( ! file_exists( DOKAN_DIR . '/assets/js/vendor-setup-wizard.asset.php' ) ) {
            $this->markTestSkipped( 'The React bundle is not built in this checkout.' );
        }

        $react = new TestableSellerSetupWizard();
        $react->prime( $this->seller_id1 );

        $this->assertTrue( $react->uses_react() );
    }

    /**
     * A checkout with no built bundle has nothing to mount, so onboarding stays
     * on the legacy wizard rather than rendering an empty step.
     *
     * @test
     */
    public function a_missing_bundle_falls_back_to_legacy() {
        $this->set_appearance( [ 'vendor_setup_wizard' => 'latest' ] );

        $wizard = new class() extends TestableSellerSetupWizard {
            protected static function asset_manifest_path(): string {
                return DOKAN_DIR . '/assets/js/there-is-no-such-bundle.asset.php';
            }
        };

        $wizard->prime( $this->seller_id1 );

        $this->assertFalse( $wizard->uses_react() );
    }
}
