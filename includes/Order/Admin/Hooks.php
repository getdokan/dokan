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

        // Add commission meta-box in order details page.
        add_action( 'add_meta_boxes', [ $this, 'add_commission_metabox_in_order_details_page' ], 10, 2 );
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

        if ( is_search() || ! current_user_can( 'manage_woocommerce' ) ) {
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
                    if ( urlParams.get('s') ) {
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

    /**
     * Add dokan commission meta-box in woocommerce order details page.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function add_commission_metabox_in_order_details_page( $post_type, $post ) {
        $screen = OrderUtil::get_order_admin_screen();

        // Check if the screen is order details page and if it is parent order then don't show the meta-box.
        if ( $screen === $post_type ) {
            $order = dokan()->order->get( OrderUtil::get_post_or_order_id( $post ) );

            if ( '1' === $order->get_meta( 'has_sub_order', true ) ) {
                return;
            }
        }

        add_meta_box(
            'dokan_commission_box',
            __( 'Comissions', 'dokan-lite' ),
            [ $this, 'commission_meta_box' ],
            $screen,
            'normal',
            'core'
        );
    }

    /**
     * Dokan order commission meta-box body.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Post|WC_Order $post_or_order
     *
     * @return void
     */
    public function commission_meta_box( $post_or_order ) {
        global $wpdb;
        $order = dokan()->order->get( OrderUtil::get_post_or_order_id( $post_or_order ) );

        $data = $wpdb->get_row(
            $wpdb->prepare( "SELECT order_total,net_amount FROM {$wpdb->prefix}dokan_orders WHERE order_id = %d LIMIT 1", $order->get_id() )
        );

        $total_commission = (float) $data->order_total - (float) $data->net_amount;
        ?>
        <div id="woocommerce-order-items" class="postbox" style='border: none'>
            <div class="postbox-header"><h2 class="hndle ui-sortable-handle">Items</h2>
                <div class="handle-actions hide-if-no-js"><button type="button" class="handle-order-higher" aria-disabled="false" aria-describedby="woocommerce-order-items-handle-order-higher-description"><span class="screen-reader-text">Move up</span><span class="order-higher-indicator" aria-hidden="true"></span></button><span class="hidden" id="woocommerce-order-items-handle-order-higher-description">Move Items box up</span><button type="button" class="handle-order-lower" aria-disabled="false" aria-describedby="woocommerce-order-items-handle-order-lower-description"><span class="screen-reader-text">Move down</span><span class="order-lower-indicator" aria-hidden="true"></span></button><span class="hidden" id="woocommerce-order-items-handle-order-lower-description">Move Items box down</span><button type="button" class="handlediv" aria-expanded="true"><span class="screen-reader-text">Toggle panel: Items</span><span class="toggle-indicator" aria-hidden="true"></span></button></div></div><div class="inside">
                <div class="woocommerce_order_items_wrapper wc-order-items-editable">
                    <table cellpadding="0" cellspacing="0" class="woocommerce_order_items">
                        <thead>
                        <tr>
                            <th colspan="2">Item</th>
                            <th><?php esc_html_e( 'Type', 'dokan-lite' ); ?></th>
                            <th><?php esc_html_e( 'Rate', 'dokan-lite' ); ?></th>
                            <th><?php esc_html_e( 'Qty', 'dokan-lite' ); ?></th>
                            <th><?php esc_html_e( 'Commission', 'dokan-lite' ); ?></th>
                            <th class="wc-order-edit-line-item" width="1%">&nbsp;</th>
                        </tr>
                        </thead>

                        <tbody id="order_line_items">
                            <?php foreach ( $order->get_items() as $item_id => $item ) : ?>
                                <?php
                                    $product      = $item->get_product();
                                    $product_link = $product ? admin_url( 'post.php?post=' . $item->get_product_id() . '&action=edit' ) : '';
                                    $thumbnail    = $product ? apply_filters( 'woocommerce_admin_order_item_thumbnail', $product->get_image( 'thumbnail', array( 'title' => '' ), false ), $item_id, $item ) : '';
                                    $row_class    = apply_filters( 'woocommerce_admin_html_order_item_class', ! empty( $class ) ? $class : '', $item, $order );
                                    $commission   = 0;

                                ?>
                                <tr class="item  <?php echo esc_attr( $row_class ); ?>" data-order_item_id="<?php echo $item->get_id(); ?>">
                                    <td class="thumb">
                                        <?php echo '<div class="wc-order-item-thumbnail">' . wp_kses_post( $thumbnail ) . '</div>'; ?>
                                    </td>
                                    <td class="name">
                                        <?php
                                        echo $product_link ? '<a href="' . esc_url( $product_link ) . '" class="wc-order-item-name">' . wp_kses_post( $item->get_name() ) . '</a>' : '<div class="wc-order-item-name">' . wp_kses_post( $item->get_name() ) . '</div>';

                                        if ( $product && $product->get_sku() ) {
                                            echo '<div class="wc-order-item-sku"><strong>' . esc_html__( 'SKU:', 'dokan-lite' ) . '</strong> ' . esc_html( $product->get_sku() ) . '</div>';
                                        }

                                        if ( $item->get_variation_id() ) {
                                            echo '<div class="wc-order-item-variation"><strong>' . esc_html__( 'Variation ID:', 'dokan-lite' ) . '</strong> ';
                                            if ( 'product_variation' === get_post_type( $item->get_variation_id() ) ) {
                                                echo esc_html( $item->get_variation_id() );
                                            } else {
                                                /* translators: %s: variation id */
                                                printf( esc_html__( '%s (No longer exists)', 'dokan-lite' ), esc_html( $item->get_variation_id() ) );
                                            }
                                            echo '</div>';
                                        }
                                        ?>
                                    </td>


                                    <td width="1%">
                                        <div class="view">
                                            <bdi><?php echo esc_html( $item->get_meta( '_dokan_commission_type' ) ); ?></bdi>
                                        </div>
                                    </td>
                                    <td width="1%">
                                        <div class="view">
                                            <?php if ( 'flat' === $item->get_meta( '_dokan_commission_type' ) ) : ?>
                                                <?php echo esc_html( $item->get_meta( '_dokan_commission_rate' ) . get_woocommerce_currency_symbol() ); ?>
                                            <?php elseif ( 'percentage' === $item->get_meta( '_dokan_commission_type' ) ) : ?>
                                                <?php echo esc_html( $item->get_meta( '_dokan_commission_rate' ) . '%' ); ?>
                                            <?php elseif ( 'combine' === $item->get_meta( '_dokan_commission_type' ) ) : ?>
                                                <?php echo esc_html( $item->get_meta( '_dokan_commission_rate' ) . '%' ); ?>&nbsp;+&nbsp;<?php echo esc_html( $item->get_meta( '_dokan_additional_fee' ) . get_woocommerce_currency_symbol() ); ?>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td class="quantity" width="1%">
                                        <div class="view">
                                            <?php
                                            echo '<small class="times">&times;</small> ' . esc_html( $item->get_quantity() );

                                            $refunded_qty = -1 * $order->get_qty_refunded_for_item( $item_id );

                                            if ( $refunded_qty ) {
                                                echo '<small class="refunded">' . esc_html( $refunded_qty * -1 ) . '</small>';
                                            }
                                            ?>
                                        </div>
                                    </td>
                                    <td width="1%">
                                        <div class="view">
                                            <?php
                                            $amount = $item->get_total();
                                            $refunded_amount = -1 * $order->get_total_refunded_for_item( $item_id );

                                            $original_commission = 0;
											if ( 'flat' === $item->get_meta( '_dokan_commission_type' ) ) {
												$original_commission = (float) $item->get_meta( '_dokan_commission_rate' ) * (int) $item->get_quantity();
											} elseif ( 'percentage' === $item->get_meta( '_dokan_commission_type' ) ) {
												$original_commission = ( (float) $item->get_meta( '_dokan_commission_rate' ) * (float) $amount ) / 100;
											} elseif ( 'combine' === $item->get_meta( '_dokan_commission_type' ) ) {
												$original_commission = ( ( (float) $item->get_meta( '_dokan_commission_rate' ) * (float) $amount ) / 100 ) + (float) $item->get_meta( '_dokan_additional_fee' );
											}

											if ( $refunded_amount ) {
												$commission_refunded = ( $order->get_total_refunded_for_item( $item_id ) / $amount ) * $original_commission;
											}

                                                echo '<bdi>' . wc_price( $original_commission, array( 'currency' => $order->get_currency() ) ) . '</bdi>';

											if ( $refunded_amount ) {
												echo '<small class="refunded">' . wc_price( $commission_refunded, array( 'currency' => $order->get_currency() ) ) . '</small>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
											}
                                            ?>
                                        </div>
                                    </td>

                                    <td class="wc-order-edit-line-item" width="1%"></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <div class="wc-order-data-row wc-order-totals-items wc-order-items-editable">
                    <table class="wc-order-totals">
                        <tbody>
                            <tr>
                                <td class="label"><?php esc_html_e( 'Order total:', 'dokan-lite' ); ?></td>
                                <td width="1%"></td>
                                <td class="total">
                                    <?php echo wc_price( $data->order_total, array( 'currency' => $order->get_currency() ) ); ?>
                                </td>
                            </tr>
                            <tr>
                                <td class="label"><?php esc_html_e( 'Vendor earning:', 'dokan-lite' ); ?></td>
                                <td width="1%"></td>
                                <td class="total">
                                    <?php echo wc_price( $data->net_amount, array( 'currency' => $order->get_currency() ) ); ?>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="clear"></div>


                    <table class="wc-order-totals" style="border-top: 1px solid #999; border-bottom: none; margin-top:12px; padding-top:12px">
                        <tbody>
                            <tr>
                                <td class="label label-highlight"><?php esc_html_e( 'Total commission:', 'dokan-lite' ); ?></td>
                                <td width="1%"></td>
                                <td class="total">
                                    <?php echo wc_price( $total_commission, array( 'currency' => $order->get_currency() ) ); ?>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php
    }
}
