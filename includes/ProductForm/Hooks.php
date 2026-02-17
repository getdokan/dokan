<?php

namespace WeDevs\Dokan\ProductForm;

use WC_Product_Simple;
use Exception;

class Hooks {

    public function __construct() {
        add_action( 'dokan_after_add_product_btn', [ $this, 'add_new_product_link' ] );
        add_action( 'dokan_render_product_form_manager_template', [ $this, 'load_product_edit_template' ] );
        add_action( 'dokan_product_form_manager_inside_content', [ $this, 'load_product_edit_content' ] );
        add_action( 'wp_ajax_dokan_save_product_data', [ $this, 'dokan_save_product_data' ] );
        add_action( 'wp_ajax_dokan_get_product_variations', [ $this, 'dokan_get_product_variations' ] );
    }

    /**
     * Add new product (Form Manager) link.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function add_new_product_link() {
        $add_product_url = add_query_arg(
            [ 'form_manager' => true ],
            dokan_edit_product_url( 0, true )
        );
        ?>
        <a href="<?php echo esc_url( $add_product_url ); ?>" class="dokan-btn dokan-btn-theme">
            <i class="fas fa-briefcase">&nbsp;</i>
            <?php esc_html_e( 'Form Manager', 'dokan-lite' ); ?>
        </a>
        <?php
    }

    /**
     * Load product edit template wrapper.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_product_edit_template() {
        dokan_get_template_part( 'products/form-manager/form-wrapper' );
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
        $new_product = false;

        if ( ! $product_id ) {
            $product = new WC_Product_Simple();
            $product->set_status( 'auto-draft' );
            $product->set_name( '' );
            $product->save();
            $new_product = true;
            $product_id   = $product->get_id();
        }

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

        dokan_get_template_part( 'products/form-manager/form-content', '', [ 'product' => $product ] );

        $vendor_earning = dokan()->commission->get_earning_by_product( $product_id );
        wp_enqueue_script( 'dokan-product-form-manager' );
        wp_enqueue_style( 'dokan-product-form-manager' );

        // Ensure currency data exists for DokanPriceInput / Accounting utilities.
        $currency = dokan_get_container()->get( 'scripts' )->get_localized_price();
        wp_add_inline_script(
            'dokan-product-form-manager',
            'window.dokanFrontend = window.dokanFrontend || {}; window.dokanFrontend.currency = window.dokanFrontend.currency || ' . wp_json_encode( $currency ) . ';',
            'before'
        );

        wp_localize_script(
            'dokan-product-form-manager',
            'dokanFormManager',
            [
                'form_items'        => dokan()->product_form->get_fields( $product_id ),
                'form_manager_nonce' => wp_create_nonce( 'form_manager' ),
                'product_id'         => $product_id,
                'is_new_product'     => $new_product,
                'view_product_url'   => get_permalink( $product_id ),
                'vendor_earning'     => $vendor_earning,
                'variations'         => dokan()->product_form->get_product_variations( $product_id ),
            ]
        );
    }


    /**
     * AJAX: Save product data (form manager submit).
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function dokan_save_product_data() {
        if ( ! isset( $_POST['_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_nonce'] ), 'form_manager' ) ) {
            wp_send_json_error(
                [
					'type' => 'nonce',
					'message' => __( 'Are you cheating?', 'dokan-lite' ),
				]
            );
        }
        try {
            $product = dokan()->product->create( $_POST );
            wp_send_json_success(
                [
					'product' => $product->get_data(),
					'message' => __( 'Product saved successfully', 'dokan-lite' ),
				]
            );
        } catch ( Exception $e ) {
            wp_send_json_error(
                [
					'status' => false,
					'message' => $e->getMessage(),
				]
            );
        }
    }

    /**
     * AJAX handler to get product variations.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function dokan_get_product_variations() {
        if ( ! isset( $_REQUEST['product_id'] ) ) { // phpcs:ignore
            wp_send_json_error( __( 'Product ID is required', 'dokan-lite' ) );
        }
        $product_id = intval( wp_unslash( $_REQUEST['product_id'] ) ); // phpcs:ignore
        wp_send_json_success( dokan()->product_form->get_product_variations( $product_id ) );
    }
}
