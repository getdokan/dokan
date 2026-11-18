<?php

namespace WeDevs\Dokan\Test;

/**
 * SPA routes handed to the hash router for the menus the admin switched off.
 *
 * @see dokan_get_restricted_dashboard_routes()
 */
class DashboardRestrictedRoutesTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();
        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * A switched-off menu or settings submenu that links into the SPA yields its route.
     *
     * @return void
     */
    public function test_switched_off_spa_menus_yield_their_routes(): void {
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'switch_off_menus' ] );

        $this->assertSame( [ 'orders', 'settings/social' ], dokan_get_restricted_dashboard_routes() );

        remove_filter( 'dokan_get_dashboard_nav', [ $this, 'switch_off_menus' ] );
    }

    /**
     * Without a Menu Manager flag nothing is restricted.
     *
     * @return void
     */
    public function test_untouched_menus_yield_nothing(): void {
        $this->assertSame( [], dokan_get_restricted_dashboard_routes() );
    }

    /**
     * Mimics the Menu Manager: flags on the items it saved, legacy pages have no hash to gate.
     *
     * @param array $nav
     *
     * @return array
     */
    public function switch_off_menus( array $nav ): array {
        $nav['orders']['url']            = home_url( '/dashboard/new/#orders' );
        $nav['orders']['is_switched_on'] = false;

        $nav['withdraw']['url']            = home_url( '/dashboard/new/#withdraw' );
        $nav['withdraw']['is_switched_on'] = true;

        $nav['settings']['submenu']['social'] = [
            'title'          => 'Social Profile',
            'url'            => home_url( '/dashboard/new/#settings/social?tab=links' ),
            'pos'            => 90,
            'is_switched_on' => false,
        ];

        // A legacy page: AccessRestriction gates it server-side, nothing for the router.
        $nav['settings']['submenu']['payment']['url']            = home_url( '/dashboard/settings/payment/' );
        $nav['settings']['submenu']['payment']['is_switched_on'] = false;

        return $nav;
    }
}
