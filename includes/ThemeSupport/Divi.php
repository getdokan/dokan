<?php

namespace WeDevs\Dokan\ThemeSupport;

use stdClass;

/**
 * Divi Theme Support
 *
 * @see https://www.elegantthemes.com/gallery/divi/
 *
 * @since 3.0
 */
class Divi {

    /**
     * The constructor
     */
    public function __construct() {
        add_action( 'template_redirect', [ $this, 'remove_sidebar' ] );
        add_filter( 'body_class', [ $this, 'full_width_page' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'style_reset' ] );
        add_action( 'dokan_store_page_query_filter', [ $this, 'set_current_page' ], 10, 2 );
        add_action( 'wp', [ $this, 'use_dynamic_assets_for_empty_product' ] );
    }

    /**
     * Remove sidebar from store and dashboard page
     *
     * @return void
     */
    public function remove_sidebar() {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            unregister_sidebar( 'sidebar-1' );
        }
    }

    /**
     * Reset style
     *
     * @return void
     */
    public function style_reset() {
        global $wp;
        $style = '';

        // Add delivery time styles for checkout page.
        if ( is_checkout() ) {
            $style .= '#dokan-delivery-time-box .delivery-time-body input { padding: .9em;}';
            $style .= '#dokan-delivery-time-box .delivery-time-body select { padding: .9em !important; margin-top: 12px !important;}';
            $style .= '#dokan-delivery-time-box .delivery-time-body .delivery-group .vendor-info { margin-top: 12px !important;}';
        }

        if ( ! dokan_is_store_page() && ! dokan_is_seller_dashboard() ) {
            $style .= '#left-area ul { padding: 0 !important;}';
            $style .= '.media-button-select { font-size: 15px !important; padding-top: 0 !important}';
        }

        // Add delivery time styles for dokan seller order page.
        if ( dokan_is_seller_dashboard() && isset( $wp->query_vars['orders'] ) && isset( $_GET['order_id'] ) ) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $style .= '.delivery-time-date-picker { padding: .8em !important;}';
        }

        // If not empty our styles then add our line styles.
        if ( ! empty( $style ) ) {
            wp_add_inline_style( 'woocommerce-layout', $style );
        }
    }

    /**
     * Makes the store and dashboard page full width
     *
     * @param  array $classes
     *
     * @return array
     */
    public function full_width_page( $classes ) {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            if ( ! in_array( 'et_full_width_page', $classes, true ) ) {
                $classes[] = 'et_full_width_page';
                $classes[] = 'et_no_sidebar';
            }
        }

        return $classes;
    }

    /**
     * Set current page for the query
     *
     * @since DOKAN_LITE_SINCE
     *
     * @see https://github.com/weDevsOfficial/dokan/issues/838
     *
     * @param \WP_Query $query
     * @param array $store_info
     *
     * @return void
     */
    public function set_current_page( $query, $store_info ) {
        /**
         * Divi is tightly coupled with singular page data in general and dokan store page is not a regular WordPress page
         * But created with custom rewrite rules. So we'll trick Divi builder to assume dokan store page is really `page` post_type.
         * So lets create a fake page object, and set it to `WP_Query->queried_object` and make the page `is_singular`.
         */
        $page            = new stdClass();
        $page->ID        = get_option( 'woocommerce_shop_page_id' ); // So it's created by admin, vendor can't see the edit page menu on navbar
        $page->post_type = 'page';

        if ( $page->ID ) {
            $page->ancestors          = [ $page->ID ];
            $query->is_singular       = true;
            $query->queried_object    = $page;
            $query->queried_object_id = $page->ID;
        }

        add_filter(
            'pre_get_document_title', function() use ( $store_info ) {
				return ! empty( $store_info['store_name'] ) ? $store_info['store_name'] : __( 'No Name', 'dokan-lite' );
			}
        );
    }

    /**
     * Use divi theme assets when product is empty in store.
     *
     * @since 3.2.15
     *
     * @return void
     */
    public function use_dynamic_assets_for_empty_product() {
        global $post;

        if ( ! dokan_is_store_page() || ! empty( $post ) ) {
            return;
        }

        $post               = new stdClass();   // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        $post->ID           = -1;
        $post->post_content = '';
        $post->post_type    = '';

        setup_postdata( $post );
    }
}
