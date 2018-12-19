<?php

/**
 * Pageviews - for counting product post views.
 */
class Dokan_Pageviews {

    private $meta_key = 'pageview';

    public function __construct() {
        /* Registers the entry views extension scripts if we're on the correct page. */
        add_action( 'template_redirect', array( $this, 'load_views' ), 25 );

        /* Add the entry views AJAX actions to the appropriate hooks. */
        add_action( 'wp_ajax_dokan_pageview', array( $this, 'update_ajax' ) );
        add_action( 'wp_ajax_nopriv_dokan_pageview', array( $this, 'update_ajax' ) );
    }

    public function load_scripts() {
        $nonce = wp_create_nonce( 'dokan_pageview' );

        echo '<script type="text/javascript">
            jQuery(document).ready( function($) {
                var data = {
                    action: "dokan_pageview",
                    _ajax_nonce: "'. esc_html( $nonce ) .'",
                    post_id: ' . get_the_ID() . ',
                }
                $.post( "' . esc_url( admin_url( 'admin-ajax.php' ) ) . '", data );
            } );
            </script>';
    }

    public function load_views() {
        if ( is_singular( 'product' ) ) {
            global $post;

            if ( empty( $_COOKIE['dokan_product_viewed'] ) ) {
                $dokan_viewed_products = array();
            } else {
                $dokan_viewed_products = (array) explode( ',', sanitize_text_field( wp_unslash( $_COOKIE['dokan_product_viewed'] ) ) );
            }

            if ( ! in_array( $post->ID, $dokan_viewed_products ) ) {
                $dokan_viewed_products[] = $post->ID;

                wp_enqueue_script( 'jquery' );
                add_action( 'wp_footer', array($this, 'load_scripts') );
            }
            // Store for single product view
            setcookie( 'dokan_product_viewed', implode( ',', $dokan_viewed_products ) );
        }
    }

    public function update_view( $post_id = '' ) {
        if ( ! empty( $post_id ) ) {
            $old_views = get_post_meta( $post_id, $this->meta_key, true );
            $new_views = absint( $old_views ) + 1;

            update_post_meta( $post_id, $this->meta_key, $new_views, $old_views );
        }
    }

    public function update_ajax() {
        check_ajax_referer( 'dokan_pageview' );

        if ( isset( $_POST['post_id'] ) ) {
            $post_id = absint( $_POST['post_id'] );
        }

        if ( ! empty( $post_id ) ) {
            $this->update_view( $post_id );
        }

        wp_die();
    }

}
