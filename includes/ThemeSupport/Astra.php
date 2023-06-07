<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Astra Theme Support
 *
 * @since 3.1
 */
class Astra {

    /**
     * The constructor
     */
    public function __construct() {
        add_filter( 'astra_page_layout', [ $this, 'remove_sidebar' ] );
        
        // Payment request button conflict issue fix
        add_action( 'wp_enqueue_scripts', [ $this, 'payment_request_button_style' ], 100 );
    }

    /**
     * Remove sidebar from store and dashboard page
     *
     * @param string $layout
     *
     * @return string
     */
    public function remove_sidebar( $layout ) {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            return 'no-sidebar';
        }

        return $layout;
    }

    public function payment_request_button_style() {
        
        /*
         * For payment request button conflict with Astra theme
         * for simple and variable products in single product page.
         */
        if (
            dokan()->is_pro_exists() 
            && dokan_pro()->module->is_active( 'stripe_express' ) 
            && defined('ASTRA_THEME_VERSION') 
            && is_checkout()
        ) {
            $style = '.woocommerce div.product.product-type-simple form.cart,
            .woocommerce div.product .woocommerce-variation-add-to-cart {
            display: unset !important;
            }';
            
            wp_add_inline_style( 'dokan-style', $style );
        }

    }
}
