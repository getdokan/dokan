<?php

/**
 * Flatsome Theme Support
 *
 * @see https://themeforest.net/item/flatsome-multipurpose-responsive-woocommerce-theme/5484319?ref=wedevs
 *
 * @since 3.0
 */
class Dokan_Theme_Support_Flatsome {

    /**
     * The constructor
     */
    function __construct() {
        // page layout fix
        add_action( 'wp_head', [ $this, 'store_page'] );
        add_action( 'wp_head', [ $this, 'edit_page'] );

        // login popup fix
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts'] );
        add_action( 'wp_enqueue_scripts', [ $this, 'store_listing_style' ], 100 );
    }

    /**
     * Enqueue registration scripts as it opens on popup
     *
     * @return void
     */
    public function enqueue_scripts() {
        if ( is_user_logged_in() ) {
            return;
        }

        Dokan_Assets::load_form_validate_script();
        wp_enqueue_script( 'dokan-vendor-registration' );
    }

    /**
     * Store page fix
     *
     * @return void
     */
    public function store_page() {
        if ( dokan_is_store_page() ) {
            add_action( 'woocommerce_before_main_content', [ $this, 'start_wrapper'] );
            add_action( 'woocommerce_after_main_content', [ $this, 'end_wrapper'] );
        }
    }

    /**
     * Product edit page
     *
     * @return void
     */
    public function edit_page() {
        if ( dokan_is_product_edit_page() ) {
            add_action( 'dokan_dashboard_wrap_before', [ $this, 'start_wrapper'] );
            add_action( 'dokan_dashboard_wrap_after', [ $this, 'end_wrapper'] );
        }
    }

    /**
     * Page wrapper div
     *
     * @return void
     */
    public function start_wrapper() {
        ?>
        <div id="content" class="content-area page-wrapper" role="main">
            <div class="row row-main">
                <div class="large-12 col">
                    <div class="col-inner">
        <?php
    }

    /**
     * Wrapper div ends
     *
     * @return void
     */
    public function end_wrapper() {
        ?>
                    </div><!-- .col-inner -->
                </div><!-- .large-12 -->
            </div><!-- .row -->
        </div>
        <?php
    }

    /**
     * Reset store listing style
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function store_listing_style() {
        if ( ! dokan_is_store_listing() ) {
            return;
        }

        $style = '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 a {text-decoration: none}';
        $style .= '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 {font-size: 24px; margin: 20px 0 10px 0}';
        $style .= '#dokan-store-listing-filter-form-wrap:before {top: -74px; height: 0}';
        $style .= 'form.sort-by.item {margin-bottom: 0}';
        $style .= '#dokan-store-listing-filter-wrap .left .store-count {margin-bottom: 0}';
        $style .= '#dokan-store-listing-filter-wrap .right .sort-by.item label {display: inline-block}';
        $style .= '#dokan-store-listing-filter-wrap .right #stores_orderby {height:auto; border-radius: 3px; box-shadow: none; margin-bottom: 0; display: inline-block; width: auto}';
        $style .= '#dokan-store-listing-filter-wrap .right .item button, #dokan-store-listing-filter-form-wrap .apply-filter #apply-filter-btn {text-transform: capitalize}';
        $style .= '#dokan-store-listing-filter-wrap .right .item .dokan-icons {z-index: 10}';
        $style .= '#dokan-seller-listing-wrap.list-view .dokan-seller-wrap .dokan-single-seller .store-wrapper .store-footer[class] button {text-transform: capitalize}';
        $style .= '#dokan-seller-listing-wrap.list-view .dokan-seller-wrap .dokan-single-seller .store-wrapper .store-content .store-data-container .store-data .dokan-seller-rating[class] {font-size: 14px}';
        $style .= '.store-lists-other-filter-wrap .dokan-geolocation-location-filters .location-address .locate-icon, .dokan-geolocation-location-filters .location-address .locate-loader {top: 40%;}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars a {border: none; margin: 0}';
        $style .= '#dokan-seller-listing-wrap .dokan-btn-theme.dokan-follow-store-button {text-transform: capitalize}';

        // responsive
        $style .= '@media (max-width: 414px) { #dokan-store-listing-filter-wrap .right .item .dokan-store-list-filter-button {margin: 0}';
        $style .= '#dokan-store-listing-filter-wrap .right {margin-top: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {padding: 8px 15px 8px 16px}';
        $style .= '}';

        $style .= '@media (max-width: 375px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 14px}';
        $style .= '}';

        wp_add_inline_style( 'dokan-style', $style );
        wp_enqueue_style( 'woocommerce-general', WC()->plugin_url() . '/assets/css/woocommerce.css', '', WC_VERSION, 'all' );
    }

}

return new Dokan_Theme_Support_Flatsome();
