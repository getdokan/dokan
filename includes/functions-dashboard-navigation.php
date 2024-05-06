<?php
/**
 * Sort navigation menu items by position
 *
 * @since 3.10.0 moved this method from includes/template-tags.php
 *
 * @param array $a first item
 * @param array $b second item
 *
 * @return int
 */
function dokan_nav_sort_by_pos( $a, $b ) {
    if ( isset( $a['pos'] ) && isset( $b['pos'] ) ) {
        return intval( $a['pos'] - $b['pos'] );
    } else {
        return 199;
    }
}

/**
 * Get Dashboard Navigation menus
 *
 * @since 3.10.0 moved this method from includes/template-tags.php
 *
 * @return array
 */
function dokan_get_dashboard_nav(): array {
    $menus = [
        'dashboard' => [
            'title'      => __( 'Dashboard', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-tachometer-alt"></i>',
            'url'        => dokan_get_navigation_url(),
            'pos'        => 10,
            'permission' => 'dokan_view_overview_menu',
        ],
        'products'  => [
            'title'      => __( 'Products', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-briefcase"></i>',
            'url'        => dokan_get_navigation_url( 'products' ),
            'pos'        => 30,
            'permission' => 'dokan_view_product_menu',
        ],
        'orders'    => [
            'title'      => __( 'Orders', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-shopping-cart"></i>',
            'url'        => dokan_get_navigation_url( 'orders' ),
            'pos'        => 50,
            'permission' => 'dokan_view_order_menu',
        ],
        'withdraw'  => [
            'title'      => __( 'Withdraw', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-upload"></i>',
            'url'        => dokan_get_navigation_url( 'withdraw' ),
            'pos'        => 70,
            'permission' => 'dokan_view_withdraw_menu',
        ],
        'settings'  => [
            'title' => __( 'Settings', 'dokan-lite' ),
            'icon'  => '<i class="fas fa-cog"></i>',
            'url'   => dokan_get_navigation_url( 'settings/store' ),
            'pos'   => 200,
        ],
    ];

    $settings_sub = [
        'store'   => [
            'title'      => __( 'Store', 'dokan-lite' ),
            'icon'       => '<i class="fas fa-university"></i>',
            'url'        => dokan_get_navigation_url( 'settings/store' ),
            'pos'        => 30,
            'permission' => 'dokan_view_store_settings_menu',
        ],
        'payment' => [
            'title'      => __( 'Payment', 'dokan-lite' ),
            'icon'       => '<i class="far fa-credit-card"></i>',
            'url'        => dokan_get_navigation_url( 'settings/payment' ),
            'pos'        => 50,
            'permission' => 'dokan_view_store_payment_menu',
        ],
    ];

    /**
     * Filter to get the seller dashboard settings navigation.
     *
     * @since 2.2
     *
     * @param array.
     */
    $menus['settings']['submenu'] = apply_filters( 'dokan_get_dashboard_settings_nav', $settings_sub );

    /**
     * Filters nav menu items.
     *
     * @param array<string,array> $menus
     */
    $nav_menus = apply_filters( 'dokan_get_dashboard_nav', $menus );

    foreach ( $nav_menus as $nav_key => $menu ) {
        if ( ! isset( $menu['pos'] ) ) {
            $nav_menus[ $nav_key ]['pos'] = 190;
        }

        $submenu_items = empty( $menu['submenu'] ) ? [] : $menu['submenu'];

        /**
         * Filters the vendor dashboard submenu item for each menu.
         *
         * @since 3.7.7
         *
         * @param array<string,array> $submenu_items Associative array of submenu items.
         * @param string              $menu_key      Key of the corresponding menu.
         */
        $submenu_items = apply_filters( 'dokan_dashboard_nav_submenu', $submenu_items, $nav_key );

        if ( empty( $submenu_items ) ) {
            continue;
        }

        foreach ( $submenu_items as $key => $submenu ) {
            if ( ! isset( $submenu['pos'] ) ) {
                $submenu['pos'] = 200;
            }

            $submenu_items[ $key ] = $submenu;
        }

        // Sort items according to positional value
        uasort( $submenu_items, 'dokan_nav_sort_by_pos' );

        // Filter items according to permissions
        $submenu_items = array_filter( $submenu_items, 'dokan_check_menu_permission' );

        // Manage a menu with submenus after permission check
        if ( count( $submenu_items ) < 1 ) {
            unset( $nav_menus[ $nav_key ] );
        } else {
            $nav_menus[ $nav_key ]['submenu'] = $submenu_items;
        }
    }

    // Sort items according to positional value
    uasort( $nav_menus, 'dokan_nav_sort_by_pos' );

    // Filter the main menu according to permission
    $nav_menus = array_filter( $nav_menus, 'dokan_check_menu_permission' );

    return $nav_menus;
}

/**
 * Checking menu permissions
 *
 * @since 2.7.3
 * @since 3.10.0 moved this method from includes/template-tags.php
 *
 * @return boolean
 */
function dokan_check_menu_permission( $menu ) {
    if ( isset( $menu['permission'] ) && ! current_user_can( $menu['permission'] ) ) {
        return false;
    }

    return true;
}

/**
 * Renders the Dokan dashboard menu
 *
 * For settings menu, the active menu format is `settings/menu_key_name`.
 * The active menu will be split at `/` and the `menu_key_name` will be matched
 * with a settings sub menu array. If it's a match, the settings menu will be shown
 * only. Otherwise, the main navigation menu will be shown.
 *
 * @since 3.10.0 moved this method from includes/template-tags.php
 *
 * @param string $active_menu
 *
 * @return string rendered menu HTML
 */
function dokan_dashboard_nav( $active_menu = '' ) {
    $nav_menu          = dokan_get_dashboard_nav();
    $active_menu_parts = explode( '/', $active_menu );
    $active_submenu    = '';

    if ( $active_menu && false !== strpos( $active_menu, '/' ) ) {
        $active_menu    = $active_menu_parts[0];
        $active_submenu = $active_menu_parts[1];
    }

    $menu           = '';
    $hamburger_menu = apply_filters( 'dokan_load_hamburger_menu', true );

    if ( $hamburger_menu ) {
        $menu      .= '<div id="dokan-navigation" aria-label="Menu">';
        $hamburger = apply_filters(
            'dokan_vendor_dashboard_menu_hamburger',
            '<label id="mobile-menu-icon" for="toggle-mobile-menu" aria-label="Menu">&#9776;</label><input id="toggle-mobile-menu" type="checkbox" />'
        );

        $menu .= $hamburger;
    }

    $menu .= '<ul class="dokan-dashboard-menu">';

    foreach ( $nav_menu as $key => $item ) {
        // If switched off from menu manager
        if ( isset( $item['is_switched_on'] ) && ! $item['is_switched_on'] ) {
            continue;
        }
        /**
         * Filters a menu key according to slug if needed.
         *
         * @since DOKAN_PRO_SINCE
         *
         * @param string $menu_key
         */
        $filtered_key = apply_filters( 'dokan_dashboard_nav_menu_key', $key );

        $class = $active_menu === $filtered_key || 0 === stripos( $active_menu, $filtered_key ) ? 'active ' . $key : $key;  // checking starts with the key
        $title = __( 'No Title', 'dokan-lite' );

        if ( ! empty( $item['menu_manager_title'] ) ) {
            $title = $item['menu_manager_title'];
        } elseif ( ! empty( $item['title'] ) ) {
            $title = $item['title'];
        }

        $menu_slug = $filtered_key;
        $submenu   = '';

        if ( ! empty( $item['submenu'] ) ) {
            $class        .= ' has-submenu';
            $title        .= ' <i class="fas fa-caret-right menu-dropdown"></i>';
            $submenu      = sprintf( '<ul class="navigation-submenu %s">', $key );
            $subkey_slugs = [];

            foreach ( $item['submenu'] as $sub_key => $sub ) {
                // If switched off from menu manager
                if ( isset( $sub['is_switched_on'] ) && ! $sub['is_switched_on'] ) {
                    continue;
                }
                /**
                 * Filters a menu key according to slug if needed.
                 *
                 * @since 3.10.3
                 *
                 * @param string $submenu_key
                 * @param string $menu_key
                 */
                $filtered_subkey = apply_filters( 'dokan_dashboard_nav_submenu_key', $sub_key, $key );

                $submenu_class = $active_submenu === $filtered_subkey || 0 === stripos( $active_submenu, $filtered_subkey ) ? "current $sub_key" : $sub_key;
                $submenu_title = __( 'No Title', 'dokan-lite' );

                if ( ! empty( $sub['menu_manager_title'] ) ) {
                    $submenu_title = $sub['menu_manager_title'];
                } elseif ( ! empty( $sub['title'] ) ) {
                    $submenu_title = $sub['title'];
                }

                $submenu .= sprintf(
                    '<li class="submenu-item %s"><a href="%s" class="submenu-link">%s %s</a></li>',
                    $submenu_class,
                    isset( $sub['url'] ) ? $sub['url'] : dokan_get_navigation_url( "{$key}/{$sub_key}" ),
                    isset( $sub['icon'] ) ? $sub['icon'] : '<i class="fab fa-staylinked"></i>',
                    apply_filters( 'dokan_vendor_dashboard_menu_title', $submenu_title, $sub )
                );

                $subkey_slugs[] = $filtered_subkey;
            }

            $submenu .= '</ul>';

            // Building parent menu slug pointing to the first submenu item
            if ( isset( $subkey_slugs[0] ) ) {
                $menu_slug = trailingslashit( $menu_slug ) . $subkey_slugs[0];
            }
        }

        $menu .= sprintf(
            '<li class="%s"><a href="%s">%s %s</a>%s</li>',
            $class,
            isset( $item['url'] ) ? $item['url'] : dokan_get_navigation_url( $menu_slug ),
            isset( $item['icon'] ) ? $item['icon'] : '<i class="fab fa-staylinked"></i>',
            apply_filters( 'dokan_vendor_dashboard_menu_title', $title, $item ),
            $submenu
        );
    }

    $common_links = '<li class="dokan-common-links dokan-clearfix">
            <a title="' . __( 'Visit Store', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . dokan_get_store_url( dokan_get_current_user_id() ) . '" target="_blank"><i class="fas fa-external-link-alt"></i></a>
            <a title="' . __( 'Edit Account', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . dokan_get_navigation_url( 'edit-account' ) . '"><i class="fas fa-user"></i></a>
            <a title="' . __( 'Log out', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . wp_logout_url( home_url() ) . '"><i class="fas fa-power-off"></i></a>
        </li>';

    $menu .= apply_filters( 'dokan_dashboard_nav_common_link', $common_links );

    $menu .= '</ul>';

    if ( $hamburger_menu ) {
        $menu .= '</div>';
    }

    return $menu;
}
