<?php

namespace WeDevs\Dokan\Admin;

use WeDevs\Dokan\Product\Hooks as ProductHooks;
use WP_Post;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Admin Hooks
 *
 * @since   3.0.0
 *
 * @package dokan
 */
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        // Load all actions
        add_action( 'pending_to_publish', [ $this, 'send_notification_on_product_publish' ] );
        add_action( 'add_meta_boxes', [ $this, 'add_seller_meta_box' ] );
        add_action( 'woocommerce_process_product_meta', [ $this, 'override_product_author_by_admin' ], 12, 2 );

        // Load all filters
        add_filter( 'post_types_to_delete_with_user', [ $this, 'add_wc_post_types_to_delete_user' ], 10, 2 );
        add_filter( 'dokan_save_settings_value', [ $this, 'update_pages' ], 10, 2 );

        // Ajax hooks
        add_action( 'wp_ajax_dokan_product_search_author', [ $this, 'search_vendors' ] );

        add_action( 'woocommerce_product_bulk_edit_end', [ $this, 'add_product_commission_bulk_edit_field' ] );
        add_action( 'woocommerce_product_bulk_edit_save', [ $this, 'save_custom_bulk_edit_field' ], 10, 1 );

        // Downloadable files a vendor submitted for approval
        add_action( 'woocommerce_product_options_general_product_data', [ $this, 'render_pending_downloadable_files' ], 99 );
        add_action( 'admin_notices', [ $this, 'pending_downloadable_files_notice' ] );
    }

    /**
     * Send notification to the seller once a product is published from pending
     *
     * @param WP_Post $post
     *
     * @return void
     */
    public function send_notification_on_product_publish( $post ) {
        if ( $post->post_type !== 'product' ) {
            return;
        }

        $seller = get_user_by( 'id', $post->post_author );

        do_action( 'dokan_pending_product_published_notification', $post, $seller );
    }

    /**
     * Remove default author metabox and added new one for dokan seller
     *
     * @since  1.0.0
     *
     * @return void
     */
    public function add_seller_meta_box() {
        remove_meta_box( 'authordiv', 'product', 'core' );
        add_meta_box( 'sellerdiv', __( 'Vendor', 'dokan-lite' ), [ self::class, 'seller_meta_box_content' ], 'product', 'normal', 'core' );
    }

    /**
     * Display form field with list of authors.
     *
     * @since 2.5.3
     *
     * @param object $post
     */
    public static function seller_meta_box_content( $post ) {
        $selected = empty( $post->ID ) ? get_current_user_id() : $post->post_author;

        $user = dokan()->vendor->get( $selected );

        $user = [
            [
                'id'   => $selected,
                'text' => ! empty( $user->get_shop_name() ) ? $user->get_shop_name() : $user->get_name(),
            ],
        ];
        ?>

        <select
            style="width: 40%;"
            class="dokan_product_author_override"
            name="dokan_product_author_override"
            data-placeholder="<?php esc_attr_e( 'Select vendor', 'dokan-lite' ); ?>"
            data-action="dokan_product_search_author"
            data-close_on_select="true"
            data-minimum_input_length="0"
            data-data="<?php echo esc_attr( wp_json_encode( $user ) ); ?>"
        >
        </select> <?php echo wp_kses( wc_help_tip( esc_html__( 'You can search vendors and assign them.', 'dokan-lite' ) ), wp_kses_allowed_html( 'user_description' ) ); ?>
        <?php
    }

    /**
     * Ajax method to search vendors
     *
     * @since 3.7.1
     *
     * @return void
     */
    public function search_vendors() {
        if ( ! current_user_can( 'manage_woocommerce' ) || empty( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'dokan_admin_product' ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Unauthorized operation', 'dokan-lite' ) ], 403 );
        }

        $vendors = [];
        $results = [];
        $args    = [
            'number'   => 20,
            'status'   => [ 'all' ],
            'role__in' => [ 'seller', 'administrator', 'shop_manager' ],
        ];

        if ( ! empty( $_GET['s'] ) ) {
            $s = sanitize_text_field( wp_unslash( $_GET['s'] ) );

            $args['search']         = '*' . $s . '*';
            $args['number']         = 35;
            $args['search_columns'] = [ 'user_login', 'user_email', 'display_name', 'user_nicename' ];
        }

        $results = dokan()->vendor->all( $args );

        if ( ! count( $results ) && ! empty( $_GET['s'] ) ) {
            unset( $args['search'] );
            unset( $args['search_columns'] );

            $args['meta_query'] = [ // phpcs:ignore
                [
                    'key'     => 'dokan_store_name',
                    'value'   => sanitize_text_field( wp_unslash( $_GET['s'] ) ) ?? '',
                    'compare' => 'LIKE',
                ],
            ];

            $results = dokan()->vendor->get_vendors( $args );
        }

        if ( ! empty( $results ) ) {
            foreach ( $results as $vendor ) {
                $vendors[] = [
                    'id'     => $vendor->get_id(),
                    'text'   => ! empty( $vendor->get_shop_name() ) ? $vendor->get_shop_name() : $vendor->get_name(),
                    'avatar' => $vendor->get_avatar(),
                ];
            }
        }

        wp_send_json_success( [ 'vendors' => $vendors ] );
    }

    /**
     * Override product vendor ID from admin panel
     *
     * @since 2.6.2
     *
     * @return void
     */
    public function override_product_author_by_admin( $product_id ) {
        $product          = wc_get_product( $product_id );
        $posted_vendor_id = ! empty( $_POST['dokan_product_author_override'] ) ? (int) sanitize_key( wp_unslash( $_POST['dokan_product_author_override'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing

        if ( ! $posted_vendor_id ) {
            return;
        }

        $vendor = dokan_get_vendor_by_product( $product );

        if ( ! $vendor ) {
            return;
        }

        if ( $posted_vendor_id === $vendor->get_id() ) {
            return;
        }

        dokan_override_product_author( $product, $posted_vendor_id );
    }

    /**
     * Assign vendor for deleted post types
     *
     * @param array   $post_types
     * @param integer $user_id
     *
     * @return array
     */
    public function add_wc_post_types_to_delete_user( $post_types, $user_id ) {
        if ( ! dokan_is_user_seller( $user_id ) ) {
            return $post_types;
        }

        $wc_post_types = [ 'product', 'product_variation', 'shop_order', 'shop_coupon' ];

        return array_merge( $post_types, $wc_post_types );
    }

    /**
     * Dokan update pages
     *
     * @param array $value
     * @param array $name
     *
     * @return array
     */
    public function update_pages( $value, $name ) {
        if ( 'dokan_pages' !== $name ) {
            return $value;
        }

        $current_settings = get_option( $name, [] );
        $current_settings = is_array( $current_settings ) ? $current_settings : [];
        $value            = is_array( $value ) ? $value : [];

        return array_replace_recursive( $current_settings, $value );
    }

    /**
     * Add commission settings in bulk product edit.
     *
     * @since 3.14.2
     *
     * @return void
     */
    public function add_product_commission_bulk_edit_field() {
        dokan_get_template_part( 'products/dokan-products-edit-bulk-commission', '', [] );
    }

    /**
     * Save commission settings from bulk product edit
     *
     * @since 3.14.2
     *
     * @param \WC_Product $product
     *
     * @return void
     */
    public function save_custom_bulk_edit_field( $product ) {
        $excluded_product_types              = apply_filters( 'dokan_excluded_product_types_for_bulk_edit', [ 'product_pack', 'external', 'grouped' ] );
        $dokan_advertisement_product_id      = intval( get_option( 'dokan_advertisement_product_id', '' ) );
        $dokan_reverse_withdrawal_product_id = intval( get_option( 'dokan_reverse_withdrawal_product_id', '' ) );
        $product_id                          = $product->get_id();

        if (
            ! current_user_can( 'manage_woocommerce' ) ||
            in_array( $product->get_type(), $excluded_product_types, true ) ||
            $product_id === $dokan_advertisement_product_id ||
            $product_id === $dokan_reverse_withdrawal_product_id
        ) {
            return;
        }

        if ( ! isset( $_REQUEST['dokan_override_bulk_product_commission'] ) || intval( sanitize_text_field( $_REQUEST['dokan_override_bulk_product_commission'] ) ) !== 1 ) { // phpcs:ignore
            return;
        }

        ProductHooks::save_per_product_commission_options( $product->get_id(), $_REQUEST ); // phpcs:ignore
    }

    /**
     * Show the downloadable files a vendor submitted for approval below the live files.
     *
     * The WooCommerce product data panel lists the approved files that customers
     * currently hold; the pending replacement is rendered read-only underneath so the
     * admin can review what publishing will deliver.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_pending_downloadable_files() {
        $post = get_post();

        if ( ! $post instanceof WP_Post || 'product' !== $post->post_type ) {
            return;
        }

        $staged = $this->collect_staged_downloadable_files( $post->ID );

        if ( ! $staged ) {
            return;
        }
        ?>
        <div class="options_group dokan-pending-downloadable-files">
            <p class="form-field">
                <label><?php esc_html_e( 'Awaiting approval', 'dokan-lite' ); ?></label>
                <span class="description">
                    <strong><?php esc_html_e( 'This pending update carries downloadable changes that have not been delivered yet.', 'dokan-lite' ); ?></strong><br>
                    <?php esc_html_e( 'Customers who already purchased keep the files listed above until you publish this product; publishing delivers the changes below to them.', 'dokan-lite' ); ?>
                </span>
            </p>
            <?php foreach ( $staged as $entry ) : ?>
                <p class="form-field">
                    <label><?php echo esc_html( $entry['label'] ); ?></label>
                    <span class="description">
                        <?php if ( $entry['submitted_by'] ) : ?>
                            <em>
                                <?php
                                printf(
                                    /* translators: %s: display name of the user who submitted the pending files. */
                                    esc_html__( 'Submitted by %s', 'dokan-lite' ),
                                    esc_html( $entry['submitted_by'] )
                                );
                                ?>
                            </em><br>
                        <?php endif; ?>
                        <?php if ( 'no' === $entry['flag'] ) : ?>
                            <?php esc_html_e( 'Downloads are being switched off for this product. Publishing will revoke the downloads of existing customers.', 'dokan-lite' ); ?><br>
                        <?php elseif ( 'yes' === $entry['flag'] ) : ?>
                            <?php esc_html_e( 'Downloads are being switched back on for this product.', 'dokan-lite' ); ?><br>
                        <?php endif; ?>
                        <?php if ( is_array( $entry['files'] ) && empty( $entry['files'] ) ) : ?>
                            <?php esc_html_e( 'All downloadable files were removed. Publishing will revoke the downloads of existing customers.', 'dokan-lite' ); ?>
                        <?php elseif ( is_array( $entry['files'] ) ) : ?>
                            <?php foreach ( $entry['files'] as $file ) : ?>
                                <?php
                                $file_url = isset( $file['file'] ) ? $file['file'] : '';
                                // The real filename leads, not the vendor's label. The label is a
                                // free-text field the media picker never rewrites (WooCommerce
                                // behaves the same way), so after a file swap it still reads as the
                                // previous file - and an administrator would be reviewing a name
                                // that does not belong to the file they are about to approve.
                                $real_name  = wc_get_filename_from_url( $file_url );
                                $shown_name = isset( $file['name'] ) ? $file['name'] : '';
                                ?>
                                <strong><?php echo esc_html( $real_name ? $real_name : $file_url ); ?></strong>
                                <?php if ( '' !== $shown_name && $shown_name !== $real_name ) : ?>
                                    <?php
                                    printf(
                                        /* translators: %s: the label shown to customers for this download. */
                                        esc_html__( '(shown to customers as "%s")', 'dokan-lite' ),
                                        esc_html( $shown_name )
                                    );
                                    ?>
                                <?php endif; ?>
                                <br>
                                <a href="<?php echo esc_url( $file_url ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $file_url ); ?></a><br>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </span>
                </p>
            <?php endforeach; ?>
            <p class="form-field">
                <label>&nbsp;</label>
                <span class="description">
                    <button type="submit" name="dokan_discard_pending_downloads" value="1" class="button">
                        <?php esc_html_e( 'Discard pending files', 'dokan-lite' ); ?>
                    </button><br>
                    <?php esc_html_e( 'Rejects the changes above and keeps the currently approved files. The product itself is saved as usual.', 'dokan-lite' ); ?>
                </span>
            </p>
        </div>
        <?php
    }

    /**
     * Warn the admin on the product edit screen when replacement files await approval.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function pending_downloadable_files_notice() {
        $screen = get_current_screen();
        $post   = get_post();

        if ( ! $screen || 'product' !== $screen->id || ! $post instanceof WP_Post || 'product' !== $post->post_type ) {
            return;
        }

        if ( ! $this->collect_staged_downloadable_files( $post->ID ) ) {
            return;
        }
        ?>
        <div class="notice notice-warning">
            <p><?php esc_html_e( 'This product has replacement downloadable files awaiting your approval. Existing customers keep the currently approved files until you publish; review the pending files under General → Downloadable files before publishing.', 'dokan-lite' ); ?></p>
        </div>
        <?php
    }

    /**
     * Collect the staged downloadable file sets of a product and its variations.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product ID.
     *
     * @return array<int, array{id:int, label:string, files:array|null, flag:string|null, submitted_by:string}>
     */
    protected function collect_staged_downloadable_files( $product_id ) {
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return [];
        }

        $ids = [ $product_id ];

        if ( $product->is_type( 'variable' ) ) {
            $ids = array_merge( $ids, array_map( 'absint', $product->get_children() ) );
        }

        $entries = [];

        foreach ( $ids as $id ) {
            $files = dokan_get_staged_downloadable_files( $id );
            $flag  = dokan_get_staged_downloadable_flag( $id );

            if ( null === $files && null === $flag ) {
                continue;
            }

            $author = (int) get_post_meta( $id, '_dokan_pending_downloadable_files_author', true );
            $user   = $author ? get_userdata( $author ) : false;

            $entries[] = [
                'id'           => $id,
                'files'        => $files,
                'flag'         => $flag,
                'submitted_by' => $user ? $user->display_name : '',
                'label'        => $id === $product_id
                    ? __( 'Pending files', 'dokan-lite' )
                    /* translators: %s: variation name. */
                    : sprintf( __( 'Pending files — %s', 'dokan-lite' ), wc_get_product( $id ) ? wc_get_product( $id )->get_name() : $id ),
            ];
        }

        return $entries;
    }
}
