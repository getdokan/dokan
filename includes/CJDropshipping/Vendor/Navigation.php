<?php

namespace WeDevs\Dokan\CJDropshipping\Vendor;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Adds CJ Dropshipping to the vendor dashboard menu (new dashboard only, A6).
 *
 * @since DOKAN_SINCE
 */
class Navigation implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_menu' ], 20 );
    }

    /**
     * Add the menu item for store owners who may use CJ.
     *
     * @since DOKAN_SINCE
     *
     * @param array $menus Dashboard menus.
     *
     * @return array
     */
    public function add_menu( $menus ): array {
        $menus = (array) $menus;

        if ( ! Access::can_use( get_current_user_id() ) ) {
            return $menus;
        }

        $menus['cj-dropshipping'] = [
            'title'       => __( 'CJ Dropshipping', 'dokan-lite' ),
            'icon'        => '<i class="fas fa-truck"></i>',
            'icon_name'   => 'PackageSearch',
            'url'         => dokan_get_navigation_url( 'cj-dropshipping', true ),
            'pos'         => 55,
            'permission'  => 'dokan_view_product_menu',
            'react_route' => 'cj-dropshipping',
        ];

        return $menus;
    }
}
