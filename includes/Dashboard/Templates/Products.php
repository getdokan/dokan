<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WC_Product;
use WC_Product_Factory;
use WC_Product_Simple;
use WeDevs\Dokan\ProductForm\Elements as ProductFormElements;
use WeDevs\Dokan\ProductForm\Factory as ProductFormFactory;
use WP_Post;

/**
 *  Product Functionality for Product Handler
 *
 * @since   2.4
 *
 * @package dokan
 */
class Products {

    /**
     *  Errors
     *
     * @since 3.0.0
     *
     * @var array
     */
    public static $errors = [];

    /**
     *  Product Category
     *
     * @since 3.0.0
     *
     * @var array
     */
    public static $product_cat;

    /**
     *  Post Content
     *
     * @since 3.0.0
     *
     * @var array
     */
    public static $post_content;

    /**
     *  Load autometially when class initiate
     *
     * @since 2.4
     *
     * @uses  actions
     * @uses  filters
     */
    public function __construct() {
        // render product listing template
        add_action( 'dokan_render_product_listing_template', [ $this, 'render_product_listing_template' ], 11 );

        // render product edit page template sections
        add_action( 'dokan_render_product_edit_template', [ $this, 'load_product_edit_template' ], 11 );
        add_action( 'dokan_product_edit_after_title', [ __CLASS__, 'load_download_virtual_template' ], 10, 2 );
        add_action( 'dokan_product_edit_after_main', [ __CLASS__, 'load_inventory_template' ], 5, 2 );
        add_action( 'dokan_product_edit_after_main', [ __CLASS__, 'load_downloadable_template' ], 10, 2 );
        add_action( 'dokan_product_edit_after_inventory_variants', [ __CLASS__, 'load_others_template' ], 85, 2 );

        // handle product edit/delete operations
        add_action( 'template_redirect', [ $this, 'render_product_edit_page_for_email' ], 1 );
        add_action( 'template_redirect', [ $this, 'handle_delete_product' ] );
        add_action( 'template_redirect', [ $this, 'handle_product_update' ], 11 );
    }

    /**
     * Set errors
     *
     * @since 3.0.0
     *
     * @param array $errors
     *
     * @return void
     */
    public function set_errors( $errors ) {
        self::$errors = $errors;
    }

    /**
     * Verify if the instance contains errors
     *
     * @since 3.0.0
     *
     * @return bool
     */
    public function has_errors() {
        return ! empty( self::$errors );
    }

    /**
     * Retrieve all errors
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_errors() {
        return self::$errors;
    }

    /**
     * Load Product Edit Template
     *
     * @since 2.4
     *
     * @return void
     */
    public function load_product_edit_template() {
        // check for permission
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
                ]
            );

            return;
        }

        // check if seller is enabled for selling
        if ( ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
            dokan_seller_not_enabled_notice();

            return;
        }

        // check for valid nonce and product id
        if ( ! isset( $_GET['_dokan_edit_product_nonce'], $_GET['product_id'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_dokan_edit_product_nonce'] ), 'dokan_edit_product_nonce' ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'Are you cheating?', 'dokan-lite' ),
                ]
            );

            return;
        }

        // check if this is a product add or edit page
        $product_id  = intval( wp_unslash( $_GET['product_id'] ) );
        $new_product = false;
        if ( ! $product_id ) {
            // this is a product add page request
            // now create a new product with auto draft status
            $product = new WC_Product_Simple();
            $product->set_status( 'auto-draft' );
            $product->save();
            $new_product = true;
        } else {
            // this is a product edit page request
            $product = wc_get_product( $product_id );
        }

        if ( ! dokan_is_product_author( $product->get_id() ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'Access Denied. Given product is not yours.', 'dokan-lite' ),
                ]
            );

            return;
        }

        dokan_get_template_part(
            'products/edit/edit-product-single', '',
            [
                'product'        => $product,
                'new_product'    => $new_product,
                'from_shortcode' => true,
            ]
        );
    }

    /**
     * Load product
     *
     * @since 1.0.0
     *
     * @param WP_Post $post
     * @param int     $post_id
     *
     * @return void
     */
    public static function load_download_virtual_template( $post, $post_id ) {
        $product = wc_get_product( $post_id );
        if ( ! $product ) {
            return;
        }

        $digital_mode = dokan_get_option( 'global_digital_mode', 'dokan_general', 'sell_both' );
        if ( 'sell_physical' === $digital_mode ) {
            return;
        }

        // get section data
        $section = ProductFormFactory::get_section( 'downloadable_virtual' );
        if ( is_wp_error( $section ) || ! $section->is_visible() ) {
            return;
        }

        dokan_get_template_part(
            'products/edit/sections/download-virtual', '', [
                'product'      => $product,
                'section'      => $section,
                'digital_mode' => $digital_mode,
                'class'        => 'show_if_subscription hide_if_variable-subscription show_if_simple',
            ]
        );
    }

    /**
     * Load inventory template
     *
     * @since 2.9.2
     *
     * @param WP_Post $post
     * @param int     $post_id
     *
     * @return void
     */
    public static function load_inventory_template( $post, $post_id ) {
        $product = wc_get_product( $post_id );
        if ( ! $product ) {
            return;
        }

        // get section data
        $section = ProductFormFactory::get_section( 'inventory' );
        if ( is_wp_error( $section ) || ! $section->is_visible() ) {
            return;
        }

        dokan_get_template_part(
            'products/edit/sections/inventory', '', [
                'section' => $section,
                'product' => $product,
                'class'   => '',
            ]
        );
    }

    /**
     * Load downloadable template
     *
     * @since 2.9.2
     *
     * @param WP_Post $post
     * @param int     $post_id
     *
     * @return void
     */
    public static function load_downloadable_template( $post, $post_id ) {
        $product = wc_get_product( $post_id );
        if ( ! $product ) {
            return;
        }

        $digital_mode = dokan_get_option( 'global_digital_mode', 'dokan_general', 'sell_both' );
        if ( 'sell_physical' === $digital_mode ) {
            return;
        }

        // get section data
        $section = ProductFormFactory::get_section( 'downloadable' );
        if ( is_wp_error( $section ) || ! $section->is_visible() ) {
            return;
        }

        dokan_get_template_part(
            'products/edit/sections/downloadable', '', [
                'section' => $section,
                'product' => $product,
                'class'   => 'show_if_downloadable',
            ]
        );
    }

    /**
     * Load others item template
     *
     * @since 2.9.2
     *
     * @param WP_Post $post
     * @param int     $post_id
     *
     * @return void
     */
    public static function load_others_template( $post, $post_id ) {
        $product = wc_get_product( $post_id );
        if ( ! $product ) {
            return;
        }

        $section = ProductFormFactory::get_section( 'others' );
        if ( is_wp_error( $section ) || ! $section->is_visible() ) {
            return;
        }

        // set new post status
        $post_status = dokan_get_default_product_status( dokan_get_current_user_id() );
        $post_status = $product->get_status() === 'auto-draft' ? $post_status : $product->get_status();

        dokan_get_template_part(
            'products/edit/sections/others', '', [
                'section'     => $section,
                'product'     => $product,
                'post_status' => apply_filters( 'dokan_post_edit_default_status', $post_status, $product ),
                'class'       => '',
            ]
        );
    }

    /**
     * Render Product Edit Page for Email.
     *
     * @since 3.9.1
     *
     * @return void
     */
    public function render_product_edit_page_for_email() {
        if (
            ! isset( $_GET['action'], $_GET['_view_mode'] ) ||
            'edit' !== sanitize_text_field( wp_unslash( $_GET['action'] ) ) ||
            'product_email' !== sanitize_text_field( wp_unslash( $_GET['_view_mode'] ) ) ) {
            return;
        }

        $product_edit_url = remove_query_arg( '_view_mode', dokan_get_current_page_url() );
        $product_edit_url = add_query_arg( '_dokan_edit_product_nonce', wp_create_nonce( 'dokan_edit_product_nonce' ), $product_edit_url );

        wp_safe_redirect( $product_edit_url );
        exit();
    }

    /**
     * Render Product Listing Template
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_product_listing_template() {
        $bulk_statuses = apply_filters(
            'dokan_bulk_product_statuses', [
                '-1'     => __( 'Bulk Actions', 'dokan-lite' ),
                'delete' => __( 'Delete Permanently', 'dokan-lite' ),
            ]
        );

        dokan_get_template_part( 'products/products-listing', '', [ 'bulk_statuses' => $bulk_statuses ] );
    }

    /**
     * Handle product update
     *
     * @var $product WC_Product
     *
     * @return void
     */
    public function handle_product_update() {
        if ( ! is_user_logged_in() ) {
            return;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        if ( ! isset( $_POST['dokan_edit_product_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['dokan_edit_product_nonce'] ), 'dokan_edit_product' ) ) {
            return;
        }

        $product_id = isset( $_POST['dokan_product_id'] ) ? absint( $_POST['dokan_product_id'] ) : 0;
        if ( ! $product_id ) {
            self::$errors[] = __( 'No product id is set!', 'dokan-lite' );

            return;
        }

        if ( ! dokan_is_product_author( $product_id ) ) {
            self::$errors[] = __( 'I swear this is not your product!', 'dokan-lite' );

            return;
        }

        // Process the product type first so that we have the correct class to run setters.
        $product_type_field = ProductFormFactory::get_field( ProductFormElements::TYPE );
        $product_type       = empty( $_POST[ $product_type_field->get_name() ] ) ? WC_Product_Factory::get_product_type( $product_id ) : sanitize_title( wp_unslash( $_POST[ $product_type_field->get_name() ] ) );
        $classname          = WC_Product_Factory::get_product_classname( $product_id, $product_type ? $product_type : 'simple' );
        $product            = new $classname( $product_id );

        /**
         * @var WC_Product $product
         */
        if ( ! $product ) {
            self::$errors[] = __( 'No product found with given product id!', 'dokan-lite' );

            return;
        }

        $props          = [];
        $meta_data      = [];
        $is_new_product = 'auto-draft' === $product->get_status();

        // stock quantity
        $props[ ProductFormElements::STOCK_QUANTITY ] = null;

        foreach ( ProductFormFactory::get_fields() as $field_id => $field ) {
            if ( $field->is_other_type() ) {
                // we will only process props and meta in this block
                continue;
            }
            // check if the field is visible
            if ( ! $field->is_visible() ) {
                continue;
            }

            $field_name = sanitize_key( $field->get_name() );

            // check if field is required
            if ( $field->is_required() && empty( $_POST[ $field_name ] ) ) {
                self::$errors[ $field->get_id() ] = ! empty( $field->get_error_message() )
                    ? $field->get_error_message()
                    // translators: 1) field title
                    : sprintf( __( '<strong>%1$s</strong> is a required field.', 'dokan-lite' ), $field->get_title() );
                continue;
            }

            // check if the field is present
            if ( ! isset( $_POST[ $field_name ] ) ) {
                continue;
            }

            // validate field data
            switch ( $field->get_id() ) {
                case ProductFormElements::CATEGORIES:
                    $field_value = $field->sanitize( (array) wp_unslash( $_POST['chosen_product_cat'] ), $product ); // phpcs:ignore
                    break;

                case ProductFormElements::DOWNLOADS:
                    $file_names  = isset( $_POST['_wc_file_names'] ) ? wp_unslash( $_POST['_wc_file_names'] ) : [];  // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                    $file_urls   = isset( $_POST['_wc_file_urls'] ) ? wp_unslash( $_POST['_wc_file_urls'] ) : [];  // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                    $file_hashes = isset( $_POST['_wc_file_hashes'] ) ? wp_unslash( $_POST['_wc_file_hashes'] ) : []; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                    $field_value = $field->sanitize( $file_names, $file_urls, $file_hashes ); //phpcs:ignore
                    break;

                case ProductFormElements::STOCK_QUANTITY:
                    $original_stock = isset( $_POST['_original_stock'] ) ? wc_stock_amount( wp_unslash( $_POST['_original_stock'] ) ) : false; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                    $field_value    = $field->sanitize( wp_unslash( $_POST[ $field_name ] ), $original_stock, $product ); //phpcs:ignore
                    break;

                default:
                    // give a chance to other plugins to sanitize their data
                    $field_value = apply_filters( 'dokan_product_update_field_value', null, $field, wp_unslash( $_POST[ $field_name ] ), $product ); // phpcs:ignore
                    if ( null === $field_value ) {
                        $field_value = $field->sanitize( wp_unslash( $_POST[ $field_name ] ) ); //phpcs:ignore
                    }
                    break;
            }

            if ( is_wp_error( $field_value ) ) {
                self::$errors[ $field->get_id() ] = $field_value->get_error_message();
            } else {
                //store field value
                $field->set_value( $field_value );
            }

            // store props and meta data
            if ( $field->is_prop() ) {
                $props[ $field->get_id() ] = $field_value;
            } elseif ( $field->is_meta() ) {
                $meta_data[ $field->get_id() ] = $field_value;
            }
        }

        // check for valid product tag
        if ( ! empty( $_POST['editable-post-name'] ) ) {
            $post_slug                       = ProductFormFactory::get_field( ProductFormElements::SLUG );
            $post_status                     = $props[ ProductFormElements::STATUS ] ?? dokan_get_default_product_status( dokan_get_current_user_id() );
            $props[ $post_slug->get_name() ] = $post_slug->sanitize( wp_unslash( $_POST['editable-post-name'] ), $product_id, $post_status ); //phpcs:ignore
        }

        // apply hooks before saving product
        $props     = apply_filters( 'dokan_product_edit_props', $props, $product, $is_new_product );
        $meta_data = apply_filters( 'dokan_product_edit_meta_data', $meta_data, $product, $is_new_product );

        $errors = $product->set_props( $props );
        if ( is_wp_error( $errors ) ) {
            self::$errors = array_merge( self::$errors, $errors->get_error_messages() );
        }

        // return early for validation errors
        self::$errors = apply_filters( 'dokan_can_edit_product', self::$errors );
        if ( ! empty( self::$errors ) ) {
            return;
        }

        if ( $is_new_product ) {
            do_action( 'dokan_before_new_product_added', $product, $props, $meta_data );
        } else {
            do_action( 'dokan_before_product_updated', $product, $props, $meta_data );
        }

        // add product meta data
        foreach ( $meta_data as $meta_key => $meta_value ) {
            $product->add_meta_data( $meta_key, $meta_value, true );
        }

        // save product
        $product->save();

        if ( $is_new_product ) {
            do_action( 'dokan_new_product_added', $product_id, [] );
        } else {
            do_action( 'dokan_product_updated', $product_id, [] );
        }

        $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_edit_product_url( $product_id ), $product_id );
        wp_safe_redirect( add_query_arg( [ 'message' => 'success' ], $redirect ) );
        exit;
    }

    /**
     * Handle delete product link
     *
     * @return void
     */
    public function handle_delete_product() {
        if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_delete_product' ) ) {
            return;
        }

        if ( ! isset( $_GET['action'] ) || $_GET['action'] !== 'dokan-delete-product' ) {
            return;
        }

        if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'dokan-delete-product' ) ) {
            wp_safe_redirect( add_query_arg( [ 'message' => 'error' ], dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        $product_id = isset( $_GET['product_id'] ) ? intval( wp_unslash( $_GET['product_id'] ) ) : 0;

        if ( ! $product_id ) {
            wp_safe_redirect( add_query_arg( [ 'message' => 'error' ], dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        if ( ! dokan_is_product_author( $product_id ) ) {
            wp_safe_redirect( add_query_arg( [ 'message' => 'error' ], dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        dokan()->product->delete( $product_id, true );

        do_action( 'dokan_product_deleted', $product_id );

        $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_get_navigation_url( 'products' ), '' );

        wp_safe_redirect( add_query_arg( [ 'message' => 'product_deleted' ], $redirect ) );
        exit;
    }
}
