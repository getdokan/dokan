<?php

/**
*  Product Functionality for Product Handler
*
*  @since 2.4
*
*  @package dokan
*/
class Dokan_Template_Products {

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
    function __construct() {
        add_action( 'dokan_render_product_listing_template', array( $this, 'render_product_listing_template' ), 11 );
        add_action( 'template_redirect', array( $this, 'handle_all_submit' ), 11 );
        add_action( 'template_redirect', array( $this, 'handle_delete_product' ) );
        add_action( 'dokan_render_new_product_template', array( $this, 'render_new_product_template' ), 10 );
        add_action( 'dokan_render_product_edit_template', array( $this, 'load_product_edit_template' ), 11 );
        add_action( 'dokan_after_listing_product', array( $this, 'load_add_new_product_popup' ), 10 );
        add_action( 'dokan_product_edit_after_title', array( __CLASS__, 'load_download_virtual_template' ), 10, 2 );
        add_action( 'dokan_product_edit_after_main', array( __CLASS__, 'load_inventory_template' ), 5, 2 );
        add_action( 'dokan_product_edit_after_main', array( __CLASS__, 'load_downloadable_template' ), 10, 2 );
        add_action( 'dokan_product_edit_after_main', array( __CLASS__, 'load_others_template' ), 85, 2 );
    }

    /**
     * Singleton method
     *
     * @return self
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Template_Products();
        }

        return $instance;
    }

    /**
     * Load product
     *
     * @since 1.0.0
     *
     * @return void
     */
    public static function load_download_virtual_template( $post, $post_id ) {
        $_downloadable          = get_post_meta( $post_id, '_downloadable', true );
        $_virtual               = get_post_meta( $post_id, '_virtual', true );
        $is_downloadable        = ( 'yes' == $_downloadable ) ? true : false;
        $is_virtual             = ( 'yes' == $_virtual ) ? true : false;

        dokan_get_template_part( 'products/download-virtual', '', array(
            'post_id'         => $post_id,
            'post'            => $post,
            'is_downloadable' => $is_downloadable,
            'is_virtual'      => $is_virtual,
            'class'           => 'show_if_simple'
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
            'class'              => ''
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
        dokan_get_template_part( 'products/downloadable', '', array(
            'post_id' => $post_id,
            'post'    => $post,
            'class'   => 'show_if_downloadable'
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
            'class'              => ''
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
        if ( isset( $query_vars['new-product'] ) && !WeDevs_Dokan::init()->is_pro_exists() ) {
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
            dokan_get_template_part('global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'You have no permission to view this page', 'dokan-lite' ) ) );
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
     * Handle all the form POST submit
     *
     * @return void
     */
    function handle_all_submit() {
        global $wpdb;

        if ( ! is_user_logged_in() ) {
            return;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        $errors = array();
        self::$product_cat  = -1;
        self::$post_content = __( 'Details of your product ...', 'dokan-lite' );

        if ( isset( $_POST['add_product'] ) && wp_verify_nonce( $_POST['dokan_add_new_product_nonce'], 'dokan_add_new_product' ) ) {
            $post_title     = trim( $_POST['post_title'] );
            $post_content   = trim( $_POST['post_content'] );
            $post_excerpt   = trim( $_POST['post_excerpt'] );
            $featured_image = absint( $_POST['feat_image_id'] );

            if ( empty( $post_title ) ) {
                $errors[] = __( 'Please enter product title', 'dokan-lite' );
            }

            if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                $product_cat    = intval( $_POST['product_cat'] );
                if ( $product_cat < 0 ) {
                    $errors[] = __( 'Please select a category', 'dokan-lite' );
                }
            } else {
                if( !isset( $_POST['product_cat'] ) && empty( $_POST['product_cat'] ) ) {
                    $errors[] = __( 'Please select AT LEAST ONE category', 'dokan-lite' );
                }
            }

            self::$errors = apply_filters( 'dokan_can_add_product', $errors );

            if ( !self::$errors ) {
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

                    if( isset( $_POST['product_tag'] ) && !empty( $_POST['product_tag'] ) ) {
                        $tags_ids = array_map( 'intval', (array)$_POST['product_tag'] );
                        wp_set_object_terms( $product_id, $tags_ids, 'product_tag' );
                    }

                    /** set product category * */
                    if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                        wp_set_object_terms( $product_id, (int) $_POST['product_cat'], 'product_cat' );
                    } else {
                        if( isset( $_POST['product_cat'] ) && !empty( $_POST['product_cat'] ) ) {
                            $cat_ids = array_map( 'intval', (array)$_POST['product_cat'] );
                            wp_set_object_terms( $product_id, $cat_ids, 'product_cat' );
                        }
                    }

                    /** Set Product type, default is simple */
                    $product_type = empty( $_POST['product_type'] ) ? 'simple' : stripslashes( $_POST['product_type'] );
                    wp_set_object_terms( $product_id, $product_type, 'product_type' );

                    // Gallery Images
                    if (  !empty( $_POST['product_image_gallery'] ) ) {
                        $attachment_ids = array_filter( explode( ',', wc_clean( $_POST['product_image_gallery'] ) ) );
                        update_post_meta( $product_id, '_product_image_gallery', implode( ',', $attachment_ids ) );
                    }

                    if ( isset( $_POST['_regular_price'] ) ) {
                        update_post_meta( $product_id, '_regular_price', ( $_POST['_regular_price'] === '' ) ? '' : wc_format_decimal( $_POST['_regular_price'] ) );
                    }

                    if ( isset( $_POST['_sale_price'] ) ) {
                        update_post_meta( $product_id, '_sale_price', ( $_POST['_sale_price'] === '' ? '' : wc_format_decimal( $_POST['_sale_price'] ) ) );
                        $date_from = isset( $_POST['_sale_price_dates_from'] ) ? $_POST['_sale_price_dates_from'] : '';
                        $date_to   = isset( $_POST['_sale_price_dates_to'] ) ? $_POST['_sale_price_dates_to'] : '';
                        // Dates
                        if ( $date_from ) {
                            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( $date_from ) );
                        } else {
                            update_post_meta( $product_id, '_sale_price_dates_from', '' );
                        }

                        if ( $date_to ) {
                            update_post_meta( $product_id, '_sale_price_dates_to', strtotime( $date_to ) );
                        } else {
                            update_post_meta( $product_id, '_sale_price_dates_to', '' );
                        }

                        if ( $date_to && ! $date_from ) {
                            update_post_meta( $product_id, '_sale_price_dates_from', strtotime( 'NOW', current_time( 'timestamp' ) ) );
                        }

                        if ( '' !== $_POST['_sale_price'] && '' == $date_to && '' == $date_from ) {
                            update_post_meta( $product_id, '_price', wc_format_decimal( $_POST['_sale_price'] ) );
                        } else {
                            update_post_meta( $product_id, '_price', ( $_POST['_regular_price'] === '' ) ? '' : wc_format_decimal( $_POST['_regular_price'] )  );
                        }
                        // Update price if on sale
                        if ( '' !== $_POST['_sale_price'] && $date_from && strtotime( $date_from ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
                            update_post_meta( $product_id, '_price', wc_format_decimal( $_POST['_sale_price'] ) );
                        }

                        if ( $date_to && strtotime( $date_to ) < strtotime( 'NOW', current_time( 'timestamp' ) ) ) {
                            update_post_meta( $product_id, '_price', ( $_POST['_regular_price'] === '' ) ? '' : wc_format_decimal( $_POST['_regular_price'] )  );
                            update_post_meta( $product_id, '_sale_price_dates_from', '' );
                            update_post_meta( $product_id, '_sale_price_dates_to', '' );
                        }
                    }

                    update_post_meta( $product_id, '_visibility', 'visible' );

                    do_action( 'dokan_new_product_added', $product_id, $post_data );

                    if ( current_user_can( 'dokan_edit_product' ) ) {
                        $redirect = dokan_edit_product_url( $product_id );
                    } else {
                        $redirect = dokan_get_navigation_url( 'products' );
                    }

                    if ( 'create_and_add_new' === $_POST['add_product'] ) {
                        $redirect = add_query_arg( array( 'created_product' => $product_id ), dokan_get_navigation_url( 'new-product' ) );
                    }

                    wp_redirect( apply_filters( 'dokan_add_new_product_redirect', $redirect, $product_id ) );
                    exit;
                }
            }
        }

        if ( isset( $_POST['dokan_update_product'] ) && wp_verify_nonce( $_POST['dokan_edit_product_nonce'], 'dokan_edit_product' ) ) {

            $post_title     = trim( $_POST['post_title'] );

            if ( empty( $post_title ) ) {
                $errors[] = __( 'Please enter product title', 'dokan-lite' );
            }

            if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                $product_cat    = intval( $_POST['product_cat'] );
                if ( $product_cat < 0 ) {
                    $errors[] = __( 'Please select a category', 'dokan-lite' );
                }
            } else {
                if( !isset( $_POST['product_cat'] ) && empty( $_POST['product_cat'] ) ) {
                    $errors[] = __( 'Please select AT LEAST ONE category', 'dokan-lite' );
                }
            }

            $post_id = isset( $_POST['dokan_product_id'] ) ? intval( $_POST['dokan_product_id'] ) : 0;

            if ( ! $post_id ) {
                $errors[] = __( 'No product found !', 'dokan-lite' );
            }

            self::$errors = apply_filters( 'dokan_can_edit_product', $errors );

            if ( !self::$errors ) {
                $product_info = apply_filters( 'dokan_update_product_post_data', array(
                    'ID'             => $post_id,
                    'post_title'     => sanitize_text_field( $_POST['post_title'] ),
                    'post_content'   => $_POST['post_content'],
                    'post_excerpt'   => $_POST['post_excerpt'],
                    'post_status'    => isset( $_POST['post_status'] ) ? $_POST['post_status'] : 'pending',
                    'comment_status' => isset( $_POST['_enable_reviews'] ) ? 'open' : 'closed'
                ) );

                wp_update_post( $product_info );

                /** Set Product tags */
                if( isset( $_POST['product_tag'] ) ) {
                    $tags_ids = array_map( 'intval', (array)$_POST['product_tag'] );
                } else {
                    $tags_ids = array();
                }
                wp_set_object_terms( $post_id, $tags_ids, 'product_tag' );

                /** set product category * */
                if( dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ) {
                    wp_set_object_terms( $post_id, (int) $_POST['product_cat'], 'product_cat' );
                } else {
                    if( isset( $_POST['product_cat'] ) && !empty( $_POST['product_cat'] ) ) {
                        $cat_ids = array_map( 'intval', (array)$_POST['product_cat'] );
                        wp_set_object_terms( $post_id, $cat_ids, 'product_cat' );
                    }
                }

                //set prodcuct type default is simple
                $product_type = empty( $_POST['product_type'] ) ? 'simple' : stripslashes( $_POST['product_type'] );
                wp_set_object_terms( $post_id, $product_type, 'product_type' );

                /**  Process all variation products meta */
                dokan_process_product_meta( $post_id );

                /** set images **/
                $featured_image = absint( $_POST['feat_image_id'] );
                if ( $featured_image ) {
                    set_post_thumbnail( $post_id, $featured_image );
                } else {
                    delete_post_thumbnail( $post_id );
                }

                do_action( 'dokan_product_updated', $post_id, $_POST );

                //$edit_url = dokan_edit_product_url( $post_id );

                $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_edit_product_url( $post_id ), $post_id );

                wp_redirect( add_query_arg( array( 'message' => 'success' ), $redirect ) );
                exit;
            }
        }
    }

    function load_add_new_product_popup() {
        dokan_get_template_part( 'products/tmpl-add-product-popup' );
    }

    /**
     * Handle delete product link
     *
     * @return void
     */
    function handle_delete_product() {

        if ( ! is_user_logged_in() ) {
            return;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_delete_product' ) ) {
            return;
        }

        dokan_delete_product_handler();
    }

}
