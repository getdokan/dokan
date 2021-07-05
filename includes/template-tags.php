<?php
/**
 * Custom template tags for this theme.
 *
 * Eventually, some of the functionality here could be replaced by core features
 *
 * @package dokan
 */

if ( ! function_exists( 'dokan_content_nav' ) ) :

    /**
     * Display navigation to next/previous pages when applicable
     */
    function dokan_content_nav( $nav_id, $query = null ) {
        global $wp_query, $post;

        if ( $query ) {
            $wp_query = $query; //phpcs:ignore
        }

        // Don't print empty markup on single pages if there's nowhere to navigate.
        if ( is_single() ) {
            $previous = ( is_attachment() ) ? get_post( $post->post_parent ) : get_adjacent_post( false, '', true );
            $next = get_adjacent_post( false, '', false );

            if ( ! $next && ! $previous ) {
                return;
            }
        }

        // Don't print empty markup in archives if there's only one page.
        if ( $wp_query->max_num_pages < 2 && ( is_home() || is_archive() || is_search() ) ) {
            return;
        }

        $nav_class = 'site-navigation paging-navigation';
        if ( is_single() ) {
            $nav_class = 'site-navigation post-navigation';
        }
        ?>
        <nav role="navigation" id="<?php echo esc_attr( $nav_id ); ?>" class="<?php echo esc_attr( $nav_class ); ?>">

            <ul class="pager">
            <?php if ( is_single() ) : // navigation links for single posts ?>

                <li class="previous">
                    <?php previous_post_link( '%link', _x( '&larr;', 'Previous post link', 'dokan-lite' ) . ' %title' ); ?>
                </li>
                <li class="next">
                    <?php next_post_link( '%link', '%title ' . _x( '&rarr;', 'Next post link', 'dokan-lite' ) ); ?>
                </li>

            <?php endif; ?>
            </ul>


            <?php if ( $wp_query->max_num_pages > 1 && ( dokan_is_store_page() || is_home() || is_archive() || is_search() ) ) : // navigation links for home, archive, and search pages ?>
                <?php dokan_page_navi( '', '', $wp_query ); ?>
            <?php endif; ?>

        </nav>
        <?php
    }

endif;

if ( ! function_exists( 'dokan_page_navi' ) ) :

    function dokan_page_navi( $before, $after, $wp_query ) {
        if ( ! ( $wp_query instanceof WP_Query ) ) {
            return;
        }

        $posts_per_page = intval( get_query_var( 'posts_per_page' ) );
        $paged          = intval( get_query_var( 'paged' ) );
        $numposts       = $wp_query->found_posts;
        $max_page       = $wp_query->max_num_pages;

        if ( $numposts <= $posts_per_page ) {
            return;
        }

        if ( empty( $paged ) || $paged === 0 ) {
            $paged = 1;
        }

        $pages_to_show         = 7;
        $pages_to_show_minus_1 = $pages_to_show - 1;
        $half_page_start       = floor( $pages_to_show_minus_1 / 2 );
        $half_page_end         = ceil( $pages_to_show_minus_1 / 2 );
        $start_page            = $paged - $half_page_start;

        if ( $start_page <= 0 ) {
            $start_page = 1;
        }

        $end_page = $paged + $half_page_end;

        if ( ( $end_page - $start_page ) !== $pages_to_show_minus_1 ) {
            $end_page = $start_page + $pages_to_show_minus_1;
        }

        if ( $end_page > $max_page ) {
            $start_page = $max_page - $pages_to_show_minus_1;
            $end_page = $max_page;
        }

        if ( $start_page <= 0 ) {
            $start_page = 1;
        }

        echo $before . '<div class="dokan-pagination-container"><ul class="dokan-pagination">';
        if ( $paged > 1 ) {
            $first_page_text = '&laquo;';
            echo '<li class="prev"><a href="' . esc_url( get_pagenum_link() ) . '" title="First">' . esc_html( $first_page_text ) . '</a></li>';
        }

        $prevposts = get_previous_posts_link( __( '&larr; Previous', 'dokan-lite' ) );
        if ( $prevposts ) {
            echo '<li>' . esc_url( $prevposts ) . '</li>';
        } else {
            echo '<li class="disabled"><a href="#">' . esc_html__( '&larr; Previous', 'dokan-lite' ) . '</a></li>';
        }

        for ( $i = $start_page; $i <= $end_page; $i++ ) {
            if ( $i === $paged ) {
                echo '<li class="active"><a href="#">' . esc_html( $i ) . '</a></li>';
            } else {
                echo '<li><a href="' . esc_url( get_pagenum_link( $i ) ) . '">' . esc_html( number_format_i18n( $i ) ) . '</a></li>';
            }
        }

        echo '<li class="">';
        next_posts_link( __( 'Next &rarr;', 'dokan-lite' ) );
        echo '</li>';

        if ( $end_page < $max_page ) {
            $last_page_text = '&rarr;';
            echo '<li class="next"><a href="' . esc_url( get_pagenum_link( $max_page ) ) . '" title="Last">' . esc_html( $last_page_text ) . '</a></li>';
        }

        echo '</ul></div>' . $after . ''; //phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
    }

endif;

function dokan_product_dashboard_errors() {
    $type = isset( $_GET['message'] ) ? sanitize_text_field( wp_unslash( $_GET['message'] ) ) : ''; //phpcs:ignore

    switch ( $type ) {
        case 'product_deleted':
            dokan_get_template_part(
                'global/dokan-success', '', array(
                    'deleted' => true,
                    'message' => __( 'Product succesfully deleted', 'dokan-lite' ),
                )
            );
            break;

        case 'error':
            dokan_get_template_part(
                'global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => __( 'Something went wrong!', 'dokan-lite' ),
                )
            );
            break;

        default:
            do_action( 'dokan_product_dashboard_errors', $type );
            break;
    }
}

function dokan_product_listing_status_filter() {
    $_get_data = wp_unslash( $_GET ); //phpcs:ignore

    $permalink         = dokan_get_navigation_url( 'products' );
    $status_class      = isset( $_get_data['post_status'] ) ? $_get_data['post_status'] : 'all';
    $post_counts       = dokan_count_posts( 'product', dokan_get_current_user_id() );
    $instock_counts    = dokan_count_stock_posts( 'product', dokan_get_current_user_id(), 'instock' );
    $outofstock_counts = dokan_count_stock_posts( 'product', dokan_get_current_user_id(), 'outofstock' );
    $statuses          = dokan_get_post_status();

    dokan_get_template_part(
        'products/listing-status-filter', '', array(
            'permalink'         => $permalink,
            'status_class'      => $status_class,
            'post_counts'       => $post_counts,
            'instock_counts'    => $instock_counts,
            'outofstock_counts' => $outofstock_counts,
            'statuses'          => $statuses,
        )
    );
}

function dokan_order_listing_status_filter() {
    $_get_data = wp_unslash( $_GET ); //phpcs:ignore

    $orders_url = dokan_get_navigation_url( 'orders' );

    $status_class         = isset( $_get_data['order_status'] ) ? $_get_data['order_status'] : 'all';
    $orders_counts        = dokan_count_orders( dokan_get_current_user_id() );
    $order_date           = ( isset( $_get_data['order_date'] ) ) ? $_get_data['order_date'] : '';
    $date_filter          = array();
    $all_order_url        = array();
    $complete_order_url   = array();
    $processing_order_url = array();
    $pending_order_url    = array();
    $on_hold_order_url    = array();
    $canceled_order_url   = array();
    $refund_order_url     = array();
    $failed_order_url     = array();
    ?>

    <ul class="list-inline order-statuses-filter">
        <li<?php echo $status_class === 'all' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $all_order_url = array_merge( $date_filter, array( 'order_status' => 'all' ) );
                $all_order_url = ( empty( $all_order_url ) ) ? $orders_url : add_query_arg( $complete_order_url, $orders_url );
            ?>
            <a href="<?php echo esc_url( $all_order_url ); ?>">
                <?php
                // translators: %d : order count total
                printf( esc_html__( 'All (%d)', 'dokan-lite' ), esc_attr( $orders_counts->total ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-completed' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $complete_order_url = array_merge( array( 'order_status' => 'wc-completed' ), $date_filter );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $complete_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count completed status
                printf( esc_html__( 'Completed (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-completed'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-processing' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $processing_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-processing' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $processing_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count processing status
                printf( esc_html__( 'Processing (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-processing'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-on-hold' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $on_hold_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-on-hold' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $on_hold_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count on hold status
                printf( esc_html__( 'On-hold (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-on-hold'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-pending' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $pending_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-pending' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $pending_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count pending status
                printf( esc_html__( 'Pending (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-pending'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-cancelled' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $canceled_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-cancelled' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $canceled_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count cancelled status
                printf( esc_html__( 'Cancelled (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-cancelled'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-refunded' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }
                $refund_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-refunded' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $refund_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count refunded status
                printf( esc_html__( 'Refunded (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-refunded'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-failed' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date'         => $order_date,
                    'dokan_order_filter' => 'Filter',
                );
            }

                $failed_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-failed' ) );
            ?>
            <a href="<?php echo esc_url( add_query_arg( $failed_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count failed status
                printf( esc_html__( 'Failed (%d)', 'dokan-lite' ), esc_attr( $orders_counts->{'wc-failed'} ) );
                ?>
                </span>
            </a>
        </li>

        <?php do_action( 'dokan_status_listing_item', $orders_counts ); ?>
    </ul>
    <?php
}

function dokan_nav_sort_by_pos( $a, $b ) {
    if ( isset( $a['pos'] ) && isset( $b['pos'] ) ) {
        return $a['pos'] - $b['pos'];
    } else {
        return 199;
    }
}

/**
 * Dashboard Navigation menus
 *
 * @return array
 */
function dokan_get_dashboard_nav() {
    $urls = array(
        'dashboard' => array(
            'title'      => __( 'Dashboard', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-tachometer"></i>',
            'url'        => dokan_get_navigation_url(),
            'pos'        => 10,
            'permission' => 'dokan_view_overview_menu',
        ),
        'products' => array(
            'title'      => __( 'Products', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-briefcase"></i>',
            'url'        => dokan_get_navigation_url( 'products' ),
            'pos'        => 30,
            'permission' => 'dokan_view_product_menu',
        ),
        'orders' => array(
            'title'      => __( 'Orders', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-shopping-cart"></i>',
            'url'        => dokan_get_navigation_url( 'orders' ),
            'pos'        => 50,
            'permission' => 'dokan_view_order_menu',
        ),

        'withdraw' => array(
            'title'      => __( 'Withdraw', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-upload"></i>',
            'url'        => dokan_get_navigation_url( 'withdraw' ),
            'pos'        => 70,
            'permission' => 'dokan_view_withdraw_menu',
        ),
    );

    $settings = array(
        'title' => sprintf( '%s <i class="fa fa-angle-right pull-right"></i>', __( 'Settings', 'dokan-lite' ) ),
        'icon'  => '<i class="fa fa-cog"></i>',
        'url'   => dokan_get_navigation_url( 'settings/store' ),
        'pos'   => 200,
    );

    $settings_sub = array(
        'back' => array(
            'title' => __( 'Back to Dashboard', 'dokan-lite' ),
            'icon'  => '<i class="fa fa-long-arrow-left"></i>',
            'url'   => dokan_get_navigation_url(),
            'pos'   => 10,
        ),
        'store' => array(
            'title'      => __( 'Store', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-university"></i>',
            'url'        => dokan_get_navigation_url( 'settings/store' ),
            'pos'        => 30,
            'permission' => 'dokan_view_store_settings_menu',
        ),
        'payment' => array(
            'title'      => __( 'Payment', 'dokan-lite' ),
            'icon'       => '<i class="fa fa-credit-card"></i>',
            'url'        => dokan_get_navigation_url( 'settings/payment' ),
            'pos'        => 50,
            'permission' => 'dokan_view_store_payment_menu',
        ),
    );

    /**
     * Filter to get the seller dashboard settings navigation.
     *
     * @since 2.2
     *
     * @param array.
     */
    $sub_settings = apply_filters( 'dokan_get_dashboard_settings_nav', $settings_sub );

    foreach ( $sub_settings as $key => $sub_setting ) {
        if ( ! isset( $sub_setting['pos'] ) && empty( $sub_setting['pos'] ) ) {
            $sub_setting['pos'] = '200';
        }

        $settings['sub'][ $key ] = $sub_setting;
    }

    uasort( $settings['sub'], 'dokan_nav_sort_by_pos' );

    // Filter Sub setting menu according to permission
    $settings['sub'] = array_filter( $settings['sub'], 'dokan_check_menu_permission' );

    // Manage main settings url after re-render permission cheching
    if ( count( $settings['sub'] ) > 1 ) {
        $urls['settings'] = $settings;
        $sub_settings_key = array_keys( $settings['sub'] );
        $urls['settings']['url'] = $settings['sub'][ $sub_settings_key[1] ]['url'];
    }

    $nav_urls = apply_filters( 'dokan_get_dashboard_nav', $urls );

    uasort( $nav_urls, 'dokan_nav_sort_by_pos' );

    // Filter main menu according to permission
    $nav_urls = array_filter( $nav_urls, 'dokan_check_menu_permission' );

    /**
     * Filter to get the final seller dashboard navigation.
     *
     * @since 2.2
     *
     * @param array $urls.
     */
    return $nav_urls;
}

/**
 * Checking menu permissions
 *
 * @since 2.7.3
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
 * The active menu will be splitted at `/` and the `menu_key_name` will be matched
 * with settings sub menu array. If it's a match, the settings menu will be shown
 * only. Otherwise the main navigation menu will be shown.
 *
 * @param  string  $active_menu
 *
 * @return string rendered menu HTML
 */
function dokan_dashboard_nav( $active_menu = '' ) {
    $nav_menu          = dokan_get_dashboard_nav();
    $active_menu_parts = explode( '/', $active_menu );

    if ( $active_menu && false !== strpos( $active_menu, '/' ) ) {
        $active_menu = $active_menu_parts[1];
    }

    /**
     * Filters the settings' key.
     *
     * @param string $settings_key "settings" (default)
     *
     * @return string
     */
    $settings_key = apply_filters( 'dokan_dashboard_nav_settings_key', 'settings' );

    if ( isset( $active_menu_parts[1] )
            && ( $active_menu_parts[1] === $settings_key || $active_menu_parts[0] === $settings_key )
            && isset( $nav_menu[ $settings_key ]['sub'] )
            && ( array_key_exists( $active_menu_parts[1], $nav_menu[ $settings_key ]['sub'] ) || array_key_exists( $active_menu_parts[2], $nav_menu[ $settings_key ]['sub'] ) )
    ) {
        $urls        = $nav_menu[ $settings_key ]['sub'];
        $active_menu = $active_menu_parts[1] === $settings_key ? $active_menu_parts[2] : $active_menu_parts[1];
    } else {
        $urls = $nav_menu;
    }

    $menu           = '';
    $hamburger_menu = apply_filters( 'dokan_load_hamburger_menu', true );

    if ( $hamburger_menu ) {
        $menu .= '<div id="dokan-navigation" aria-label="Menu">';
        $menu .= '<label id="mobile-menu-icon" for="toggle-mobile-menu" aria-label="Menu">&#9776;</label>';
        $menu .= '<input id="toggle-mobile-menu" type="checkbox" />';
    }

    $menu .= '<ul class="dokan-dashboard-menu">';

    foreach ( $urls as $key => $item ) {
        $class = ( $active_menu === $key ) ? 'active ' . $key : $key;
        $menu .= sprintf( '<li class="%s"><a href="%s">%s %s</a></li>', $class, $item['url'], $item['icon'], $item['title'] );
    }

    $common_links = '<li class="dokan-common-links dokan-clearfix">
            <a title="' . __( 'Visit Store', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . dokan_get_store_url( dokan_get_current_user_id() ) . '" target="_blank"><i class="fa fa-external-link"></i></a>
            <a title="' . __( 'Edit Account', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . dokan_get_navigation_url( 'edit-account' ) . '"><i class="fa fa-user"></i></a>
            <a title="' . __( 'Log out', 'dokan-lite' ) . '" class="tips" data-placement="top" href="' . wp_logout_url( home_url() ) . '"><i class="fa fa-power-off"></i></a>
        </li>';

    $menu .= apply_filters( 'dokan_dashboard_nav_common_link', $common_links );

    $menu .= '</ul>';

    if ( $hamburger_menu ) {
        $menu .= '</div>';
    }

    return $menu;
}


if ( ! function_exists( 'dokan_store_category_menu' ) ) :

    /**
     * Store category menu for a store
     *
     * @param  int $seller_id
     * @return void
     */
    function dokan_store_category_menu( $seller_id, $title = '' ) {
        ?>
    <div id="cat-drop-stack" class="store-cat-stack-dokan">
        <?php
        $vendor      = dokan()->vendor->get( get_query_var( 'author' ) );
        $vendor_id   = $vendor->get_id();
        $products    = $vendor->get_products();
        $product_ids = [];
        foreach ( $products->posts as $product ) {
            array_push( $product_ids, $product->ID );
        }
        // hold all the terms
        $all_terms = [];
        foreach ( $product_ids as $product_id ) {
            $terms = get_the_terms( $product_id, 'product_cat' );

            //allow when there is terms and do not have any wp_errors
            if ( $terms && ! is_wp_error( $terms ) ) {
                foreach ( $terms as $term ) {
                    array_push( $all_terms, $term );
                }
            }
        }
        // hold unique categoreis
        $categories = [];
        foreach ( $all_terms as $term ) {
            $categories[ serialize( $term ) ] = $term;
        }
        $categories = array_values( $categories );
        $walker = new \WeDevs\Dokan\Walkers\StoreCategory( $seller_id );
        echo '<ul>';
        echo call_user_func_array( array( &$walker, 'walk' ), array( $categories, 0, array() ) ); //phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        echo '</ul>';
        ?>
    </div>
        <?php
    }

endif;

function dokan_seller_reg_form_fields() {
    $postdata   = wc_clean( $_POST ); //phpcs:ignore
    $role       = isset( $postdata['role'] ) ? $postdata['role'] : 'customer';
    $role_style = ( $role === 'customer' ) ? 'display:none' : '';

    dokan_get_template_part(
        'global/seller-registration-form', '', array(
            'postdata' => $postdata,
            'role' => $role,
            'role_style' => $role_style,
        )
    );
}

add_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' );

if ( ! function_exists( 'dokan_seller_not_enabled_notice' ) ) :

    function dokan_seller_not_enabled_notice() {
        dokan_get_template_part( 'global/seller-warning' );
    }

endif;

if ( ! function_exists( 'dokan_header_user_menu' ) ) :

    /**
     * User top navigation menu
     *
     * @return void
     */
    function dokan_header_user_menu() {
        global $current_user;

        $user_id  = dokan_get_current_user_id();
        $nav_urls = dokan_get_dashboard_nav();

        dokan_get_template_part(
            'global/header-menu', '', array(
                'current_user' => $current_user,
                'user_id' => $user_id,
                'nav_urls' => $nav_urls,
            )
        );
    }

endif;

add_action( 'template_redirect', 'dokan_myorder_login_check' );

/**
 * Redirect My order in Login page without user logged login
 *
 * @since 2.4
 *
 * @return [redirect]
 */
function dokan_myorder_login_check() {
    global $post;

    if ( ! $post ) {
        return;
    }

    if ( ! isset( $post->ID ) ) {
        return;
    }

    $my_order_page_id = dokan_get_option( 'my_orders', 'dokan_pages' );

    if ( (int) $my_order_page_id === $post->ID ) {
        dokan_redirect_login();
    }
}

/**
 * Store sidebar widget args
 *
 * @return array
 */
function dokan_store_sidebar_args() {
    $args = [
        'before_widget' => '<aside class="widget dokan-store-widget %s">',
        'after_widget'  => '</aside>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ];

    return apply_filters( 'dokan_store_sidebar_args', $args );
}

/**
 * Store single category widget
 *
 * @return void
 */
function dokan_store_category_widget() {
    $args = dokan_store_sidebar_args();

    if ( dokan()->widgets->is_exists( 'store_category_menu' ) ) {
        the_widget( dokan()->widgets->store_category_menu, [ 'title' => __( 'Store Product Category', 'dokan-lite' ) ], $args );
    }
}

/**
 * Store single location widget
 *
 * @return void
 */
function dokan_store_location_widget() {
    $args = dokan_store_sidebar_args();

    if ( dokan()->widgets->is_exists( 'store_location' ) && 'on' === dokan_get_option( 'store_map', 'dokan_general', 'on' ) ) {
        the_widget( dokan()->widgets->store_location, [ 'title' => __( 'Store Location', 'dokan-lite' ) ], $args );
    }
}

/**
 * Store opening/closing time widget
 *
 * @return void
 */
function dokan_store_time_widget() {
    $args = dokan_store_sidebar_args();

    if ( dokan()->widgets->is_exists( 'store_open_close' ) && 'on' === dokan_get_option( 'store_open_close', 'dokan_general', 'on' ) ) {
        the_widget( dokan()->widgets->store_open_close, [ 'title' => __( 'Store Time', 'dokan-lite' ) ], $args );
    }
}

/**
 * Store contact form widget
 *
 * @return void
 */
function dokan_store_contact_widget() {
    $args = dokan_store_sidebar_args();

    if ( dokan()->widgets->is_exists( 'store_contact_form' ) && 'on' === dokan_get_option( 'contact_seller', 'dokan_general', 'on' ) ) {
        the_widget( dokan()->widgets->store_contact_form, [ 'title' => __( 'Contact Vendor', 'dokan-lite' ) ], $args );
    }
}
