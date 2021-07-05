<?php

namespace WeDevs\Dokan\Dashboard\Templates;

/**
*  Product Functionality for Product Handler
*
*  @since 2.4
*
*  @package dokan
*/
class Products {

    public static $errors;
    public static $product_cat;
    public static $post_content;

    /**
     *  Load autometially when class initiate
     *
     *  @since 2.4
     *
     *  @uses actions
     *  @uses filters
     */
    public function __construct() {
        add_action( 'dokan_render_product_listing_template', array( $this, 'render_product_listing_template' ), 11 );
        add_action( 'template_redirect', array( $this, 'handle_product_add' ), 11 );
        add_action( 'template_redirect', array( $this, 'handle_product_update' ), 11 );
        add_action( 'template_redirect', array( $this, 'handle_delete_product' ) );
        add_action( 'dokan_render_new_product_template', array( $this, 'render_new_product_template' ), 10 );
        add_action( 'dokan_render_product_edit_template', array( $this, 'load_product_edit_template' ), 11 );
        add_action( 'dokan_after_listing_product', array( $this, 'load_add_new_product_popup' ), 10 );
        add_action( 'dokan_product_edit_after_title', array( __CLASS__, 'load_download_virtual_template' ), 10, 2 );
        add_action( 'dokan_product_edit_after_main', array( __CLASS__, 'load_inventory_template' ), 5, 2 );
        add_action( 'dokan_product_edit_after_main', array( __CLASS__, 'load_downloadable_template' ), 10, 2 );
        add_action( 'dokan_product_edit_after_inventory_variants', array( __CLASS__, 'load_others_template' ), 85, 2 );
    }

    /**
     * Set errors
     *
     * @since 3.0.0
     *
     * @param void $errors
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
     * Load product
     *
     * @since 1.0.0
     *
     * @return void
     */
    public static function load_download_virtual_template( $post, $post_id ) {
        $_downloadable   = get_post_meta( $post_id, '_downloadable', true );
        $_virtual        = get_post_meta( $post_id, '_virtual', true );
        $is_downloadable = ( 'yes' == $_downloadable ) ? true : false;
        $is_virtual      = ( 'yes' == $_virtual ) ? true : false;
        $digital_mode    = dokan_get_option( 'global_digital_mode', 'dokan_general', 'sell_both' );

        if ( 'sell_physical' === $digital_mode ) {
            return;
        }

        dokan_get_template_part( 'products/download-virtual', '', array(
            'post_id'         => $post_id,
            'post'            => $post,
            'is_downloadable' => $is_downloadable,
            'is_virtual'      => $is_virtual,
            'digital_mode'    => $digital_mode,
            'class'           => 'show_if_subscription show_if_variable-subscription show_if_simple',
        ) );
    }

    /**
     * Load invendor template
     *
     * @since 2.9.2
     *
     * @return void
     */
    public static function load_inventory_template( $post, $post_id ) {
        $_sold_individually = get_post_meta( $post_id, '_sold_individually', true );
        $_stock             = get_post_meta( $post_id, '_stock', true );
        $_low_stock_amount  = get_post_meta( $post_id, '_low_stock_amount', true );

        dokan_get_template_part( 'products/inventory', '', array(
            'post_id'            => $post_id,
            'post'               => $post,
            '_sold_individually' => $_sold_individually,
            '_stock'             => $_stock,
            '_low_stock_amount'  => $_low_stock_amount,
            'class'              => '',
        ) );
    }

    /**
     * Load downloadable template
     *
     * @since 2.9.2
     *
     * @return void
     */
    public static function load_downloadable_template( $post, $post_id ) {
        $digital_mode = dokan_get_option( 'global_digital_mode', 'dokan_general', 'sell_both' );

        if ( 'sell_physical' === $digital_mode ) {
            return;
        }

        dokan_get_template_part( 'products/downloadable', '', array(
            'post_id' => $post_id,
            'post'    => $post,
            'class'   => 'show_if_downloadable',
        ) );
    }

    /**
     * Load others item template
     *
     * @since 2.9.2
     *
     * @return void
     */
    public static function load_others_template( $post, $post_id ) {
        $product            = wc_get_product( $post_id );
        $_visibility        = ( version_compare( WC_VERSION, '2.7', '>' ) ) ? $product->get_catalog_visibility() : get_post_meta( $post_id, '_visibility', true );
        $visibility_options = dokan_get_product_visibility_options();

        dokan_get_template_part( 'products/others', '', array(
            'post_id'            => $post_id,
            'post'               => $post,
            'post_status'        => $post->post_status,
            '_visibility'        => $_visibility,
            'visibility_options' => $visibility_options,
            'class'              => '',
        ) );
    }

    /**
     * Render New Product Template for only free version
     *
     * @since 2.4
     *
     * @param  array $query_vars
     *
     * @return void
     */
    public function render_new_product_template( $query_vars ) {
        if ( isset( $query_vars['new-product'] ) && ! dokan()->is_pro_exists() ) {
            dokan_get_template_part( 'products/new-product' );
        }
    }

    /**
     * Load Product Edit Template
     *
     * @since 2.4
     *
     * @return void
     */
    public function load_product_edit_template() {
        if ( current_user_can( 'dokan_edit_product' ) ) {
            dokan_get_template_part( 'products/new-product-single' );
        } else {
            dokan_get_template_part('global/dokan-error', '', array(
                'deleted' => false,
                'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
            ) );
            return;
        }
    }

    /**
     * Render Product Listing Template
     *
     * @since 2.4
     *
     * @param  string $action
     *
     * @return void
     */
    public function render_product_listing_template( $action ) {
        $bulk_statuses = apply_filters( 'dokan_bulk_product_statuses', array(
            '-1'     => __( 'Bulk Actions', 'dokan-lite' ),
            'delete' => __( 'Delete Permanently', 'dokan-lite' ),
        ) );

        dokan_get_template_part( 'products/products-listing', '', array( 'bulk_statuses' => $bulk_statuses ) );
    }

    /**
     * Handle product add
     *
     * @return void
     */
    public function handle_product_add() {

        if ( ! is_user_logged_in() ) {
            return;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        if ( ! isset( $_POST['dokan_add_new_product_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['dokan_add_new_product_nonce'] ), 'dokan_add_new_product' )  ) {
            return;
        }

        $postdata = wp_unslash( $_POST );

        $errors             = array();
        self::$product_cat  = -1;
        self::$post_content = __( 'Details of your product ...', 'dokan-lite' );

        if ( isset( $postdata['add_product'] ) ) {
            $post_title     = sanitize_text_field( $postdata['post_title'] );
            $post_content   = wp_kses_post( $postdata['post_content'] );
            $post_excerpt   = wp_kses_post( $postdata['post_excerpt'] );
            $featured_image = absint( sanitize_text_field( $postdata['feat_image_id'] ) );

            if ( empty( $post_title ) ) {
                $errors[] = __( 'Please enter product title', 'dokan-lite' );
            }

            if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                $product_cat = intval( $postdata['product_cat'] );

                if ( $product_cat < 0 ) {
                    $errors[] = __( 'Please select a category', 'dokan-lite' );
                }

            } else {
                if ( ! isset( $postdata['product_cat'] ) && empty( $postdata['product_cat'] ) ) {
                    $errors[] = __( 'Please select AT LEAST ONE category', 'dokan-lite' );
                }
            }

            self::$errors = apply_filters( 'dokan_can_add_product', $errors );

            if ( ! self::$errors ) {
                $product_status = dokan_get_new_post_status();
                $post_data = apply_filters( 'dokan_insert_product_post_data', array(
                    'post_type'    => 'product',
                    'post_status'  => $product_status,
                    'post_title'   => $post_title,
                    'post_content' => $post_content,
                    'post_excerpt' => $post_excerpt,
                ) );

                $product_id = wp_insert_post( $post_data );

                if ( $product_id ) {
                    /** set images **/
                    if ( $featured_image ) {
                        set_post_thumbnail( $product_id, $featured_image );
                    }

                    if ( isset( $postdata['product_tag'] ) && ! empty( $postdata['product_tag'] ) ) {
                        $tags_ids = array_map( 'absint', (array) $postdata['product_tag'] );
                        wp_set_object_terms( $product_id, $tags_ids, 'product_tag' );
                    }

                    /** set product category * */
                    if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                        wp_set_object_terms( $product_id, (int) $postdata['product_cat'], 'product_cat' );
                    } else {
                        if ( isset( $postdata['product_cat'] ) && ! empty( $postdata['product_cat'] ) ) {
                            $cat_ids = array_map( 'absint', (array) $postdata['product_cat'] );
                            wp_set_object_terms( $product_id, $cat_ids, 'product_cat' );
                        }
                    }

                    /** Set Product type, default is simple */
                    $product_type = empty( $postdata['product_type'] ) ? 'simple' : $postdata['product_type'];
                    wp_set_object_terms( $product_id, $product_type, 'product_type' );

                    // Gallery Images
                    if ( ! empty( $postdata['product_image_gallery'] ) ) {
                        $attachment_ids = array_filter( explode( ',', wc_clean( $postdata['product_image_gallery'] ) ) );
                        update_post_meta( $product_id, '_product_image_gallery', implode( ',', $attachment_ids ) );
                    }

                    if ( isset( $postdata['_regular_price'] ) ) {
                        update_post_meta( $product_id, '_regular_price', ( $postdata['_regular_price'] === '' ) ? '' : wc_format_decimal( $postdata['_regular_price'] ) );
                    }

                    if ( isset( $postdata['_sale_price'] ) ) {
                        update_post_meta( $product_id, '_sale_price', ( $postdata['_sale_price'] === '' ? '' : wc_format_decimal( $postdata['_sale_price'] ) ) );
                        $date_from = isset( $postdata['_sale_price_dates_from'] ) ? wc_clean( $postdata['_sale_price_dates_from'] ) : '';
                        $date_to   = isset( $postdata['_sale_price_dates_to'] ) ? wc_clean( $postdata['_sale_price_dates_to'] ) : '';

                        // Dates
                        if ( $date_from ) {
                            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( $date_from ) );
                        } else {
                            update_post_meta( $product_id, '_sale_price_dates_from', '' );
                        }

                        if ( $date_to ) {
                            update_post_meta( $product_id, '_sale_price_dates_to', strtotime( '+23 hours', strtotime( $date_to ) ) );
                        } else {
                            update_post_meta( $product_id, '_sale_price_dates_to', '' );
                        }

                        if ( $date_to && ! $date_from ) {
                            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( 'NOW', current_time( 'timestamp' ) ) );
                        }

                        if ( '' !== $postdata['_sale_price'] && '' == $date_to && '' == $date_from ) {
                            update_post_meta( $product_id, '_price', wc_format_decimal( $postdata['_sale_price'] ) );
                        } else {
                            update_post_meta( $product_id, '_price', ( $postdata['_regular_price'] === '' ) ? '' : wc_format_decimal( $postdata['_regular_price'] ) );
                        }
                        // Update price if on sale
                        if ( '' !== $postdata['_sale_price'] && $date_from && strtotime( $date_from ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
                            update_post_meta( $product_id, '_price', wc_format_decimal( $postdata['_sale_price'] ) );
                        }
                    }

                    update_post_meta( $product_id, '_visibility', 'visible' );
                    update_post_meta( $product_id, '_stock_status', 'instock' );

                    do_action( 'dokan_new_product_added', $product_id, $postdata );

                    if ( current_user_can( 'dokan_edit_product' ) ) {
                        $redirect = dokan_edit_product_url( $product_id );
                    } else {
                        $redirect = dokan_get_navigation_url( 'products' );
                    }

                    if ( 'create_and_add_new' === $postdata['add_product'] ) {
                        $redirect = add_query_arg( array( 'created_product' => $product_id ), dokan_get_navigation_url( 'new-product' ) );
                    }

                    wp_redirect( apply_filters( 'dokan_add_new_product_redirect', $redirect, $product_id ) );
                    exit;
                }
            }
        }
    }

    /**
     * Handle product update
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

        if ( ! isset( $_POST['dokan_update_product'] ) ) {
            return;
        }

        if ( ! isset( $_POST['dokan_edit_product_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['dokan_edit_product_nonce'] ), 'dokan_edit_product' ) ) {
            return;
        }

        $postdata = wp_unslash( $_POST );

        $errors      = array();
        $post_title  = sanitize_text_field( $postdata['post_title'] );
        $post_slug   = isset( $postdata['editable-post-name'] ) && ! empty( $postdata['editable-post-name'] ) ? sanitize_title( $postdata['editable-post-name'] ) : '';
        $post_status = isset( $postdata['post_status'] ) ? sanitize_text_field( $postdata['post_status'] ) : 'pending';

        if ( empty( $post_title ) ) {
            $errors[] = __( 'Please enter product title', 'dokan-lite' );
        }

        if ( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
            $product_cat = absint( $postdata['product_cat'] );

            if ( $product_cat < 0 ) {
                $errors[] = __( 'Please select a category', 'dokan-lite' );
            }

        } else {
            if ( ! isset( $postdata['product_cat'] ) && empty( $postdata['product_cat'] ) ) {
                $errors[] = __( 'Please select AT LEAST ONE category', 'dokan-lite' );
            }
        }

        $post_id = isset( $postdata['dokan_product_id'] ) ? absint( $postdata['dokan_product_id'] ) : 0;

        if ( ! $post_id ) {
            $errors[] = __( 'No product found!', 'dokan-lite' );
        }

        if ( ! dokan_is_product_author( $post_id ) ) {
            $errors[] = __( 'I swear this is not your product!', 'dokan-lite' );
        }

        self::$errors = apply_filters( 'dokan_can_edit_product', $errors );

        if ( ! self::$errors ) {
            $product_info = apply_filters( 'dokan_update_product_post_data', array(
                'ID'             => $post_id,
                'post_title'     => $post_title,
                'post_content'   => wp_kses_post( $postdata['post_content'] ),
                'post_excerpt'   => wp_kses_post( $postdata['post_excerpt'] ),
                'post_status'    => $post_status,
                'comment_status' => isset( $postdata['_enable_reviews'] ) ? 'open' : 'closed',
            ) );
            
            if ( $post_slug ) {
                $product_info['post_name'] = wp_unique_post_slug( $post_slug, $post_id, $post_status, 'product', 0 );
            }

            wp_update_post( $product_info );

            /** Set Product tags */
            if ( isset( $postdata['product_tag'] ) ) {
                $tags_ids = array_map( 'absint', (array) $postdata['product_tag'] );
            } else {
                $tags_ids = array();
            }

            wp_set_object_terms( $post_id, $tags_ids, 'product_tag' );

            /** set product category * */
            if ( 'single' == dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) ) {
                wp_set_object_terms( $post_id, (int) $postdata['product_cat'], 'product_cat' );
            } else {
                if ( isset( $postdata['product_cat'] ) && ! empty( $postdata['product_cat'] ) ) {
                    $cat_ids = array_map( 'absint', (array) $postdata['product_cat'] );
                    wp_set_object_terms( $post_id, $cat_ids, 'product_cat' );
                }
            }

            //set prodcuct type default is simple
            $product_type = empty( $postdata['product_type'] ) ? 'simple' : sanitize_text_field( $postdata['product_type'] );
            wp_set_object_terms( $post_id, $product_type, 'product_type' );

            /**  Process all variation products meta */
            dokan_process_product_meta( $post_id, $postdata );

            /** set images **/
            $featured_image = absint( $postdata['feat_image_id'] );

            if ( $featured_image ) {
                set_post_thumbnail( $post_id, $featured_image );
            } else {
                delete_post_thumbnail( $post_id );
            }

            do_action( 'dokan_product_updated', $post_id, $postdata );


            $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_edit_product_url( $post_id ), $post_id );

            // if any error inside dokan_process_product_meta function
            global $woocommerce_errors;

            if ( $woocommerce_errors ) {
                wp_redirect( add_query_arg( array( 'errors' => array_map( 'urlencode', $woocommerce_errors ) ), $redirect ) );
                exit;
            }

            wp_redirect( add_query_arg( array( 'message' => 'success' ), $redirect ) );
            exit;
        }
    }

    public function load_add_new_product_popup() {
        dokan_get_template_part( 'products/tmpl-add-product-popup' );
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
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        $product_id = isset( $_GET['product_id'] ) ? (int) wp_unslash( $_GET['product_id'] ) : 0;

        if ( ! $product_id ) {
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        if ( ! dokan_is_product_author( $product_id ) ) {
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            exit;
        }

        dokan()->product->delete( $product_id, true );

        do_action( 'dokan_product_deleted', $product_id );

        $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_get_navigation_url( 'products' ), '' );

        wp_redirect( add_query_arg( array( 'message' => 'product_deleted' ), $redirect ) );
        exit;
    }

}
