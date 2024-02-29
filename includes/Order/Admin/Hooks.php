<?php

namespace WeDevs\Dokan\Order\Admin;

use Exception;
use WC_Data_Store;
use WC_Order;
use WeDevs\Dokan\Utilities\OrderUtil;
use WP_Post;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order admin related hooks
 *
 * @since 3.8.0 moved functionality from includes/Admin/Hooks.php file
 */
class Hooks {
    /**
     * Class constructor
     *
     * @since 3.8.0
     */
    public function __construct() {
        // Load all actions and filters
        if ( OrderUtil::is_hpos_enabled() ) {
            // hpos equivalent hooks for `manage_shop_order_posts_custom_column`
            add_action( 'manage_woocommerce_page_wc-orders_custom_column', [ $this, 'shop_order_custom_columns' ], 11, 2 );
            // hpos equivalent hooks for admin_footer-edit.php
            add_action( 'admin_footer-woocommerce_page_wc-orders', [ $this, 'admin_shop_order_scripts' ] );
            // hpos equivalent hooks for restrict_manage_posts
            add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'admin_shop_order_toggle_sub_orders' ], 10, 1 );
            // hpos equivalent hooks for manage_edit-shop_order_columns
            add_filter( 'manage_woocommerce_page_wc-orders_columns', [ $this, 'admin_shop_order_edit_columns' ], 11 );

            add_action( 'woocommerce_trash_order', [ $this, 'admin_on_trash_order' ] );
            add_action( 'woocommerce_untrash_order', [ $this, 'admin_on_untrash_order' ] );
            add_action( 'woocommerce_delete_order', [ $this, 'admin_on_delete_order' ] );
        } else {
            add_action( 'manage_shop_order_posts_custom_column', [ $this, 'shop_order_custom_columns' ], 11, 2 );
            add_action( 'admin_footer-edit.php', [ $this, 'admin_shop_order_scripts' ] );
            add_action( 'restrict_manage_posts', [ $this, 'admin_shop_order_toggle_sub_orders' ], 10, 1 );
            add_filter( 'manage_edit-shop_order_columns', [ $this, 'admin_shop_order_edit_columns' ], 11 );

            add_action( 'wp_trash_post', [ $this, 'admin_on_trash_order' ] );
            add_action( 'untrash_post', [ $this, 'admin_on_untrash_order' ] );
            add_action( 'delete_post', [ $this, 'admin_on_delete_order_post' ] );
        }

        // Change order meta key and value.
        add_filter( 'woocommerce_order_item_display_meta_key', [ $this, 'change_order_item_display_meta_key' ] );
        add_filter( 'woocommerce_order_item_display_meta_value', [ $this, 'change_order_item_display_meta_value' ], 10, 2 );
        add_filter( 'woocommerce_reports_get_order_report_query', [ $this, 'admin_order_reports_remove_parents' ] );
        add_filter( 'post_class', [ $this, 'admin_shop_order_row_classes' ], 10, 3 );
    }

    /**
     * Remove child orders from WC reports
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
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
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param array $existing_columns
     *
     * @return array
     */
    public function admin_shop_order_edit_columns( $existing_columns ) {
        // Remove seller, suborder column if seller is viewing his own product
        if ( ! current_user_can( 'manage_woocommerce' ) || ( ! empty( $_GET['author'] ) ) ) { // phpcs:ignore
            return $existing_columns;
        }

        $column_to_insert = [
            'seller'     => __( 'Vendor', 'dokan-lite' ),
            'wc_actions' => __( 'Actions', 'dokan-lite' ),
            'suborder'   => __( 'Sub Order', 'dokan-lite' ),
        ];
        $columns          = dokan_array_insert_after( $existing_columns, $column_to_insert );

        return apply_filters( 'dokan_edit_shop_order_columns', $columns );
    }

    /**
     * Adds custom column on dokan admin shop order table
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param string       $col
     * @param int|WC_Order $post_id
     *
     * @return void
     */
    public function shop_order_custom_columns( $col, $post_id ) {
        // return if user doesn't have access
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // check if post_id is a order
        if ( ! OrderUtil::is_order( $post_id ) ) {
            return;
        }

        if ( ! in_array( $col, [ 'order_number', 'suborder', 'seller' ], true ) ) {
            return;
        }

        $order  = wc_get_order( $post_id );
        $output = '';
        switch ( $col ) {
            case 'order_number':
                if ( $order->get_parent_id() !== 0 ) {
                    $output = '<strong>';
                    $output .= esc_html__( '&nbsp;Sub Order of', 'dokan-lite' );
                    $output .= sprintf( ' <a href="%s">#%s</a>', esc_url( OrderUtil::get_admin_order_edit_url( $order->get_parent_id() ) ), esc_html( $order->get_parent_id() ) );
                    $output .= '</strong>';
                }
                break;

            case 'suborder':
                if ( '1' === $order->get_meta( 'has_sub_order', true ) ) {
                    $output = sprintf( '<button type="button" href="#" class="show-sub-orders button" data-class="parent-%1$d" data-show="%2$s" data-hide="%3$s">%2$s</button>', esc_attr( $order->get_id() ), esc_attr__( 'Show Sub-Orders', 'dokan-lite' ), esc_attr__( 'Hide Sub-Orders', 'dokan-lite' ) );
                } elseif ( OrderUtil::is_hpos_enabled() && 0 !== $order->get_parent_id() ) {
                    $output = sprintf( '<span style="display:block;" class="sub-order parent-%s">&nbsp;</span>', $order->get_parent_id() );
                }
                break;

            case 'seller':
                $has_sub = $order->get_meta( 'has_sub_order', true );
                $seller  = get_user_by( 'id', dokan_get_seller_id_by_order( $order->get_id() ) );

                if ( $has_sub !== '1' && $seller ) {
                    $output = sprintf( '<a href="%s">%s</a>', esc_url( OrderUtil::get_admin_order_list_url() . '&vendor_id=' . $seller->ID ), esc_html( $seller->display_name ) );
                } else {
                    $output = esc_html__( '(no name)', 'dokan-lite' );
                }

                break;
        }

        if ( ! empty( $output ) ) {
            echo apply_filters( "dokan_manage_shop_order_custom_columns_{$col}", $output, $order );
        }
    }

    /**
     * Adds css classes on admin shop order table
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param string[] $classes An array of post class names.
     * @param string[] $class   An array of additional class names added to the post.
     * @param int      $post_id The post ID.
     *
     * @global WP_Post $post
     *
     * @return array
     */
    public function admin_shop_order_row_classes( $classes, $class, $post_id ) {
        if ( ! OrderUtil::is_order( $post_id ) ) {
            return $classes;
        }

        if ( ! is_admin() || ! current_user_can( 'manage_woocommerce' ) ) {
            return $classes;
        }

        $vendor_id = isset( $_GET['vendor_id'] ) ? absint( wp_unslash( $_GET['vendor_id'] ) ) : 0; // phpcs:ignore
        if ( $vendor_id ) {
            return $classes;
        }

        $order = wc_get_order( $post_id );
        if ( ! $order ) {
            return $classes;
        }

        if ( $order->get_parent_id() !== 0 ) {
            $classes[] = 'sub-order parent-' . $order->get_parent_id();
        }

        return $classes;
    }

    /**
     * Show/hide sub order css/js
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Added HPOS support
     *
     * @return void
     */
    public function admin_shop_order_scripts() {
        $current_screen = get_current_screen();
        if ( ! $current_screen ) {
            return;
        }

        if ( ( 'edit' === $current_screen->base && 'shop_order' !== $current_screen->post_type ) && OrderUtil::get_order_admin_screen() !== $current_screen->base ) {
            return;
        }
        ?>
        <script type="text/javascript">
            jQuery(function ($) {
                <?php if ( OrderUtil::is_hpos_enabled() ) : ?>
                // hpos implementation
                fix_row_css_styles();
                toggle_suborders();

                $('button.show-sub-orders').on('click', function (e) {
                    e.preventDefault();
                    const self = $(this);
                    const elms = self.parents().find(`tr>td>span.${self.data('class')}`);

                    if (!elms.length) {
                        return;
                    }

                    elms.each(function (index) {
                        if ('none' === this.parentElement.parentElement.style.display) {
                            self.text(self.data('hide'));
                            this.parentElement.parentElement.style.display = '';
                        } else {
                            self.text(self.data('show'));
                            this.parentElement.parentElement.style.display = 'none';
                        }
                    });
                });

                $('button.toggle-sub-orders').on('click', function (e) {
                    e.preventDefault();
                    if (this.classList.contains('hide')) {
                        toggle_suborders();
                        this.classList.remove('hide');
                        this.classList.add('show');
                    } else {
                        toggle_suborders(false);
                        this.classList.remove('show');
                        this.classList.add('hide');
                    }
                });

                function toggle_suborders(hide = true) {
                    const self = $(this);
                    const elms = $('table.orders td.suborder>span.sub-order');

                    if (!elms.length) {
                        return;
                    }

                    const urlParams = new URLSearchParams(window.location.search);
                    if ( urlParams.get('s') || urlParams.get('vendor_id') ) {
                        return;
                    }

                    elms.each(function (index) {
                        if (hide) {
                            this.parentElement.parentElement.style.display = 'none';
                        } else {
                            this.parentElement.parentElement.style.display = '';
                        }
                    });
                }

                function fix_row_css_styles() {
                    const self = $(this);
                    const elms = $('table.orders td.suborder>span.sub-order');

                    if (!elms.length) {
                        return;
                    }

                    elms.each(function (index) {
                        this.parentElement.parentElement.bgColor = '#ECFFF2';
                    });
                }
                <?php else : ?>
                $('tr.sub-order').hide();

                $('button.show-sub-orders').on('click', function (e) {
                    e.preventDefault();

                    let $self = $(this),
                        el = $('tr.' + $self.data('class'));

                    if (!el.length) {
                        return;
                    }

                    if (el.is(':hidden')) {
                        el.show();
                        $self.text($self.data('hide'));
                    } else {
                        el.hide();
                        $self.text($self.data('show'));
                    }
                });

                $('button.toggle-sub-orders').on('click', function (e) {
                    e.preventDefault();
                    $('tr.sub-order').toggle();
                });
                <?php endif; ?>
            });
        </script>

        <style>
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
     * Change order item display meta key.
     *
     * @since DOKAN_LITE_SINCE
     * @since 3.8.0 Moved this method from Order/Hooks.php file
     *
     * @param string $display_key
     *
     * @return string
     */
    public function change_order_item_display_meta_key( $display_key ) {
        if ( 'seller_id' === $display_key ) {
            return __( 'Vendor', 'dokan-lite' );
        }

        return $display_key;
    }

    /**
     * Change order item display meta value.
     *
     * @since DOKAN_LITE_SINCE
     * @since 3.8.0 Moved this method from Order/Hooks.php file
     *
     * @param string $display_value
     * @param object $meta
     *
     * @return string
     */
    public function change_order_item_display_meta_value( $display_value, $meta ) {
        if ( 'seller_id' === $meta->key ) {
            $vendor = dokan()->vendor->get( $display_value );
            $url    = get_edit_user_link( $display_value );
            if ( function_exists( 'dokan_pro' ) ) {
                $url = admin_url( 'admin.php?page=dokan#/vendors/' . $display_value );
            }

            return '<a href=' . esc_url( $url ) . " '>" . $vendor->get_shop_name() . '</a>';
        }

        return $display_value;
    }

    /**
     * Delete sub orders when parent order is trashed
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param int $post_id
     */
    public function admin_on_trash_order( $post_id ) {
        if ( ! OrderUtil::is_order( $post_id ) ) {
            return;
        }

        $order = wc_get_order( $post_id );
        if ( ! $order || $order->get_parent_id() !== 0 ) {
            return;
        }

        $child_orders = dokan()->order->get_child_orders( $order->get_id() );
        foreach ( $child_orders as $child_order ) {
            $child_order->delete( false );
        }
    }

    /**
     * Un-trash sub orders when parent orders are un-trashed
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param int $post_id
     *
     * @return void
     */
    public function admin_on_untrash_order( $post_id ) {
        if ( ! OrderUtil::is_order( $post_id ) ) {
            return;
        }

        $order = wc_get_order( $post_id );
        if ( ! $order || $order->get_parent_id() !== 0 ) {
            return;
        }

        $child_orders = dokan()->order->get_child_orders( $order->get_id() );
        if ( ! $child_orders ) {
            return;
        }

        try {
            $order_data_store = WC_Data_Store::load( 'order' );
            foreach ( $child_orders as $child_order ) {
                if ( method_exists( $order_data_store->get_current_class_name(), 'untrash_order' ) ) {
                    $order_data_store->untrash_order( $child_order );
                } else {
                    wp_untrash_post( $child_order->get_id() );
                }
            }
        } catch ( Exception $e ) {
            return;
        }
    }

    /**
     * Delete sub orders and from dokan sync table when a order is deleted
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param int $post_id
     *
     * @return void
     */
    public function admin_on_delete_order( $post_id ) {
        dokan()->order->delete_seller_order_with_suborders( $post_id );
    }

    /**
     * Delete sub orders and from dokan sync table when a order is deleted
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param int $post_id
     *
     * @return void
     */
    public function admin_on_delete_order_post( $post_id ) {
        $order = wc_get_order( $post_id );
        if ( ! $order ) {
            return;
        }
        dokan()->order->delete_seller_order_with_suborders( $post_id );
    }

    /**
     * Show a toggle button to toggle all the sub orders
     *
     * @since 3.8.0 Moved from includes/Admin/Hooks.php file
     * @since 3.8.0 Rewritten for HPOS
     *
     * @param string $typenow
     *
     * @return void
     */
    public function admin_shop_order_toggle_sub_orders( $typenow ) {
        if ( $typenow === 'shop_order' ) {
            echo '<button class="toggle-sub-orders button show">' . esc_html__( 'Toggle Sub-orders', 'dokan-lite' ) . '</button>';
        }
    }
}
