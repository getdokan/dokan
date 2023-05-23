<?php
namespace WeDevs\Dokan\Admin;

/**
* Admin Hooks
*
* @package dokan
*
* @since 3.0.0
*/
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        // Load all actions
        add_action( 'manage_shop_order_posts_custom_column', [ $this, 'shop_order_custom_columns' ], 11 );
        add_action( 'admin_footer-edit.php', [ $this, 'admin_shop_order_scripts' ] );
        add_action( 'wp_trash_post', [ $this, 'admin_on_trash_order' ] );
        add_action( 'untrash_post', [ $this, 'admin_on_untrash_order' ] );
        add_action( 'delete_post', [ $this, 'admin_on_delete_order' ] );
        add_action( 'restrict_manage_posts', [ $this, 'admin_shop_order_toggle_sub_orders' ] );
        add_action( 'pending_to_publish', [ $this, 'send_notification_on_product_publish' ] );
        add_action( 'add_meta_boxes', [ $this, 'add_seller_meta_box' ] );
        add_action( 'woocommerce_process_product_meta', [ $this, 'override_product_author_by_admin' ], 12, 2 );

        // Load all filters
        add_filter( 'woocommerce_reports_get_order_report_query', [ $this, 'admin_order_reports_remove_parents' ] );
        add_filter( 'manage_edit-shop_order_columns', [ $this, 'admin_shop_order_edit_columns' ], 11 );
        add_filter( 'post_class', [ $this, 'admin_shop_order_row_classes' ], 10, 2 );
        add_filter( 'post_types_to_delete_with_user', [ $this, 'add_wc_post_types_to_delete_user' ], 10, 2 );
        add_filter( 'dokan_save_settings_value', [ $this, 'update_pages' ], 10, 2 );

        // Ajax hooks
        add_action( 'wp_ajax_dokan_product_search_author', [ $this, 'search_vendors' ] );
    }

    /**
     * Remove child orders from WC reports
     *
     * @param array $query
     *
     * @return array
     */
    public function admin_order_reports_remove_parents( $query ) {
        $query['where'] .= ' AND posts.post_parent = 0';

        return $query;
    }

    /**
     * Change the columns shown in admin.
     *
     * @param array $existing_columns
     *
     * @return array
     */
    public function admin_shop_order_edit_columns( $existing_columns ) {
        if ( WC_VERSION > '3.2.6' ) {
            unset( $existing_columns['wc_actions'] );

            $columns = array_slice( $existing_columns, 0, count( $existing_columns ), true ) +
                array(
                    'seller'     => __( 'Vendor', 'dokan-lite' ),
                    'wc_actions' => __( 'Actions', 'dokan-lite' ),
                    'suborder'   => __( 'Sub Order', 'dokan-lite' ),
                )
                + array_slice( $existing_columns, count( $existing_columns ), count( $existing_columns ) - 1, true );
        } else {
            $existing_columns['seller']    = __( 'Vendor', 'dokan-lite' );
            $existing_columns['suborder']  = __( 'Sub Order', 'dokan-lite' );
        }

        if ( WC_VERSION > '3.2.6' ) {
            // Remove seller, suborder column if seller is viewing his own product
            if ( ! current_user_can( 'manage_woocommerce' ) || ( ! empty( $_GET['author'] ) ) ) { // phpcs:ignore
                unset( $columns['suborder'] );
                unset( $columns['seller'] );
            }

            return apply_filters( 'dokan_edit_shop_order_columns', $columns );
        }

        // Remove seller, suborder column if seller is viewing his own product
        if ( ! current_user_can( 'manage_woocommerce' ) || ( ! empty( $_GET['author'] ) ) ) { // phpcs:ignore
            unset( $existing_columns['suborder'] );
            unset( $existing_columns['seller'] );
        }

        return apply_filters( 'dokan_edit_shop_order_columns', $existing_columns );
    }

    /**
     * Adds custom column on dokan admin shop order table
     *
     * @param string $col
     *
     * @return void
     */
    public function shop_order_custom_columns( $col ) {
        /**
         * @global \WP_Post $post
         * @global \WC_Order $the_order
         */
        global $post, $the_order;

        if ( empty( $the_order ) || $the_order->get_id() !== $post->ID ) {
            $the_order = new \WC_Order( $post->ID );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( ! in_array( $col, [ 'order_number', 'suborder', 'seller' ], true ) ) {
            return;
        }

        $output = '';
        switch ( $col ) {
            case 'order_number':
                if ( $post->post_parent !== 0 ) {
                    $output = '<strong>';
                    $output .= esc_html__( '&nbsp;Sub Order of', 'dokan-lite' );
                    $output .= sprintf( ' <a href="%s">#%s</a>', esc_url( admin_url( 'post.php?action=edit&post=' . $post->post_parent ) ), esc_html( $post->post_parent ) );
                    $output .= '</strong>';
                }
                break;

            case 'suborder':
                if ( '1' === $the_order->get_meta( 'has_sub_order', true ) ) {
                    $output = sprintf( '<a href="#" class="show-sub-orders" data-class="parent-%1$d" data-show="%2$s" data-hide="%3$s">%2$s</a>', esc_attr( $post->ID ), esc_attr__( 'Show Sub-Orders', 'dokan-lite' ), esc_attr__( 'Hide Sub-Orders', 'dokan-lite' ) );
                }
                break;

            case 'seller':
                $has_sub = $the_order->get_meta( 'has_sub_order', true );
                $seller  = get_user_by( 'id', dokan_get_seller_id_by_order( $post->ID ) );

                if ( $has_sub !== '1' && $seller ) {
                    $output = sprintf( '<a href="%s">%s</a>', esc_url( admin_url( 'edit.php?post_type=shop_order&vendor_id=' . $seller->ID ) ), esc_html( $seller->display_name ) );
                } else {
                    $output = esc_html__( '(no name)', 'dokan-lite' );
                }

                break;
        }

        if ( ! empty( $output ) ) {
            echo apply_filters( "dokan_manage_shop_order_custom_columns_{$col}", $output, $the_order );
        }
    }

    /**
     * Adds css classes on admin shop order table
     *
     * @global \WP_Post $post
     *
     * @param array $classes
     * @param int $post_id
     *
     * @return array
     */
    public function admin_shop_order_row_classes( $classes, $post_id ) {
        global $post;

        if ( is_search() || ! current_user_can( 'manage_woocommerce' ) ) {
            return $classes;
        }

        $vendor_id = isset( $_GET['vendor_id'] ) ? absint( wp_unslash( $_GET['vendor_id'] ) ) : 0; // phpcs:ignore

        if ( $vendor_id ) {
            return $classes;
        }

        if ( $post->post_type === 'shop_order' && $post->post_parent !== 0 ) {
            $classes[] = 'sub-order parent-' . $post->post_parent;
        }

        return $classes;
    }

    /**
     * Show/hide sub order css/js
     *
     * @return void
     */
    public function admin_shop_order_scripts() {
        ?>
        <script type="text/javascript">
        jQuery(function($) {
            $('tr.sub-order').hide();

            $('a.show-sub-orders').on('click', function(e) {
                e.preventDefault();

                var $self = $(this),
                    el = $('tr.' + $self.data('class') );

                if ( el.is(':hidden') ) {
                    el.show();
                    $self.text( $self.data('hide') );
                } else {
                    el.hide();
                    $self.text( $self.data('show') );
                }
            });

            $('button.toggle-sub-orders').on('click', function(e) {
                e.preventDefault();

                $('tr.sub-order').toggle();
            });
        });
        </script>

        <style type="text/css">
            tr.sub-order {
                background: #ECFFF2;
            }

            th#order_number {
                width: 21ch;
            }

            th#order_date {
                width: 9ch;
            }

            th#order_status {
                width: 12ch;
            }

            th#shipping_address {
                width: 18ch;
            }

            th#wc_actions {
                width: 9ch;
            }

            th#seller {
                width: 6ch;
            }

            th#suborder {
                width: 9ch;
            }
        </style>
        <?php
    }

    /**
     * Delete sub orders when parent order is trashed
     *
     * @param int $post_id
     */
    public function admin_on_trash_order( $post_id ) {
        $post = get_post( $post_id );

        if ( 'shop_order' === $post->post_type && 0 === $post->post_parent ) {
            $sub_orders = get_children(
                array(
					'post_parent' => $post_id,
					'post_type'   => 'shop_order',
                )
            );

            if ( $sub_orders ) {
                foreach ( $sub_orders as $order_post ) {
                    wp_trash_post( $order_post->ID );
                }
            }
        }
    }

    /**
     * Un-trash sub orders when parent orders are un-trashed
     *
     * @param int $post_id
     */
    public function admin_on_untrash_order( $post_id ) {
        $post = get_post( $post_id );

        if ( 'shop_order' === $post->post_type && 0 === $post->post_parent ) {
            global $wpdb;

            $suborder_ids = $wpdb->get_col(
                $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'shop_order'", $post_id )
            );

            if ( $suborder_ids ) {
                foreach ( $suborder_ids as $suborder_id ) {
                    wp_untrash_post( $suborder_id );
                }
            }
        }
    }

    /**
     * Delete sub orders and from dokan sync table when a order is deleted
     *
     * @param int $post_id
     */
    public function admin_on_delete_order( $post_id ) {
        $post = get_post( $post_id );

        if ( 'shop_order' === $post->post_type ) {
            dokan_delete_sync_order( $post_id );

            $sub_orders = get_children(
                array(
					'post_parent' => $post_id,
					'post_type'   => 'shop_order',
                )
            );

            if ( $sub_orders ) {
                foreach ( $sub_orders as $order_post ) {
                    wp_delete_post( $order_post->ID );
                }
            }
        }
    }

    /**
     * Show a toggle button to toggle all the sub orders
     *
     * @global \WP_Query $wp_query
     */
    public function admin_shop_order_toggle_sub_orders() {
        global $wp_query;

        if ( isset( $wp_query->query['post_type'] ) && 'shop_order' === $wp_query->query['post_type'] ) {
            echo '<button class="toggle-sub-orders button">' . esc_html__( 'Toggle Sub-orders', 'dokan-lite' ) . '</button>';
        }
    }

    /**
     * Send notification to the seller once a product is published from pending
     *
     * @param \WP_Post $post
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
                'id'       => $selected,
                'text'     => ! empty( $user->get_shop_name() ) ? $user->get_shop_name() : $user->get_name(),
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
            data-data='<?php echo wp_json_encode( $user ); ?>'
        >
        </select> <?php echo wc_help_tip( __( 'You can search vendors and assign them.', 'dokan-lite' ) ); ?>
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
            'role__in' => [ 'seller', 'administrator' ],
        ];

        if ( ! empty( $_GET['s'] ) ) {
            $s = sanitize_text_field( wp_unslash( $_GET['s'] ) );

            $args['search'] = '*' . $s . '*';
            $args['number'] = 35;
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
    public function override_product_author_by_admin( $product_id, $post ) {
        $product          = wc_get_product( $product_id );
        $posted_vendor_id = ! empty( $_POST['dokan_product_author_override'] ) ? intval( wp_unslash( $_POST['dokan_product_author_override'] ) ) : 0; // phpcs:ignore

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
     * @param array $post_types
     * @param integer $user_id
     *
     * @return array
     */
    public function add_wc_post_types_to_delete_user( $post_types, $user_id ) {
        if ( ! dokan_is_user_seller( $user_id ) ) {
            return $post_types;
        }

        $wc_post_types = array( 'product', 'product_variation', 'shop_order', 'shop_coupon' );

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

        $current_settings = get_option( $name, array() );
        $current_settings = is_array( $current_settings ) ? $current_settings : array();
        $value            = is_array( $value ) ? $value : array();

        return array_replace_recursive( $current_settings, $value );
    }
}
