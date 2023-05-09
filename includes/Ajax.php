<?php

namespace WeDevs\Dokan;

use WC_Customer;
use WC_Data_Store;

/**
 * Ajax handler for Dokan
 */
class Ajax {

    /**
     * Class constructor
     *
     * @return void
     */
    public function __construct() {
        add_action( 'wp_ajax_withdraw_ajax_submission', [ $this, 'withdraw_export_csv' ] );

        //settings
        $settings = dokan()->dashboard->templates->settings;
        add_action( 'wp_ajax_dokan_settings', [ $settings, 'ajax_settings' ] );

        add_action( 'wp_ajax_dokan-mark-order-complete', [ $this, 'complete_order' ] );
        add_action( 'wp_ajax_dokan-mark-order-processing', [ $this, 'process_order' ] );
        add_action( 'wp_ajax_dokan_grant_access_to_download', [ $this, 'grant_access_to_download' ] );
        add_action( 'wp_ajax_dokan_add_order_note', [ $this, 'add_order_note' ] );
        add_action( 'wp_ajax_dokan_delete_order_note', [ $this, 'delete_order_note' ] );
        add_action( 'wp_ajax_dokan_change_status', [ $this, 'change_order_status' ] );
        add_action( 'wp_ajax_dokan_contact_seller', [ $this, 'contact_seller' ] );
        add_action( 'wp_ajax_nopriv_dokan_contact_seller', [ $this, 'contact_seller' ] );

        add_action( 'wp_ajax_dokan_add_shipping_tracking_info', [ $this, 'add_shipping_tracking_info' ] );

        add_action( 'wp_ajax_dokan_revoke_access_to_download', [ $this, 'revoke_access_to_download' ] );

        add_action( 'wp_ajax_shop_url', [ $this, 'shop_url_check' ] );
        add_action( 'wp_ajax_nopriv_shop_url', [ $this, 'shop_url_check' ] );

        add_action( 'wp_ajax_dokan_seller_listing_search', [ $this, 'seller_listing_search' ] );
        add_action( 'wp_ajax_nopriv_dokan_seller_listing_search', [ $this, 'seller_listing_search' ] );

        add_action( 'wp_ajax_dokan_create_new_product', [ $this, 'create_product' ] );

        add_action( 'wp_ajax_custom-header-crop', [ $this, 'crop_store_banner' ] );

        add_action( 'wp_ajax_dokan_json_search_products_tags', [ $this, 'dokan_json_search_products_tags' ] );

        add_action( 'wp_ajax_dokan_json_search_products_and_variations', [ $this, 'json_search_product' ], 10 );
        add_action( 'wp_ajax_nopriv_dokan_json_search_products_and_variations', [ $this, 'json_search_product' ], 10 );
        add_action( 'wp_ajax_dokan_json_search_vendor_customers', [ $this, 'dokan_json_search_vendor_customers' ] );

        add_action( 'wp_ajax_nopriv_dokan_get_login_form', [ $this, 'get_login_form' ] );
        add_action( 'wp_ajax_nopriv_dokan_login_user', [ $this, 'login_user' ] );

        add_action( 'wp_ajax_dokan-upgrade-dissmiss', [ $this, 'dismiss_pro_notice' ] );
    }

    /**
     * Create product from popup submission
     *
     * @since  2.5.0
     *
     * @return void
     */
    public function create_product() {
        check_ajax_referer( 'dokan_reviews' );

        if ( ! current_user_can( 'dokan_add_product' ) ) {
            wp_send_json_error( __( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        $submited_data = isset( $_POST['postdata'] ) ? wp_unslash( $_POST['postdata'] ) : ''; //phpcs:ignore

        parse_str( $submited_data, $postdata );

        $response = dokan_save_product( $postdata );

        if ( is_wp_error( $response ) ) {
            wp_send_json_error( $response->get_error_message() );
        }

        if ( is_int( $response ) ) {
            if ( current_user_can( 'dokan_edit_product' ) ) {
                $redirect = dokan_edit_product_url( $response );
            } else {
                $redirect = dokan_get_navigation_url( 'products' );
            }

            wp_send_json_success( $redirect );
        } else {
            wp_send_json_error( __( 'Something wrong, please try again later', 'dokan-lite' ) );
        }
    }

    /**
     * Check the availability of shop name.
     *
     * @return void
     */
    public function shop_url_check() {
        if ( ! isset( $_POST['_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_nonce'] ), 'dokan_reviews' ) ) {
            wp_send_json_error(
                [
                    'type'    => 'nonce',
                    'message' => __( 'Are you cheating?', 'dokan-lite' ),
                ]
            );
        }

        global $user_ID;

        $url_slug = isset( $_POST['url_slug'] ) ? sanitize_text_field( wp_unslash( $_POST['url_slug'] ) ) : '';
        $check    = true;
        $user     = get_user_by( 'slug', $url_slug );

        if ( false !== $user ) {
            $check = false;
        }

        // check if a customer wants to migrate, his username should be available
        if ( is_user_logged_in() && dokan_is_user_customer( $user_ID ) ) {
            $current_user = wp_get_current_user();

            if ( $user && $current_user->user_nicename === $user->user_nicename ) {
                $check = true;
            }
        }

        if ( is_admin() && isset( $_POST['vendor_id'] ) ) {
            $vendor = get_user_by( 'id', intval( $_POST['vendor_id'] ) );

            if ( $vendor && $user && $vendor->user_nicename === $user->user_nicename ) {
                $check = true;
            }
        }

        if ( $check ) {
            wp_send_json_success(
                [
                    'message' => __( 'Available', 'dokan-lite' ),
                    'url'     => sanitize_user( $url_slug ),
                ]
            );
        }
    }

    /**
     * Mark a order as complete
     *
     * Fires from seller dashboard in frontend
     */
    public function complete_order() {
        if ( ! is_admin() ) {
            die();
        }

        if ( ! current_user_can( 'dokandar' ) || 'on' !== dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'dokan-lite' ) );
        }

        if ( ! check_admin_referer( 'dokan-mark-order-complete' ) ) {
            wp_die( esc_html__( 'You have taken too long. Please go back and retry.', 'dokan-lite' ) );
        }

        $order_id = ! empty( $_GET['order_id'] ) ? intval( $_GET['order_id'] ) : 0;

        if ( ! $order_id ) {
            die();
        }

        if ( ! dokan_is_seller_has_order( dokan_get_current_user_id(), $order_id ) ) {
            wp_die( esc_html__( 'You do not have permission to change this order', 'dokan-lite' ) );
        }

        $order = dokan()->order->get( $order_id );
        $order->update_status( 'completed' );

        wp_safe_redirect( wp_get_referer() );
        die();
    }

    /**
     * Mark a order as processing
     *
     * Fires from frontend seller dashboard
     */
    public function process_order() {
        if ( ! is_admin() ) {
            die();
        }

        if ( ! current_user_can( 'dokandar' ) || 'on' !== dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'dokan-lite' ) );
        }

        if ( ! check_admin_referer( 'dokan-mark-order-processing' ) ) {
            wp_die( esc_html__( 'You have taken too long. Please go back and retry.', 'dokan-lite' ) );
        }

        $order_id = ! empty( $_GET['order_id'] ) ? intval( $_GET['order_id'] ) : 0;

        if ( ! $order_id ) {
            die();
        }

        if ( ! dokan_is_seller_has_order( dokan_get_current_user_id(), $order_id ) ) {
            wp_die( esc_html__( 'You do not have permission to change this order', 'dokan-lite' ) );
        }

        $order = dokan()->order->get( $order_id );
        $order->update_status( 'processing' );

        wp_safe_redirect( wp_get_referer() );
        exit;
    }

    /**
     * Grant download permissions via ajax function
     *
     * @return void
     */
    public function grant_access_to_download() {
        global $wpdb;

        check_ajax_referer( 'grant-access', 'security' );

        if ( ! current_user_can( 'dokandar' ) || ! isset( $_POST['loop'], $_POST['order_id'], $_POST['product_ids'] ) ) {
            wp_die( - 1 );
        }

        $order_id     = isset( $_POST['order_id'] ) ? intval( $_POST['order_id'] ) : 0;
        $product_ids  = isset( $_POST['product_ids'] ) ? intval( $_POST['product_ids'] ) : 0;
        $loop         = isset( $_POST['loop'] ) ? intval( $_POST['loop'] ) : 0;
        $file_counter = 0;
        $order        = dokan()->order->get( $order_id );

        if ( ! is_array( $product_ids ) ) {
            $product_ids = [ $product_ids ];
        }

        $wpdb->hide_errors();

        $order_id    = intval( $_POST['order_id'] );
        $product_ids = array_filter( array_map( 'absint', (array) wp_unslash( $_POST['product_ids'] ) ) );
        $loop        = intval( $_POST['loop'] );
        $file_count  = 1;
        $order       = dokan()->order->get( $order_id );

        foreach ( $product_ids as $product_id ) {
            $product = dokan()->product->get( $product_id );
            $files   = $product->get_downloads();

            if ( ! $order->get_billing_email() ) {
                wp_die();
            }

            if ( $files ) {
                foreach ( $files as $download_id => $file ) {
                    $inserted_id = wc_downloadable_file_permission( $download_id, $product_id, $order );

                    if ( $inserted_id ) {
                        $download = new \WC_Customer_Download( $inserted_id );

                        include dirname( __DIR__ ) . '/templates/orders/order-download-permission-html.php';

                        $loop ++;
                        $file_count ++;
                    }
                }
            }
        }

        wp_die();
    }

    /**
     * Update a order status
     *
     * @return void
     */
    public function change_order_status() {
        check_ajax_referer( 'dokan_change_status' );

        if ( ! current_user_can( 'dokan_manage_order' ) || 'on' !== dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) ) {
            wp_send_json_error( __( 'You have no permission to manage this order', 'dokan-lite' ) );

            return;
        }

        $order_id     = isset( $_POST['order_id'] ) ? intval( $_POST['order_id'] ) : '';
        $order_status = isset( $_POST['order_status'] ) ? sanitize_text_field( wp_unslash( $_POST['order_status'] ) ) : '';

        $order = dokan()->order->get( $order_id );
        $order->update_status( $order_status );

        $statuses     = wc_get_order_statuses();
        $status_label = isset( $statuses[ $order_status ] ) ? $statuses[ $order_status ] : $order_status;
        $status_class = dokan_get_order_status_class( $order_status );

        $html = '<label class="dokan-label dokan-label-' . esc_attr( $status_class ) . '">' . esc_attr( $status_label ) . '</label>';

        wp_send_json_success( $html );
    }

    /**
     * Seller store page email contact form handler
     *
     * Catches the form submission from store page
     */
    public function contact_seller() {
        if ( ! isset( $_POST['dokan_contact_seller_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['dokan_contact_seller_nonce'] ) ), 'dokan_contact_seller' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $contact_name    = ! empty( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
        $contact_email   = ! empty( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
        $contact_message = ! empty( $_POST['message'] ) ? sanitize_text_field( wp_unslash( $_POST['message'] ) ) : '';
        $recaptcha_token = ! empty( $_POST['dokan_recaptcha_token'] ) ? wp_unslash( $_POST['dokan_recaptcha_token'] ) : ''; // phpcs:ignore
        $error_template  = '<span class="alert alert-danger error">%s</span>';

        if ( empty( $contact_name ) ) {
            $message = sprintf( $error_template, __( 'Please provide your name.', 'dokan-lite' ) );
            wp_send_json_error( $message );
        }

        if ( empty( $contact_email ) ) {
            $message = sprintf( $error_template, __( 'Please provide your email.', 'dokan-lite' ) );
            wp_send_json_error( $message );
        }

        $seller = ! empty( $_POST['seller_id'] ) ? get_user_by( 'id', absint( wp_unslash( $_POST['seller_id'] ) ) ) : 0;

        if ( empty( $seller ) ) {
            $message = sprintf( $error_template, __( 'Something went wrong!', 'dokan-lite' ) );
            wp_send_json_error( $message );
        }

        // Validate recaptcha if site key and secret key exist
        if ( dokan_get_recaptcha_site_and_secret_keys( true ) ) {
            $recaptcha_keys     = dokan_get_recaptcha_site_and_secret_keys();
            $recaptcha_validate = dokan_handle_recaptcha_validation( 'dokan_contact_seller_recaptcha', $recaptcha_token, $recaptcha_keys['secret_key'] );

            if ( empty( $recaptcha_validate ) ) {
                $message = sprintf( $error_template, __( 'reCAPTCHA verification failed!', 'dokan-lite' ) );
                wp_send_json_error( $message );
            }
        }

        do_action( 'dokan_trigger_contact_seller_mail', $seller->user_email, $contact_name, $contact_email, $contact_message );

        $success = sprintf( '<div class="alert alert-success">%s</div>', __( 'Email sent successfully!', 'dokan-lite' ) );
        wp_send_json_success( $success );
    }

    /**
     * Rovoke file download access for customer
     *
     * @return void
     */
    public function revoke_access_to_download() {
        check_ajax_referer( 'revoke-access', 'security' );

        if ( ! current_user_can( 'dokandar' ) || ! isset( $_POST['download_id'], $_POST['product_id'], $_POST['order_id'], $_POST['permission_id'] ) ) {
            wp_die( - 1 );
        }

        $download_id   = intval( wp_unslash( $_POST['download_id'] ) );
        $product_id    = intval( $_POST['product_id'] );
        $order_id      = intval( $_POST['order_id'] );
        $permission_id = absint( $_POST['permission_id'] );

        $data_store = WC_Data_Store::load( 'customer-download' );
        $data_store->delete_by_id( $permission_id );

        do_action( 'woocommerce_ajax_revoke_access_to_product_download', $download_id, $product_id, $order_id, $permission_id );
        wp_die();
    }

    /**
     * Add order note via ajax
     */
    public function add_order_note() {
        check_ajax_referer( 'add-order-note', 'security' );

        if ( ! is_user_logged_in() ) {
            die( - 1 );
        }

        if ( ! current_user_can( 'dokan_manage_order_note' ) ) {
            die( - 1 );
        }

        $post_id   = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : '';
        $note      = isset( $_POST['note'] ) ? sanitize_textarea_field( wp_unslash( $_POST['note'] ) ) : '';
        $note_type = isset( $_POST['note_type'] ) ? sanitize_text_field( wp_unslash( $_POST['note_type'] ) ) : '';

        $is_customer_note = ( $note_type === 'customer' ) ? 1 : 0;

        if ( $post_id > 0 ) {
            $order      = dokan()->order->get( $post_id );
            $comment_id = $order->add_order_note( $note, $is_customer_note, true );

            echo '<li rel="' . esc_attr( $comment_id ) . '" class="note ';

            if ( $is_customer_note ) {
                echo 'customer-note';
            }
            echo '"><div class="note_content">';
            echo wpautop( wptexturize( $note ) ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            echo '</div><p class="meta"><a href="#" class="delete_note">' . esc_html__( 'Delete note', 'dokan-lite' ) . '</a></p>';
            echo '</li>';
        }

        // Quit out
        die();
    }

    /**
     * Add shipping tracking info via ajax
     */
    public function add_shipping_tracking_info() {
        if ( ! isset( $_REQUEST['security'] ) || ! wp_verify_nonce( sanitize_key( $_REQUEST['security'] ), 'add-shipping-tracking-info' ) ) {
            die( - 1 );
        }

        if ( ! is_user_logged_in() ) {
            die( - 1 );
        }

        if ( ! current_user_can( 'dokan_manage_order_note' ) ) {
            die( - 1 );
        }

        $post_id           = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
        $shipping_provider = isset( $_POST['shipping_provider'] ) ? sanitize_text_field( wp_unslash( $_POST['shipping_provider'] ) ) : '';
        $shipping_number   = isset( $_POST['shipping_number'] ) ? sanitize_text_field( wp_unslash( $_POST['shipping_number'] ) ) : '';
        $shipping_number   = trim( stripslashes( $shipping_number ) );
        $shipped_date      = isset( $_POST['shipped_date'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['shipped_date'] ) ) ) : '';

        $ship_info = __( 'Shipping provider: ', 'dokan-lite' ) . $shipping_provider . '<br />' . __( 'Shipping number: ', 'dokan-lite' ) . $shipping_number . '<br />' . __( 'Shipped date: ', 'dokan-lite' ) . $shipped_date;

        if ( $shipping_number === '' ) {
            die();
        }

        if ( $post_id > 0 ) {
            $order = dokan()->order->get( $post_id );
            $time  = current_time( 'mysql' );

            $data = [
                'comment_post_ID'      => $post_id,
                'comment_author'       => 'WooCommerce',
                'comment_author_email' => '',
                'comment_author_url'   => '',
                'comment_content'      => $ship_info,
                'comment_type'         => 'order_note',
                'comment_parent'       => 0,
                'user_id'              => dokan_get_current_user_id(),
                'comment_author_IP'    => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
                'comment_agent'        => isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '',
                'comment_date'         => $time,
                'comment_approved'     => 1,
            ];

            $comment_id = wp_insert_comment( $data );

            update_comment_meta( $comment_id, 'is_customer_note', true );

            do_action(
                'woocommerce_new_customer_note', [
                    'order_id'      => dokan_get_prop( $order, 'id' ),
                    'customer_note' => $ship_info,
                ]
            );

            echo '<li rel="' . esc_attr( $comment_id ) . '" class="note ';
            echo 'customer-note';
            echo '"><div class="note_content">';
            echo wpautop( wptexturize( $ship_info ) ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            echo '</div><p class="meta"><a href="#" class="delete_note">' . esc_html__( 'Delete', 'dokan-lite' ) . '</a></p>';
            echo '</li>';

            do_action( 'dokan_order_tracking_updated', $post_id, dokan_get_current_user_id() );
        }

        // Quit out
        die();
    }

    /**
     * Delete order note via ajax
     */
    public function delete_order_note() {
        check_ajax_referer( 'delete-order-note', 'security' );

        if ( ! is_user_logged_in() ) {
            die( - 1 );
        }

        if ( ! current_user_can( 'dokandar' ) ) {
            die( - 1 );
        }

        $note_id = isset( $_POST['note_id'] ) ? intval( $_POST['note_id'] ) : '';

        if ( $note_id > 0 ) {
            wp_delete_comment( $note_id );
        }

        // Quit out
        die();
    }

    /**
     * Search seller listing
     *
     * @return void
     */
    public function seller_listing_search() {
        if ( ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_REQUEST['_wpnonce'] ), 'dokan-seller-listing-search' ) ) {
            wp_send_json_error( __( 'Error: Nonce verification failed', 'dokan-lite' ) );
        }

        $paged  = 1;
        $limit  = 10;
        $offset = ( $paged - 1 ) * $limit;

        $seller_args = [
            'number' => $limit,
            'offset' => $offset,
        ];

        $search_term     = isset( $_REQUEST['search_term'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['search_term'] ) ) : '';
        $pagination_base = isset( $_REQUEST['pagination_base'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['pagination_base'] ) ) : '';
        $per_row         = isset( $_REQUEST['per_row'] ) ? absint( $_REQUEST['per_row'] ) : '3';

        if ( '' !== $search_term ) {
            $seller_args['meta_query'] = [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                [
                    'key'     => 'dokan_store_name',
                    'value'   => $search_term,
                    'compare' => 'LIKE',
                ],
            ];
        }

        $seller_args = apply_filters( 'dokan_seller_listing_search_args', $seller_args, $_REQUEST );
        $sellers     = dokan_get_sellers( $seller_args );

        $template_args = apply_filters(
            'dokan_store_list_args', [
                'sellers'         => $sellers,
                'limit'           => $limit,
                'paged'           => $paged,
                'image_size'      => 'medium',
                'search'          => 'yes',
                'pagination_base' => $pagination_base,
                'per_row'         => $per_row,
                'search_query'    => $search_term,
            ]
        );

        ob_start();
        dokan_get_template_part( 'store-lists-loop', false, $template_args );
        $content = ob_get_clean();

        wp_send_json_success( $content );
    }

    /**
     * Gets attachment uploaded by Media Manager, crops it, then saves it as a
     * new object. Returns JSON-encoded object details.
     *
     * @since 2.5
     *
     * @return void
     */
    public function crop_store_banner() {
        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            wp_send_json_error();
        }

        $post_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;

        check_ajax_referer( 'image_editor-' . $post_id, 'nonce' );

        $crop_details = isset( $_POST['cropDetails'] ) ? array_map( 'absint', wp_unslash( $_POST['cropDetails'] ) ) : [];

        $dimensions = $this->get_header_dimensions(
            [
                'height' => $crop_details['height'],
                'width'  => $crop_details['width'],
            ]
        );

        $attachment_id = absint( $post_id );

        $cropped = wp_crop_image(
            $attachment_id,
            $crop_details['x1'],
            $crop_details['y1'],
            $crop_details['width'],
            $crop_details['height'],
            absint( $dimensions['dst_width'] ),
            absint( $dimensions['dst_height'] )
        );

        if ( ! $cropped || is_wp_error( $cropped ) ) {
            wp_send_json_error( [ 'message' => __( 'Image could not be processed. Please go back and try again.', 'dokan-lite' ) ] );
        }

        /** This filter is documented in wp-admin/custom-header.php */
        $cropped = apply_filters( 'wp_create_file_in_uploads', $cropped, $attachment_id ); // For replication

        $object = $this->create_attachment_object( $cropped, $attachment_id );

        unset( $object['ID'] );

        $new_attachment_id = $this->insert_attachment( $object, $cropped );

        $object['attachment_id'] = $new_attachment_id;
        $object['url']           = wp_get_attachment_url( $new_attachment_id );
        $object['width']         = $dimensions['dst_width'];
        $object['height']        = $dimensions['dst_height'];

        wp_send_json_success( $object );
    }

    /**
     * Search product using term
     *
     * @since 2.6.8
     *
     * @return void
     */
    public function json_search_product() {
        check_ajax_referer( 'search-products', 'security' );

        $term     = ! empty( $_GET['term'] ) ? sanitize_text_field( wp_unslash( $_GET['term'] ) ) : '';
        $user_ids = ! empty( $_GET['user_ids'] ) ? array_filter( array_map( 'absint', (array) wp_unslash( $_GET['user_ids'] ) ) ) : false;

        if ( empty( $term ) ) {
            wp_die();
        }

        $ids = dokan_search_seller_products( $term, $user_ids, '', true );

        if ( ! empty( $_GET['exclude'] ) ) {
            $ids = array_diff( $ids, (array) sanitize_text_field( wp_unslash( $_GET['exclude'] ) ) );
        }

        if ( ! empty( $_GET['include'] ) ) {
            $ids = array_intersect( $ids, (array) sanitize_text_field( wp_unslash( $_GET['include'] ) ) );
        }

        if ( ! empty( $_GET['limit'] ) ) {
            $ids = array_slice( $ids, 0, absint( $_GET['limit'] ) );
        }

        $product_objects = array_filter( array_map( 'wc_get_product', $ids ), 'dokan_products_array_filter_editable' );
        $products        = [];

        foreach ( $product_objects as $product_object ) {
            $products[ $product_object->get_id() ] = rawurldecode( $product_object->get_formatted_name() );
        }

        wp_send_json( apply_filters( 'dokan_json_search_found_products', $products ) );
    }

    /**
     * Search product tags
     *
     * @since 3.0.5
     *
     * @return array
     */
    public function dokan_json_search_products_tags() {
        check_ajax_referer( 'search-products-tags', 'security' );

        $return = [];
        $name   = ! empty( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
        $page   = ! empty( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : 1;
        $offset = ( $page - 1 ) * 10;

        $drop_down_tags = apply_filters(
            'dokan_search_product_tags_for_vendor_products', [
                'name__like' => $name,
                'hide_empty' => 0,
                'orderby'    => 'name',
                'order'      => 'ASC',
                'number'     => 10,
                'offset'     => $offset,
            ]
        );

        $product_tags = get_terms( 'product_tag', $drop_down_tags );

        if ( $product_tags ) {
            foreach ( $product_tags as $pro_term ) {
                $return[] = [ $pro_term->term_id, $pro_term->name ];
            }
        }

        echo wp_json_encode( $return );
        die;
    }

    /**
     * Search customer
     *
     * @since 2.8.3
     *
     * @return array
     */
    public function dokan_json_search_vendor_customers() {
        check_ajax_referer( 'search-customer', 'security' );

        if ( ! current_user_can( 'edit_shop_orders' ) ) {
            wp_die( - 1 );
        }

        $term    = isset( $_GET['term'] ) ? sanitize_text_field( wp_unslash( $_GET['term'] ) ) : '';
        $exclude = [];
        $limit   = '';

        if ( empty( $term ) ) {
            wp_die();
        }

        $ids = [];
        // Search by ID.
        if ( is_numeric( $term ) ) {
            $customer = new WC_Customer( intval( $term ) );

            // Customer does not exists.
            if ( 0 !== $customer->get_id() ) {
                $ids = [ $customer->get_id() ];
            }
        }

        // Usernames can be numeric so we first check that no users was found by ID before searching for numeric username, this prevents performance issues with ID lookups.
        if ( empty( $ids ) ) {
            $data_store = WC_Data_Store::load( 'customer' );

            // If search is smaller than 3 characters, limit result set to avoid
            // too many rows being returned.
            if ( 3 > strlen( $term ) ) {
                $limit = 20;
            }
            $ids = $data_store->search_customers( $term, $limit );
        }

        $found_customers = [];

        if ( ! empty( $_GET['exclude'] ) ) {
            $ids = array_diff( $ids, (array) sanitize_text_field( wp_unslash( $_GET['exclude'] ) ) );
        }

        foreach ( $ids as $id ) {
            if ( ! dokan_customer_has_order_from_this_seller( $id ) ) {
                continue;
            }

            $customer = new WC_Customer( $id );
            /* translators: 1: user display name 2: user ID 3: user email */
            $found_customers[ $id ] = sprintf(
                esc_html( '%1$s' ),
                $customer->get_first_name() . ' ' . $customer->get_last_name()
            );
        }

        wp_send_json( apply_filters( 'dokan_json_search_found_customers', $found_customers ) );
    }

    /**
     * Calculate width and height based on what the currently selected theme supports.
     *
     * @since 2.5
     *
     * @param array $dimensions
     *
     * @return array dst_height and dst_width of header image
     */
    final public function get_header_dimensions( $dimensions ) {
        $general_settings = get_option( 'dokan_general', [] );

        $max_width       = 0;
        $width           = absint( $dimensions['width'] );
        $height          = absint( $dimensions['height'] );
        $theme_width     = dokan_get_vendor_store_banner_width();
        $theme_height    = dokan_get_vendor_store_banner_height();
        $has_flex_width  = ! empty( $general_settings['store_banner_flex_width'] ) ? $general_settings['store_banner_flex_width'] : true;
        $has_flex_height = ! empty( $general_settings['store_banner_flex_height'] ) ? $general_settings['store_banner_flex_height'] : true;
        $has_max_width   = ! empty( $general_settings['store_banner_max_width'] ) ? $general_settings['store_banner_max_width'] : false;
        $dst             = [
            'dst_height' => null,
            'dst_width'  => null,
        ];

        // For flex, limit size of image displayed to 1500px unless theme says otherwise
        if ( $has_flex_width ) {
            $max_width = 625;
        }

        if ( $has_max_width ) {
            $max_width = max( $max_width, get_theme_support( 'custom-header', 'max-width' ) );
        }
        $max_width = max( $max_width, $theme_width );

        if ( $has_flex_height && ( ! $has_flex_width || $width > $max_width ) ) {
            $dst['dst_height'] = absint( $height * ( $max_width / $width ) );
        } elseif ( $has_flex_height && $has_flex_width ) {
            $dst['dst_height'] = $height;
        } else {
            $dst['dst_height'] = $theme_height;
        }

        if ( $has_flex_width && ( ! $has_flex_height || $width > $max_width ) ) {
            $dst['dst_width'] = absint( $width * ( $max_width / $width ) );
        } elseif ( $has_flex_width && $has_flex_height ) {
            $dst['dst_width'] = $width;
        } else {
            $dst['dst_width'] = $theme_width;
        }

        return $dst;
    }

    /**
     * Create an attachment 'object'.
     *
     * @since 2.5
     *
     * @param string $cropped              cropped image URL
     * @param int    $parent_attachment_id attachment ID of parent image
     *
     * @return array attachment object
     */
    final public function create_attachment_object( $cropped, $parent_attachment_id ) {
        $parent     = get_post( $parent_attachment_id );
        $parent_url = wp_get_attachment_url( $parent->ID );
        $url        = str_replace( basename( $parent_url ), basename( $cropped ), $parent_url );

        $size       = getimagesize( $cropped );
        $image_type = ( $size ) ? $size['mime'] : 'image/jpeg';

        $object = [
            'ID'             => $parent_attachment_id,
            'post_title'     => basename( $cropped ),
            'post_mime_type' => $image_type,
            'guid'           => $url,
            'context'        => 'custom-header',
        ];

        return $object;
    }

    /**
     * Insert an attachment and its metadata.
     *
     * @since 2.5
     *
     * @param array  $object  attachment object
     * @param string $cropped cropped image URL
     *
     * @return int attachment ID
     */
    final public function insert_attachment( $object, $cropped ) {
        $attachment_id = wp_insert_attachment( $object, $cropped );
        $metadata      = wp_generate_attachment_metadata( $attachment_id, $cropped );
        $metadata      = apply_filters( 'wp_header_image_attachment_metadata', $metadata );

        wp_update_attachment_metadata( $attachment_id, $metadata );

        return $attachment_id;
    }

    /**
     * Get contents for login form popup
     *
     * @since 2.9.11
     *
     * @return void
     */
    public function get_login_form() {
        check_ajax_referer( 'dokan_reviews' );

        ob_start();
        dokan_get_template_part( 'login-form/login-form-popup' );
        $popup_html = ob_get_clean();

        wp_send_json_success(
            [
                'title' => esc_html__( 'Please Login to Continue', 'dokan-lite' ),
                'html'  => $popup_html,
            ]
        );
    }

    /**
     * Login user
     *
     * @since 2.9.11
     *
     * @return void
     */
    public static function login_user() {
        check_ajax_referer( 'dokan_reviews' );

        parse_str( $_POST['form_data'], $form_data ); // phpcs:ignore

        $user_login    = isset( $form_data['dokan_login_form_username'] ) ? sanitize_text_field( $form_data['dokan_login_form_username'] ) : null;
        $user_password = isset( $form_data['dokan_login_form_password'] ) ? sanitize_text_field( $form_data['dokan_login_form_password'] ) : null;

        if ( empty( $user_login ) || empty( $user_password ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Invalid username or password.', 'dokan-lite' ) ], 400 );
        }

        $wp_user = wp_signon(
            [
                'user_login'    => $user_login,
                'user_password' => $user_password,
            ], ''
        );

        if ( is_wp_error( $wp_user ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Wrong username or password.', 'dokan-lite' ) ], 400 );
        }

        wp_set_current_user( $wp_user->data->ID, $wp_user->data->user_login );

        /**
         * Set LOGGED_IN_COOKIE
         *
         * The set_cookie(LOGGED_IN_COOKIE) in wp_set_auth_cookie doesn't actually
         * set $_COOKIE[LOGGED_IN_COOKIE]. It just send a header to browser which
         * will set after a page refresh. So, in case we try to create a nonce
         * using `wp_create_nonce` immediately after this point, we need to set
         * LOGGED_IN_COOKIE created in wp_set_auth_cookie function.
         *
         * @since 2.9.12
         */
        $headers = headers_list();

        foreach ( $headers as $header ) {
            if ( 0 === strpos( $header, 'Set-Cookie: ' . LOGGED_IN_COOKIE ) ) {
                $value = str_replace( '&', rawurlencode( '&' ), substr( $header, 12 ) );
                parse_str( current( explode( ';', $value, 1 ) ), $pair );
                $_COOKIE[ LOGGED_IN_COOKIE ] = $pair[ LOGGED_IN_COOKIE ];
                break;
            }
        }

        $response = apply_filters(
            'dokan_ajax_login_user_response', [
                'message' => esc_html__( 'User logged in successfully.', 'dokan-lite' ),
            ]
        );

        wp_send_json_success( $response );
    }

    /**
     * Export witdraw requests
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function withdraw_export_csv() {
        check_ajax_referer( 'dokan_admin', 'nonce' );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        if ( empty( $_POST['id'] ) ) {
            wp_send_json_error( __( 'id param is required', 'dokan-lite' ), 400 );
        }

        $ids = explode( ',', sanitize_text_field( wp_unslash( $_POST['id'] ) ) );

        $args = [
            'ids'    => $ids,
            'method' => 'paypal',
        ];

        $args = apply_filters( 'dokan_withdraw_export_csv_args', $args );

        dokan()->withdraw->export( $args )->csv();
    }

    /**
     * Dismiss the Dokan upgrade notice.
     *
     * @since 3.1
     *
     * @return void
     */
    public function dismiss_pro_notice() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        update_option( 'dokan_hide_pro_nag', 'hide' );

        wp_send_json_success();
    }
}
