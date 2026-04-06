<?php

namespace WeDevs\Dokan\ProductEditor;

use WC_Product_Simple;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\Model;

defined( 'ABSPATH' ) || exit;

/**
 * Product Editor hooks for rendering and managing the product editor form.
 *
 * @since DOKAN_SINCE
 */
class Hooks {

    public function __construct() {
        add_action( 'template_redirect', [ $this, 'maybe_create_auto_draft' ] );
        add_action( 'dokan_render_product_editor_manager_template', [ $this, 'load_product_edit_template' ] );
        add_action( 'dokan_product_editor_manager_inside_content', [ $this, 'load_product_edit_content' ] );
    }

    /**
     * Create an auto-draft product and redirect before any output is sent.
     *
     * Hooked on `template_redirect` so the redirect header can be sent
     * before WordPress starts rendering the page.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function maybe_create_auto_draft() {
        // Only run on the product editor page when no product_id is provided.
        if ( ! isset( $_GET['product_editor'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
            return;
        }

        $product_id = isset( $_GET['product_id'] ) ? intval( wp_unslash( $_GET['product_id'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification

        if ( $product_id ) {
            return;
        }

        if ( ! current_user_can( 'dokan_edit_product' ) || ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
            return;
        }

        $product = new WC_Product_Simple();
        $product->set_status( 'auto-draft' );
        $product->set_name( '' );
        $product->save();

        // Assign the current vendor as the product author.
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => dokan_get_current_user_id(),
            ]
        );

        // Redirect to prevent duplicate auto-drafts on refresh.
        $redirect_url = add_query_arg(
            [
                'product_id'     => $product->get_id(),
                'product_editor' => true,
            ],
            dokan_edit_product_url( $product->get_id(), true )
        );
        wp_safe_redirect( $redirect_url );
        exit;
    }

    /**
     * Load product edit template wrapper.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_product_edit_template() {
        dokan_get_template_part( 'products/product-editor/form-wrapper' );
    }

    /**
     * Load product edit content: permissions, product create/fetch, template, and localize script with flat form data.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_product_edit_content() {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
					'deleted' => false,
					'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
				]
            );
            return;
        }
        if ( ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
            dokan_seller_not_enabled_notice();
            return;
        }

        $product_id = isset( $_GET['product_id'] ) ? intval( wp_unslash( $_GET['product_id'] ) ) : 0; // phpcs:ignore

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
					'deleted' => false,
					'message' => __( 'Product not found', 'dokan-lite' ),
				]
            );
            return;
        }

        // Verify the current vendor owns the product.
        if ( ! dokan_is_product_author( $product_id ) ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
					'deleted' => false,
					'message' => __( 'You have no permission to view this product', 'dokan-lite' ),
				]
            );
            return;
        }

        $new_product = in_array( $product->get_status(), [ 'auto-draft' ], true );

        dokan_get_template_part( 'products/product-editor/form-content', '', [ 'product' => $product ] );

        $vendor_earning = dokan()->commission->get_earning_by_product( $product_id );
        wp_enqueue_script( 'dokan-product-editor' );
        wp_enqueue_style( 'dokan-product-editor' );

        // Ensure currency data exists for DokanPriceInput / Accounting utilities.
        $currency = dokan_get_container()->get( 'scripts' )->get_localized_price();
        wp_add_inline_script(
            'dokan-product-editor',
            'window.dokanFrontend = window.dokanFrontend || {}; window.dokanFrontend.currency = window.dokanFrontend.currency || ' . wp_json_encode( $currency ) . ';',
            'before'
        );

        $is_enabled = dokan_get_option( 'dokan_ai_image_gen_availability', 'dokan_ai', 'off' ) === 'on';
        $manager = dokan()->get_container()->get( Manager::class );
        $is_image_configured = $is_enabled && $manager->is_configured( Model::SUPPORTS_IMAGE );

        $args = [
            'form_items'         => dokan()->product_editor->get_schema( $product_id ),
            'form_layouts'       => FormSchema::get_layouts(),
            'product_id'         => $product_id,
            'is_new_product'     => $new_product,
            'view_product_url'   => get_permalink( $product_id ),
            'vendor_earning'     => $vendor_earning,
            'ai_settings'        => [
                'ai_text_enable'    => $manager->is_configured(),
                'ai_image_enable'   => $is_image_configured,
            ],
        ];

        $args = apply_filters( 'dokan_product_editor_localize_data', $args, $product_id, $product );

        wp_add_inline_script(
            'dokan-product-editor',
            'const dokanProductEditor = ' . wp_json_encode( $args ) . ';',
            'after'
        );

        do_action( 'dokan_product_editor_script_after' );
    }
}
