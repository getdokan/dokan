<?php

namespace WeDevs\Dokan;

/**
* Core Class for Dokan Main functionality
*
* @package dokan
*
* @since 3.0.0
*/
class Core {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        add_action( 'admin_init', array( $this, 'block_admin_access' ) );
        add_filter( 'posts_where', array( $this, 'hide_others_uploads' ) );
        add_filter( 'body_class', array( $this, 'add_dashboard_template_class' ), 99 );
        add_filter( 'wp_title', array( $this, 'wp_title' ), 20, 2 );
        add_action( 'template_redirect', array( $this, 'redirect_if_not_logged_seller' ), 11 );
        add_action( 'admin_init', array( $this, 'redirect_after_activate' ), 999 );
    }

    /**
     * Block user access to admin panel for specific roles
     *
     * @since 1.0.0
     *
     * @global string $pagenow
     */
    function block_admin_access() {
        global $pagenow, $current_user;

        // bail out if we are from WP Cli
        if ( defined( 'WP_CLI' ) ) {
            return;
        }

        $no_access   = dokan_get_option( 'admin_access', 'dokan_general', 'on' );
        $valid_pages = array( 'admin-ajax.php', 'admin-post.php', 'async-upload.php', 'media-upload.php' );
        $user_role   = reset( $current_user->roles );

        if ( ( 'on' == $no_access ) && ( ! in_array( $pagenow, $valid_pages ) ) && in_array( $user_role, array( 'seller', 'customer', 'vendor_staff' ) ) ) {
            wp_redirect( home_url() );
            exit;
        }
    }

    /**
     * Hide other users uploads for `seller` users
     *
     * Hide media uploads in page "upload.php" and "media-upload.php" for
     * sellers. They can see only thier uploads.
     *
     * FIXME: fix the upload counts
     *
     * @global string $pagenow
     * @global object $wpdb
     *
     * @param string  $where
     *
     * @return string
     */
    function hide_others_uploads( $where ) {
        global $pagenow, $wpdb;

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return $where;
        }

        if ( ( $pagenow == 'upload.php' || $pagenow == 'media-upload.php' ) && current_user_can( 'dokandar' ) ) {
            $user_id = dokan_get_current_user_id();

            $where .= " AND $wpdb->posts.post_author = $user_id";
        }

        return $where;
    }

    /**
     * Add body class for dokan-dashboard
     *
     * @since 3.0.0
     *
     * @param array $classes
     */
    function add_dashboard_template_class( $classes ) {
        $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

        if ( ! $page_id ) {
            return $classes;
        }

        if ( is_page( $page_id ) || ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) {
            $classes[] = 'dokan-dashboard';
        }

        if ( dokan_is_store_page() ) {
            $classes[] = 'dokan-store';
        }

        $classes[] = 'dokan-theme-' . get_option( 'template' );

        return $classes;
    }

    /**
     * Create a nicely formatted and more specific title element text for output
     * in head of document, based on current view.
     *
     * @since Dokan 1.0.4
     *
     * @param string  $title Default title text for current view.
     * @param string  $sep   Optional separator.
     *
     * @return string The filtered title.
     */
    function wp_title( $title, $sep ) {
        global $paged, $page;

        if ( is_feed() ) {
            return $title;
        }

        if ( dokan_is_store_page() ) {
            $site_title = get_bloginfo( 'name' );
            $store_user = get_userdata( get_query_var( 'author' ) );

            if ( ! $store_user ) {
                return $title;
            }

            $store_info = dokan_get_store_info( $store_user->ID );
            $store_name = esc_html( $store_info['store_name'] );
            $title      = "$store_name $sep $site_title";

            // Add a page number if necessary.
            if ( $paged >= 2 || $page >= 2 ) {
                $title = "$title $sep " . sprintf( __( 'Page %s', 'dokan-lite' ), max( $paged, $page ) );
            }

            return $title;
        }

        return $title;
    }

    /**
     * Redirect if not logged Seller
     *
     * @since 2.4
     *
     * @return void [redirection]
     */
    function redirect_if_not_logged_seller() {
        global $post;

        $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

        if ( ! $page_id ) {
            return;
        }

        if ( is_page( $page_id ) || apply_filters( 'dokan_force_page_redirect', false, $page_id ) ) {
            dokan_redirect_login();
            dokan_redirect_if_not_seller();
        }
    }

    /**
     * Redirect after activation
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function redirect_after_activate() {
        if ( ! get_transient( '_dokan_setup_page_redirect' ) ) {
            return;
        }

        dokan_redirect_to_admin_setup_wizard();
    }

}

