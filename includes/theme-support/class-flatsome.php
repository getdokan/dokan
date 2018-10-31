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

}

return new Dokan_Theme_Support_Flatsome();
