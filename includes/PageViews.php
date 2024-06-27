<?php

namespace WeDevs\Dokan;

/**
 * Page views - for counting product post views.
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

	/**
	 * Load the scripts
	 *
	 * @return void
	 */
	public function load_scripts() {
		wp_enqueue_script( 'dokan-page-views', DOKAN_PLUGIN_ASSEST . '/js/page-views.js', array( 'jquery' ), DOKAN_PLUGIN_VERSION, true );
		wp_localize_script(
			'dokan-page-views',
			'dokanPageViewsParams',
			array(
				'nonce'    => wp_create_nonce( 'dokan_pageview' ),
				'post_id'  => get_the_ID(),
				'ajax_url' => admin_url( 'admin-ajax.php' ),
			)
		);
	}

	public function load_views() {
		if ( is_singular( 'product' ) ) {
			global $post;

			if ( dokan_get_current_user_id() !== $post->post_author ) {
				wp_enqueue_script( 'jquery' );
				add_action( 'wp_footer', array( $this, 'load_scripts' ) );
			}
		}
	}

	/**
	 * Update the view count
	 *
	 * @param int $post_id The post ID
	 *
	 * @return void
	 */
	public function update_view( $post_id = '' ) {
		if ( ! empty( $post_id ) ) {
			$old_views = get_post_meta( $post_id, $this->meta_key, true );
			$new_views = absint( $old_views ) + 1;

			update_post_meta( $post_id, $this->meta_key, $new_views, $old_views );
			$seller_id = get_post_field( 'post_author', $post_id );
			Cache::delete( "pageview_{$seller_id}" );
		}
	}

	/**
	 * Update the view count via AJAX
	 *
	 * @return void
	 */
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
