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
            if ( ! current_user_can( 'manage_woocommerce' ) || ( isset( $_GET['author'] ) && ! empty( $_GET['author'] ) ) ) {
                unset( $columns['suborder'] );
                unset( $columns['seller'] );
            }

            return apply_filters( 'dokan_edit_shop_order_columns', $columns );
        }

        // Remove seller, suborder column if seller is viewing his own product
        if ( ! current_user_can( 'manage_woocommerce' ) || ( isset( $_GET['author'] ) && ! empty( $_GET['author'] ) ) ) {
            unset( $existing_columns['suborder'] );
            unset( $existing_columns['seller'] );
        }

        return apply_filters( 'dokan_edit_shop_order_columns', $existing_columns );
    }

    /**
     * Adds custom column on dokan admin shop order table
     *
     * @global type $post
     * @global type $woocommerce
     * @global \WC_Order $the_order
     *
     * @param type $col
     *
     * @return void
     */
    public function shop_order_custom_columns( $col ) {
        global $post, $the_order;

        if ( empty( $the_order ) || $the_order->get_id() != $post->ID ) {
            $the_order = new \WC_Order( $post->ID );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return $col;
        }

        switch ( $col ) {
            case 'order_number':
                if ( $post->post_parent !== 0 ) {
                    echo '<strong>';
                    echo esc_html__( '&nbsp;Sub Order of', 'dokan-lite' );
                    printf( ' <a href="%s">#%s</a>', esc_url( admin_url( 'post.php?action=edit&post=' . $post->post_parent ) ), esc_html( $post->post_parent ) );
                    echo '</strong>';
                }
                break;

            case 'suborder':
                $has_sub = get_post_meta( $post->ID, 'has_sub_order', true );

                if ( $has_sub == '1' ) {
                    printf( '<a href="#" class="show-sub-orders" data-class="parent-%1$d" data-show="%2$s" data-hide="%3$s">%2$s</a>', esc_attr( $post->ID ), esc_attr__( 'Show Sub-Orders', 'dokan-lite' ), esc_attr__( 'Hide Sub-Orders', 'dokan-lite' ) );
                }
                break;

            case 'seller':
                $has_sub = get_post_meta( $post->ID, 'has_sub_order', true );

                if ( $has_sub != '1' && $seller = get_user_by( 'id', dokan_get_seller_id_by_order( $post->ID ) ) ) {
                    printf( '<a href="%s">%s</a>', esc_url( admin_url( 'edit.php?post_type=shop_order&vendor_id=' . $seller->ID ) ), esc_html( $seller->display_name ) );
                } else {
                    esc_html_e( '(no name)', 'dokan-lite' );
                }

                break;
        }
    }

    /**
     * Adds css classes on admin shop order table
     *
     * @global WP_Post $post
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

        $vendor_id = isset( $_GET['vendor_id'] ) ? sanitize_text_field( wp_unslash( $_GET['vendor_id'] ) ) : '';

        if ( $vendor_id ) {
            return $classes;
        }

        if ( $post->post_type == 'shop_order' && $post->post_parent != 0 ) {
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

        if ( 'shop_order' == $post->post_type && 0 == $post->post_parent ) {
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
     * Untrash sub orders when parent orders are untrashed
     *
     * @param int $post_id
     */
    public function admin_on_untrash_order( $post_id ) {
        $post = get_post( $post_id );

        if ( 'shop_order' == $post->post_type && 0 == $post->post_parent ) {
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

        if ( 'shop_order' == $post->post_type ) {
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
     * @global WP_Query $wp_query
     */
    public function admin_shop_order_toggle_sub_orders() {
        global $wp_query;

        if ( isset( $wp_query->query['post_type'] ) && 'shop_order' == $wp_query->query['post_type'] ) {
            echo '<button class="toggle-sub-orders button">' . esc_html__( 'Toggle Sub-orders', 'dokan-lite' ) . '</button>';
        }
    }

    /**
     * Send notification to the seller once a product is published from pending
     *
     * @param WP_Post $post
     * @return void
     */
    public function send_notification_on_product_publish( $post ) {
        if ( $post->post_type != 'product' ) {
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
        global $user_ID;

        $admin_user = get_user_by( 'id', $user_ID );
        $selected   = empty( $post->ID ) ? $user_ID : $post->post_author;
        $vendors = dokan()->vendor->all(
            [
				'number' => -1,
				'role__in' => [ 'seller' ],
			]
        );
        ?>
        <label class="screen-reader-text" for="dokan_product_author_override"><?php esc_html_e( 'Vendor', 'dokan-lite' ); ?></label>
        <select name="dokan_product_author_override" id="dokan_product_author_override" class="">
            <?php if ( empty( $vendors ) ) : ?>
                <option value="<?php echo esc_attr( $admin_user->ID ); ?>"><?php echo esc_html( $admin_user->display_name ); ?></option>
            <?php else : ?>
                <option value="<?php echo esc_attr( $user_ID ); ?>" <?php selected( $selected, $user_ID ); ?>><?php echo esc_html( $admin_user->display_name ); ?></option>
                <?php foreach ( $vendors as $key => $vendor ) : ?>
                    <option value="<?php echo esc_attr( $vendor->get_id() ); ?>" <?php selected( $selected, $vendor->get_id() ); ?>><?php echo ! empty( $vendor->get_shop_name() ) ? esc_html( $vendor->get_shop_name() ) : esc_html( $vendor->get_name() ); ?></option>
                <?php endforeach ?>
            <?php endif ?>
        </select>
         <?php
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
        $posted_vendor_id = ! empty( $_POST['dokan_product_author_override'] ) ? intval( $_POST['dokan_product_author_override'] ) : 0; // WPCS: CSRF ok.

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
