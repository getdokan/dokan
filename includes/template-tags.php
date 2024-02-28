<?php
/**
 * Custom template tags for this theme.
 *
 * Eventually, some of the functionality here could be replaced by core features
 *
 * @package dokan
 */

use WeDevs\Dokan\Vendor\Vendor;

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

        echo wp_kses_post( $before ) . '<div class="dokan-pagination-container"><ul class="dokan-pagination">';
        if ( $paged > 1 ) {
            $first_page_text = '&laquo;';
            echo '<li class="prev"><a href="' . esc_url( get_pagenum_link() ) . '" title="First">' . esc_html( $first_page_text ) . '</a></li>';
        }

        $prevposts = get_previous_posts_link( __( '&larr; Previous', 'dokan-lite' ) );
        if ( $prevposts ) {
            echo '<li>' . wp_kses( $prevposts, [ 'a' => [ 'href' => [] ] ] ) . '</li>';
        } else {
            echo '<li class="disabled"><a href="#">' . esc_html__( '&larr; Previous', 'dokan-lite' ) . '</a></li>';
        }
        for ( $i = $start_page; $i <= $end_page; $i++ ) {
            if ( (int) $i === $paged ) {
                echo '<li class="active"><a href="#">' . esc_html( $i ) . '</a></li>';
            } else {
                echo '<li><a href="' . esc_url( get_pagenum_link( $i ) ) . '">' . esc_html( number_format_i18n( $i ) ) . '</a></li>';
            }
        }

        if ( (int) $paged < $max_page ) {
            echo '<li class="">';
            next_posts_link( __( 'Next &rarr;', 'dokan-lite' ) );
            echo '</li>';
        } else {
            echo '<li class="disabled"><a href="#">' . esc_html__( 'Next &rarr;', 'dokan-lite' ) . '</a></li>';
        }
        if ( (int) $paged < $max_page ) {
            $last_page_text = '&raquo;';
            echo '<li class="next"><a href="' . esc_url( get_pagenum_link( $max_page ) ) . '" title="Last">' . esc_html( $last_page_text ) . '</a></li>';
        }

        echo '</ul></div>' . wp_kses_post( $after );
    }

endif;

function dokan_product_dashboard_errors() {
    $type = isset( $_GET['message'] ) ? sanitize_text_field( wp_unslash( $_GET['message'] ) ) : ''; //phpcs:ignore

    switch ( $type ) {
        case 'product_deleted':
            dokan_get_template_part(
                'global/dokan-success', '', array(
                    'deleted' => true,
                    'message' => __( 'Product successfully deleted', 'dokan-lite' ),
                )
            );
            break;
        case 'product_duplicated':
            dokan_get_template_part(
                'global/dokan-success', '', [
                    'deleted' => false,
                    'message' => __( 'Product successfully duplicated', 'dokan-lite' ),
                ]
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
    $permalink         = dokan_get_navigation_url( 'products' );
    $status_class      = 'all';
    $post_counts       = dokan_count_posts( 'product', dokan_get_current_user_id() );
    $instock_counts    = dokan_count_stock_posts( 'product', dokan_get_current_user_id(), 'instock' );
    $outofstock_counts = dokan_count_stock_posts( 'product', dokan_get_current_user_id(), 'outofstock' );
    $statuses          = dokan_get_post_status();

    if ( isset( $_GET['_product_listing_filter_nonce'], $_GET['post_status'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_product_listing_filter_nonce'] ) ), 'product_listing_filter' ) ) {
        $status_class = sanitize_text_field( wp_unslash( $_GET['post_status'] ) );
    }

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
    $orders_url = dokan_get_navigation_url( 'orders' );

    $status_class         = 'all';
    $orders_counts        = dokan_count_orders( dokan_get_current_user_id() );
    $order_date           = '';
    $date_filter          = array();
    $all_order_url        = array();
    $complete_order_url   = array();
    $processing_order_url = array();
    $pending_order_url    = array();
    $on_hold_order_url    = array();
    $canceled_order_url   = array();
    $refund_order_url     = array();
    $failed_order_url     = array();
    $filter_nonce         = wp_create_nonce( 'seller-order-filter-nonce' );

    if ( isset( $_GET['seller_order_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['seller_order_filter_nonce'] ) ), 'seller-order-filter-nonce' ) ) {
        $status_class = isset( $_GET['order_status'] ) ? sanitize_text_field( wp_unslash( $_GET['order_status'] ) ) : $status_class;
        $order_date   = isset( $_GET['order_date'] ) ? sanitize_text_field( wp_unslash( $_GET['order_date'] ) ) : $order_date;
    }
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
            $all_order_url = array_merge( $date_filter, array( 'order_status' => 'all', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            $all_order_url = ( empty( $all_order_url ) ) ? $orders_url : add_query_arg( $complete_order_url, $orders_url );
            ?>
            <a href="<?php echo esc_url( $all_order_url ); ?>">
                <?php
                // translators: %d : order count total
                printf( esc_html__( 'All (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->total ) );
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
            $complete_order_url = array_merge( array( 'order_status' => 'wc-completed', 'seller_order_filter_nonce' => $filter_nonce ), $date_filter ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $complete_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count completed status
                printf( esc_html__( 'Completed (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-completed'} ) );
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
            $processing_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-processing', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $processing_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count processing status
                printf( esc_html__( 'Processing (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-processing'} ) );
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
            $on_hold_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-on-hold', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $on_hold_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count on hold status
                printf( esc_html__( 'On-hold (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-on-hold'} ) );
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
            $pending_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-pending', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $pending_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count pending status
                printf( esc_html__( 'Pending (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-pending'} ) );
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
            $canceled_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-cancelled', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $canceled_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count cancelled status
                printf( esc_html__( 'Cancelled (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-cancelled'} ) );
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
            $refund_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-refunded', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $refund_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count refunded status
                printf( esc_html__( 'Refunded (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-refunded'} ) );
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

            $failed_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-failed', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $failed_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count failed status
                printf( esc_html__( 'Failed (%s)', 'dokan-lite' ), number_format_i18n( $orders_counts->{'wc-failed'} ) );
                ?>
                </span>
            </a>
        </li>

        <?php do_action( 'dokan_status_listing_item', $orders_counts ); ?>
    </ul>
    <?php
}

if ( ! function_exists( 'dokan_store_category_menu' ) ) :

    /**
     * Store category menu for a store
     *
     * @param  int $seller_id
     *
     * @since 3.2.11 rewritten whole function
     *
     * @return void
     */
    function dokan_store_category_menu( $seller_id, $title = '' ) {
        ?>
    <div class="store-cat-stack-dokan cat-drop-stack">
        <?php
        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;
        $vendor    = dokan()->vendor->get( $seller_id );
        if ( $vendor instanceof Vendor ) {
            $categories = $vendor->get_store_categories();
            $walker = new \WeDevs\Dokan\Walkers\StoreCategory( $seller_id );
            echo '<ul>';
            echo call_user_func_array( array( &$walker, 'walk' ), array( $categories, 0, array() ) ); //phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            echo '</ul>';
        }
        ?>
    </div>
        <?php
    }

endif;
if ( ! function_exists( 'dokan_store_term_menu_list' ) ) :

    /**
     * Store category menu for a store
     *
     * @since 3.5.0
     *
     * @param int    $seller_id
     * @param array  $taxonomy
     * @param string $query_type
     *
     * @return void
     */
    function dokan_store_term_menu_list( $seller_id, $taxonomy, $query_type ) {
        ?>
    <div class="store-cat-stack-dokan cat-drop-stack">
        <?php
        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;
        $vendor    = dokan()->vendor->get( $seller_id );
        $store_url = dokan_get_store_url( $seller_id );

        if ( $vendor instanceof Vendor ) {
            $terms = $vendor->get_vendor_used_terms_list( $seller_id, $taxonomy );

            echo '<ul>';
            $_chosen_attributes = dokan_get_chosen_taxonomy_attributes();
            foreach ( $terms as $term ) {
                $current_values = isset( $_chosen_attributes[ $taxonomy ]['terms'] ) ? $_chosen_attributes[ $taxonomy ]['terms'] : [];
                $option_is_set  = in_array( $term->slug, $current_values, true );
                $filter_name    = 'filter_' . wc_attribute_taxonomy_slug( $taxonomy );
                // phpcs:ignore
                $current_filter = isset( $_GET[ $filter_name ] ) ? explode( ',', wc_clean( wp_unslash( $_GET[ $filter_name ] ) ) ) : array();

                if ( ! in_array( $term->slug, $current_filter, true ) ) {
                    $current_filter[] = $term->slug;
                }

                $link = remove_query_arg( $filter_name, $store_url );
                // Add current filters to URL.
                foreach ( $current_filter as $key => $value ) {
                    // Exclude query arg for current term archive term.
                    if ( $value === dokan_get_current_term_slug() ) {
                        unset( $current_filter[ $key ] );
                    }

                    // Exclude self so filter can be unset on click.
                    if ( $option_is_set && $value === $term->slug ) {
                        unset( $current_filter[ $key ] );
                    }
                }

                if ( ! empty( $current_filter ) ) {
                    asort( $current_filter );
                    $link = add_query_arg( $filter_name, implode( ',', $current_filter ), $link );

                    // Add Query type Arg to URL.
                    if ( 'or' === $query_type && ! ( 1 === count( $current_filter ) && $option_is_set ) ) {
                        $link = add_query_arg( 'query_type_' . wc_attribute_taxonomy_slug( $taxonomy ), 'or', $link );
                    }
                    $link = str_replace( '%2C', ',', $link );
                }

                $checked = '';
                if ( $option_is_set ) {
                    $checked = 'checked';
                }

                echo '
                <li class="parent-cat-wrap">
                    <a href=' . esc_url( $link ) . '> <input style="pointer-events: none;" type="checkbox" ' . $checked . '> &nbsp;' . $term->name . ' <span style="float: right" class="count">(' . $term->count . ')</span> </a>
                </li>';
            }
            echo '</ul>';
        }
        ?>
    </div>
        <?php
    }

endif;
/**
 * Return the currently viewed term slug.
 *
 * @return int
 */
function dokan_get_current_term_slug() {
    return absint( is_tax() ? get_queried_object()->slug : 0 );
}

/**
 * Get chosen taxonomy attributes.
 *
 * @since 3.5.0
 *
 * @return array
 */
function dokan_get_chosen_taxonomy_attributes() {
    $attributes = [];
    // phpcs:disable WordPress.Security.NonceVerification.Recommended
    if ( empty( $_GET ) ) {
        return $attributes;
    }

    foreach ( $_GET as $key => $value ) {
        if ( 0 !== strpos( $key, 'filter_' ) ) {
            continue;
        }

        $attribute    = wc_sanitize_taxonomy_name( str_replace( 'filter_', '', $key ) );
        $taxonomy     = wc_attribute_taxonomy_name( $attribute );
        $filter_terms = ! empty( $value ) ? explode( ',', wc_clean( wp_unslash( $value ) ) ) : [];

        if ( empty( $filter_terms ) || ! taxonomy_exists( $taxonomy ) || ! wc_attribute_taxonomy_id_by_name( $attribute ) ) {
            continue;
        }

        // phpcs:ignore
        $query_type                            = ! empty( $_GET['query_type_' . $attribute] ) && in_array(  $_GET['query_type_' . $attribute], [ 'and', 'or' ], true ) ? wc_clean( wp_unslash( $_GET['query_type_' . $attribute] ) ) : '';
        $attributes[ $taxonomy ]['terms']      = array_map( 'sanitize_title', $filter_terms ); // Ensures correct encoding.
        $attributes[ $taxonomy ]['query_type'] = $query_type ? $query_type : 'and';
    }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended
    return $attributes;
}

function dokan_seller_reg_form_fields() {
    $data       = dokan_get_seller_registration_form_data();
    $role       = isset( $data['role'] ) ? $data['role'] : 'customer';
    $role_style = ( $role === 'customer' ) ? 'display:none' : '';

    dokan_get_template_part(
        'global/seller-registration-form', '', [
            'data'       => $data,
            'role'       => $role,
            'role_style' => $role_style,
        ]
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

/**
 * Get Dokan seller registration form data
 *
 * @since 3.7.0
 *
 * @return string[]
 */
function dokan_get_seller_registration_form_data() {
    $set_password = get_option( 'woocommerce_registration_generate_password', 'no' ) !== 'yes';

    // prepare form data
    $data = [
        'fname'    => '',
        'lname'    => '',
        'username' => '',
        'email'    => '',
        'phone'    => '',
        'shopname' => '',
        'shopurl'  => '',
    ];

    if ( $set_password ) {
        $data['password'] = '';
    }
    // check if user submitted data
    if ( isset( $_POST['woocommerce-register-nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_POST['woocommerce-register-nonce'] ) ), 'woocommerce-register' ) ) {
        $data = [
            'fname'    => isset( $_POST['fname'] ) ? sanitize_text_field( wp_unslash( $_POST['fname'] ) ) : '',
            'lname'    => isset( $_POST['lname'] ) ? sanitize_text_field( wp_unslash( $_POST['lname'] ) ) : '',
            'username' => isset( $_POST['username'] ) ? sanitize_user( wp_unslash( $_POST['username'] ) ) : '',
            'email'    => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
            'phone'    => isset( $_POST['phone'] ) ? dokan_sanitize_phone_number( wp_unslash( $_POST['phone'] ) ) : '', // phpcs:ignore
            'password' => isset( $_POST['password'] ) ? wp_unslash( $_POST['password'] ) : '', // phpcs:ignore
            'shopname' => isset( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '',
            'shopurl'  => isset( $_POST['shopurl'] ) ? sanitize_title( wp_unslash( $_POST['shopurl'] ) ) : '',
        ];
        if ( $set_password ) {
            $data['password'] = isset( $_POST['password'] ) ? wp_unslash( $_POST['password'] ) : ''; // phpcs:ignore;
        }
    }

    return $data;
}
