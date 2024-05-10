<?php

namespace WeDevs\Dokan;

/**
 * Pageviews - for counting product post views.
 */
class PageViews {

    private $meta_key = 'pageview';

    public function __construct() {
        /* Registers the entry views extension scripts if we're on the correct page. */
        add_action( 'template_redirect', array( $this, 'load_views' ), 25 );

        /* Add the entry views AJAX actions to the appropriate hooks. */
        add_action( 'wp_ajax_dokan_pageview', array( $this, 'update_ajax' ) );
        add_action( 'wp_ajax_nopriv_dokan_pageview', array( $this, 'update_ajax' ) );
    }

    public function load_scripts() {
        dokan_get_template(
            'page-views', array(
                'nonce' => wp_create_nonce( 'dokan_pageview' ),
                'post_id' => get_the_ID(),
                'ajax_url' => admin_url( 'admin-ajax.php' ),
            )
        );
    }

    public function load_views() {
        if ( is_singular( 'product' ) ) {
            global $post;

            if ( $post->post_author !== dokan_get_current_user_id() ) {
                wp_enqueue_script( 'jquery' );
                add_action( 'wp_footer', array( $this, 'load_scripts' ) );
            }
        }
    }

    public function update_view( $post_id = '' ) {
        if ( ! empty( $post_id ) ) {
            $old_views = get_post_meta( $post_id, $this->meta_key, true );
            $new_views = absint( $old_views ) + 1;

            update_post_meta( $post_id, $this->meta_key, $new_views, $old_views );
            $seller_id = get_post_field( 'post_author', $post_id );
            Cache::delete( "pageview_{$seller_id}" );
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
