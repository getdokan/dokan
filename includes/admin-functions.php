<?php

/**
 * Filter all the shop orders to remove child orders
 *
 * @param WP_Query $query
 */
function dokan_admin_shop_order_remove_parents( $query ) {
    if ( $query->is_main_query() && 'shop_order' == $query->query['post_type'] ) {
        $query->set( 'orderby', 'ID' );
        $query->set( 'order', 'DESC' );
    }
}

add_action( 'pre_get_posts', 'dokan_admin_shop_order_remove_parents' );

/**
 * Remove child orders from WC reports
 *
 * @param array $query
 * @return array
 */
function dokan_admin_order_reports_remove_parents( $query ) {

    $query['where'] .= ' AND posts.post_parent = 0';

    return $query;
}

add_filter( 'woocommerce_reports_get_order_report_query', 'dokan_admin_order_reports_remove_parents' );

/**
 * Change the columns shown in admin.
 *
 * @param array $existing_columns
 * @return array
 */
function dokan_admin_shop_order_edit_columns( $existing_columns ) {
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

add_filter( 'manage_edit-shop_order_columns', 'dokan_admin_shop_order_edit_columns', 11 );

/**
 * Adds custom column on dokan admin shop order table
 *
 * @global type $post
 * @global type $woocommerce
 * @global WC_Order $the_order
 * @param type $col
 */
function dokan_shop_order_custom_columns( $col ) {
    global $post, $the_order;

    if ( empty( $the_order ) || $the_order->get_id() != $post->ID ) {
        $the_order = new WC_Order( $post->ID );
    }

    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        return $col;
    }

    switch ($col) {
        case 'order_number':
            if ($post->post_parent !== 0) {
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

            if ( $has_sub != '1' ) {
                $seller = get_user_by( 'id', dokan_get_seller_id_by_order( $post->ID ) );
                printf( '<a href="%s">%s</a>', esc_url( admin_url( 'edit.php?post_type=shop_order&vendor_id=' . $seller->ID ) ), esc_html( $seller->display_name ) );
            }

            break;
    }
}

add_action( 'manage_shop_order_posts_custom_column', 'dokan_shop_order_custom_columns', 11 );

/**
 * Adds css classes on admin shop order table
 *
 * @global WP_Post $post
 * @param array $classes
 * @param int $post_id
 * @return array
 */
function dokan_admin_shop_order_row_classes( $classes, $post_id ) {
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

add_filter( 'post_class', 'dokan_admin_shop_order_row_classes', 10, 2);

/**
 * Show/hide sub order css/js
 *
 * @return void
 */
function dokan_admin_shop_order_scripts() {
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

add_action( 'admin_footer-edit.php', 'dokan_admin_shop_order_scripts' );

/**
 * Delete sub orders when parent order is trashed
 *
 * @param int $post_id
 */
function dokan_admin_on_trash_order( $post_id ) {
    $post = get_post( $post_id );

    if ( 'shop_order' == $post->post_type && 0 == $post->post_parent ) {
        $sub_orders = get_children( array(
            'post_parent' => $post_id,
            'post_type'   => 'shop_order'
        ) );

        if ( $sub_orders ) {
            foreach ( $sub_orders as $order_post ) {
                wp_trash_post( $order_post->ID );
            }
        }
    }
}

add_action( 'wp_trash_post', 'dokan_admin_on_trash_order' );

/**
 * Untrash sub orders when parent orders are untrashed
 *
 * @param int $post_id
 */
function dokan_admin_on_untrash_order( $post_id ) {
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

add_action( 'untrash_post', 'dokan_admin_on_untrash_order' );

/**
 * Delete sub orders and from dokan sync table when a order is deleted
 *
 * @param int $post_id
 */
function dokan_admin_on_delete_order( $post_id ) {
    $post = get_post( $post_id );

    if ( 'shop_order' == $post->post_type ) {
        dokan_delete_sync_order( $post_id );

        $sub_orders = get_children( array(
            'post_parent' => $post_id,
            'post_type'   => 'shop_order'
        ) );

        if ( $sub_orders ) {
            foreach ($sub_orders as $order_post) {
                wp_delete_post( $order_post->ID );
            }
        }
    }
}

add_action( 'delete_post', 'dokan_admin_on_delete_order' );

/**
 * Show a toggle button to toggle all the sub orders
 *
 * @global WP_Query $wp_query
 */
function dokan_admin_shop_order_toggle_sub_orders() {
    global $wp_query;

    if ( isset( $wp_query->query['post_type'] ) && 'shop_order' == $wp_query->query['post_type'] ) {
        echo '<button class="toggle-sub-orders button">' . esc_html__( 'Toggle Sub-orders', 'dokan-lite' ) . '</button>';
    }
}

add_action( 'restrict_manage_posts', 'dokan_admin_shop_order_toggle_sub_orders');

/**
 * Get total commision earning of the site
 *
 * @global WPDB $wpdb
 * @return int
 */
function dokan_site_total_earning() {
    global $wpdb;

    return $wpdb->get_var( $wpdb->prepare( "SELECT SUM((do.order_total - do.net_amount)) as earning
        FROM {$wpdb->prefix}dokan_orders do
        LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
        WHERE seller_id != %d AND p.post_status = 'publish' AND do.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')
        ORDER BY do.order_id DESC", 0
    ) );
}

/**
 * Dokan Get Admin report data
 *
 * @since 2.8.0
 *
 * @return array
 */
function dokan_admin_report_data( $group_by = 'day', $year = '', $start = '', $end = '', $seller_id = '' ) {
    global $wpdb;

    $_post_data   = wp_unslash( $_POST ); // WPCS: CSRF ok.
    $group_by     = apply_filters( 'dokan_report_group_by', $group_by );
    $start_date   = isset( $_post_data['start_date'] ) ? sanitize_text_field ( $_post_data['start_date'] ): $start; // WPCS: CSRF ok.
    $end_date     = isset( $_post_data['end_date'] ) ? sanitize_text_field( $_post_data['end_date'] ): $end; // WPCS: CSRF ok.
    $current_year = date( 'Y' );

    if ( ! $start_date ) {
        $start_date = date( 'Y-m-d', strtotime( date( 'Ym', current_time( 'timestamp' ) ) . '01' ) );

        if ( $group_by == 'year' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( ! $end_date ) {
        $end_date = date( 'Y-m-d', current_time( 'timestamp' ) );

        if ( $group_by == 'year' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $date_where = '';

    if ( 'day' == $group_by ) {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date), DAY(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
    } else {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
    }

    $left_join    = apply_filters( 'dokan_report_left_join', $date_where );
    $date_where   = apply_filters( 'dokan_report_where', $date_where );
    $seller_where = $seller_id ? "seller_id = {$seller_id}" : "seller_id != " . 0;

    $sql = "SELECT
                SUM((do.order_total - do.net_amount)) as earning,
                SUM(do.order_total) as order_total,
                COUNT(DISTINCT p.ID) as total_orders,
                p.post_date as order_date
            FROM {$wpdb->prefix}dokan_orders do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            $left_join
            WHERE
                $seller_where AND
                p.post_status != 'trash' AND
                do.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')
                $date_where
            GROUP BY $group_by_query";

    $data = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL

    return $data;
}

/**
 * Generate report in admin area
 *
 * @global WPDB $wpdb
 * @global type $wp_locale
 * @param string $group_by
 * @param string $year
 * @return obj
 */
function dokan_admin_report( $group_by = 'day', $year = '', $start = '', $end = '' ) {
    global $wp_locale;

    $data = dokan_admin_report_data( $group_by, $year, $start, $end );

    $_post_data = wp_unslash( $_POST ); // WPCS: CSRF ok.

    $start_date   = isset( $_post_data['start_date'] ) ? sanitize_text_field ( $_post_data['start_date'] ): $start; // WPCS: CSRF ok.
    $end_date     = isset( $_post_data['end_date'] ) ? sanitize_text_field( $_post_data['end_date'] ): $end; // WPCS: CSRF ok.
    $current_year = $year ? $year : date('Y');

    if ( ! $start_date ) {
        $start_date = date( 'Y-m-d', strtotime( date( 'Ym', current_time( 'timestamp' ) ) . '01' ) );

        if ( $group_by == 'year' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( ! $end_date ) {
        $end_date = date( 'Y-m-d', current_time( 'timestamp' ) );

        if ( $group_by == 'year' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $start_date_to_time = strtotime( $start_date );
    $end_date_to_time   = strtotime( $end_date );

    if ( $group_by == 'day' ) {
        $chart_interval = ceil( max( 0, ( $end_date_to_time - $start_date_to_time ) / ( 60 * 60 * 24 ) ) );
        $barwidth       = 60 * 60 * 24 * 1000;
    } else {
        $chart_interval = 0;
        $min_date       = $start_date_to_time;

        while ( ( $min_date   = strtotime( "+1 MONTH", $min_date ) ) <= $end_date_to_time ) {
            $chart_interval ++;
        }

        $barwidth = 60 * 60 * 24 * 7 * 4 * 1000;
    }

    // Prepare data for report
    $order_counts    = dokan_prepare_chart_data( $data, 'order_date', 'total_orders', $chart_interval, $start_date_to_time, $group_by );
    $order_amounts   = dokan_prepare_chart_data( $data, 'order_date', 'order_total', $chart_interval, $start_date_to_time, $group_by );
    $order_commision = dokan_prepare_chart_data( $data, 'order_date', 'earning', $chart_interval, $start_date_to_time, $group_by );

    // Encode in json format
    $chart_data = array(
        'order_counts'    => array_values( $order_counts ),
        'order_amounts'   => array_values( $order_amounts ),
        'order_commision' => array_values( $order_commision )
    );

    $chart_colours = array(
        'order_counts'    => '#3498db',
        'order_amounts'   => '#1abc9c',
        'order_commision' => '#73a724'
    );

    ?>

    <style type="text/css">
        .chart-tooltip {
            position: absolute;
            display: none;
            line-height: 1;
            background: #333;
            color: #fff;
            padding: 3px 5px;
            font-size: 11px;
            border-radius: 3px;
        }
    </style>
    <script type="text/javascript">
        jQuery(function($) {

            $(document).ready( function() {

                var order_data = jQuery.parseJSON( '<?php echo wp_json_encode( $chart_data ); ?>' );
                var isRtl = '<?php echo is_rtl() ? "1" : "0"; ?>';
                var series = [
                    {
                        label: "<?php echo esc_js( __( 'Total Sales', 'dokan-lite' ) ) ?>",
                        data: order_data.order_amounts,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        prepend_tooltip: "<?php echo esc_attr__( 'Total: ', 'dokan-lite') . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                    },
                    {
                        label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ) ?>",
                        data: order_data.order_counts,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        append_tooltip: " <?php echo esc_attr__( 'sales', 'dokan-lite' ); ?>"
                    },
                    {
                        label: "<?php echo esc_js( __( 'Commision', 'dokan-lite' ) ) ?>",
                        data: order_data.order_commision,
                        shadowSize: 0,
                        hoverable: true,
                        points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                        lines: { show: true, lineWidth: 4, fill: false },
                        shadowSize: 0,
                        prepend_tooltip: "<?php echo esc_attr__( 'Commision: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                    },
                ];

                var main_chart = jQuery.plot(
                    jQuery('.chart-placeholder.main'),
                    series,
                    {
                        legend: {
                            show: true,
                            position: 'nw'
                        },
                        series: {
                            lines: { show: true, lineWidth: 4, fill: false },
                            points: { show: true }
                        },
                        grid: {
                            borderColor: '#eee',
                            color: '#aaa',
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            hoverable: true,
                            show: true,
                            aboveData: false,
                        },
                        xaxis: {
                            color: '#aaa',
                            position: "bottom",
                            tickColor: 'transparent',
                            mode: "time",
                            timeformat: "<?php if ( $group_by == 'day' ) echo '%d %b'; else echo '%b'; ?>",
                            monthNames: <?php echo json_encode( array_values( $wp_locale->month_abbrev ) ) ?>,
                            tickLength: 1,
                            minTickSize: [1, "<?php echo ( esc_attr( $group_by ) == 'year' ) ? 'month' : esc_attr( $group_by ); ?>"],
                            font: {
                                color: "#aaa"
                            },
                            transform: function (v) { return ( isRtl == '1' ) ? -v : v; },
                            inverseTransform: function (v) { return ( isRtl == '1' ) ? -v : v; }
                        },
                        yaxes: [
                            {
                                position: ( isRtl == '1' ) ? "right" : "left",
                                min: 0,
                                minTickSize: 1,
                                tickDecimals: 0,
                                color: '#d4d9dc',
                                font: { color: "#aaa" }
                            },
                            {
                                position: ( isRtl == '1' ) ? "right" : "left",
                                min: 0,
                                tickDecimals: 2,
                                alignTicksWithAxis: 1,
                                color: 'transparent',
                                font: { color: "#aaa" }
                            }
                        ],
                        colors: ["<?php echo esc_attr( $chart_colours['order_counts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_amounts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_commision'] ); ?>"]
                    }
                );

                jQuery('.chart-placeholder').resize();


                function showTooltip(x, y, contents) {
                    jQuery('<div class="chart-tooltip">' + contents + '</div>').css({
                        top: y - 16,
                        left: x + 20
                    }).appendTo("body").fadeIn(200);
                }

                var prev_data_index = null;
                var prev_series_index = null;

                jQuery(".chart-placeholder").bind("plothover", function(event, pos, item) {
                    if (item) {
                        if (prev_data_index != item.dataIndex || prev_series_index != item.seriesIndex) {
                            prev_data_index = item.dataIndex;
                            prev_series_index = item.seriesIndex;

                            jQuery(".chart-tooltip").remove();

                            if (item.series.points.show || item.series.enable_tooltip) {

                                var y = item.series.data[item.dataIndex][1];

                                tooltip_content = '';

                                if (item.series.prepend_label)
                                    tooltip_content = tooltip_content + item.series.label + ": ";

                                if (item.series.prepend_tooltip)
                                    tooltip_content = tooltip_content + item.series.prepend_tooltip;

                                tooltip_content = tooltip_content + y;

                                if (item.series.append_tooltip)
                                    tooltip_content = tooltip_content + item.series.append_tooltip;

                                if (item.series.pie.show) {

                                    showTooltip(pos.pageX, pos.pageY, tooltip_content);

                                } else {

                                    showTooltip(item.pageX, item.pageY, tooltip_content);

                                }

                            }
                        }
                    } else {
                        jQuery(".chart-tooltip").remove();
                        prev_data_index = null;
                    }
                });

            });

        });

    </script>
    <?php

    return $data;
}

/**
 * Send notification to the seller once a product is published from pending
 *
 * @param WP_Post $post
 * @return void
 */
function dokan_send_notification_on_product_publish( $post ) {
    if ( $post->post_type != 'product' ) {
        return;
    }

    $seller = get_user_by( 'id', $post->post_author );

    do_action( 'dokan_pending_product_published_notification', $post, $seller );
}

add_action( 'pending_to_publish', 'dokan_send_notification_on_product_publish' );



/**
 * Display form field with list of authors.
 *
 * @since 2.5.3
 *
 * @param object $post
 */
function dokan_seller_meta_box( $post ) {
    global $user_ID;

    $admin_user = get_user_by( 'id', $user_ID );
    $selected   = empty( $post->ID ) ? $user_ID : $post->post_author;
    $user_query = new WP_User_Query( array( 'role' => 'seller' ) );
    $sellers    = $user_query->get_results();
    ?>
    <label class="screen-reader-text" for="dokan_product_author_override"><?php esc_html_e( 'Vendor', 'dokan-lite' ); ?></label>
    <select name="dokan_product_author_override" id="dokan_product_author_override" class="">
        <?php if ( ! $sellers ): ?>
            <option value="<?php echo esc_attr( $admin_user->ID ); ?>"><?php echo esc_html( $admin_user->display_name ); ?></option>
        <?php else: ?>
            <option value="<?php echo esc_attr( $user_ID ); ?>" <?php selected( $selected, $user_ID ); ?>><?php echo esc_html( $admin_user->display_name ); ?></option>
            <?php foreach ( $sellers as $key => $user): ?>
                <option value="<?php echo esc_attr( $user->ID ) ?>" <?php selected( $selected, $user->ID ); ?>><?php echo esc_html( $user->display_name ); ?></option>
            <?php endforeach ?>
        <?php endif ?>
    </select>
     <?php
}

/**
 * Remove default author metabox and added
 * new one for dokan seller
 *
 * @since  1.0.0
 *
 * @return void
 */
function dokan_add_seller_meta_box(){
    remove_meta_box( 'authordiv', 'product', 'core' );
    add_meta_box( 'sellerdiv', __('Vendor', 'dokan-lite' ), 'dokan_seller_meta_box', 'product', 'normal', 'core' );
}

add_action( 'add_meta_boxes', 'dokan_add_seller_meta_box' );

/**
* Override product vendor ID from admin panel
*
* @since 2.6.2
*
* @return void
**/
function dokan_override_product_author_by_admin( $product_id, $post ) {
    $product   = wc_get_product( $product_id );
    $seller_id = !empty( $_POST['dokan_product_author_override'] ) ? sanitize_text_field( wp_unslash( $_POST['dokan_product_author_override'] ) ): '-1'; // WPCS: CSRF ok.

    if ( $seller_id < 0 ) {
        return;
    }

    dokan_override_product_author( $product, $seller_id );
}

add_action( 'woocommerce_process_product_meta', 'dokan_override_product_author_by_admin', 12, 2 );

/**
 * Dokan override author ID from admin
 *
 * @since  2.6.2
 *
 * @param  object $product
 * @param  integer $seller_id
 *
 * @return void
 */
function dokan_override_product_author( $product, $seller_id ){
    wp_update_post( array(
        'ID'          => $product->get_id(),
        'post_author' => $seller_id
    ) );

    do_action( 'dokan_after_override_product_author', $product, $seller_id );
}

/**
 * Generate Earning report By seller in admin area
 *
 * @global WPDB $wpdb
 * @global type $wp_locale
 * @param string $group_by
 * @param string $year
 * @return obj
 */
function dokan_admin_report_by_seller( $chosen_seller_id) {
    global $wpdb, $wp_locale;

    $group_by     = 'day';
    $year         = '';
    $group_by     = apply_filters( 'dokan_report_group_by', $group_by );
    $_post_data   = wp_unslash( $_POST );
    $start_date   = isset( $_post_data['start_date'] ) ? sanitize_text_field( $_post_data['start_date'] ) : ''; // WPCS: CSRF ok.
    $end_date     = isset( $_post_data['end_date'] ) ? sanitize_text_field( $_post_data['end_date'] ) : ''; // WPCS: CSRF ok.
    $current_year = date( 'Y' );

    if ( !isset( $chosen_seller_id ) || $chosen_seller_id == '' || $chosen_seller_id == Null ) {
        return 0;
    }

    if ( ! $start_date ) {
        $start_date = date( 'Y-m-d', strtotime( date( 'Ym', current_time( 'timestamp' ) ) . '01' ) );

        if ( $group_by == 'month' ) {
            $start_date = $year . '-01-01';
        }
    }

    if ( ! $end_date ) {
        $end_date = date( 'Y-m-d', current_time( 'timestamp' ) );

        if ( $group_by == 'month' && ( $year < $current_year ) ) {
            $end_date = $year . '-12-31';
        }
    }

    $date_where         = '';
    $start_date_to_time = strtotime( $start_date );
    $end_date_to_time   = strtotime( $end_date );

    if ( $group_by == 'day' ) {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date), DAY(p.post_date)';
        $date_where     = " AND DATE(p.post_date) >= '$start_date' AND DATE(p.post_date) <= '$end_date'";
        $chart_interval = ceil( max( 0, ( $end_date_to_time - $start_date_to_time ) / ( 60 * 60 * 24 ) ) );
        $barwidth       = 60 * 60 * 24 * 1000;
    } else {
        $group_by_query = 'YEAR(p.post_date), MONTH(p.post_date)';
        $chart_interval = 0;
        $min_date       = $start_date_to_time;

        while ( ( $min_date   = strtotime( "+1 MONTH", $min_date ) ) <= $end_date_to_time ) {
            $chart_interval ++;
        }

        $barwidth = 60 * 60 * 24 * 7 * 4 * 1000;
    }

    $left_join  = apply_filters( 'dokan_report_left_join', $date_where );
    $date_where = apply_filters( 'dokan_report_where', $date_where );

    $sql = "SELECT
                SUM((do.order_total - do.net_amount)) as earning,
                SUM(do.order_total) as order_total,
                COUNT(DISTINCT p.ID) as total_orders,
                p.post_date as order_date
            FROM {$wpdb->prefix}dokan_orders do
            LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
            $left_join
            WHERE
                seller_id = $chosen_seller_id AND
                p.post_status != 'trash' AND
                do.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')
                $date_where
            GROUP BY $group_by_query";


    $data = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL

    // Prepare data for report
    $order_counts      = dokan_prepare_chart_data( $data, 'order_date', 'total_orders', $chart_interval, $start_date_to_time, $group_by );
    $order_amounts     = dokan_prepare_chart_data( $data, 'order_date', 'order_total', $chart_interval, $start_date_to_time, $group_by );
    $order_commision   = dokan_prepare_chart_data( $data, 'order_date', 'earning', $chart_interval, $start_date_to_time, $group_by );

    // Encode in json format
    $chart_data = array(
        'order_counts'    => array_values( $order_counts ),
        'order_amounts'   => array_values( $order_amounts ),
        'order_commision' => array_values( $order_commision )
    );

    $chart_colours = array(
        'order_counts'    => '#3498db',
        'order_amounts'   => '#1abc9c',
        'order_commision' => '#73a724'
    );
    ?>

    <style type="text/css">
        .chart-tooltip {
            position: absolute;
            display: none;
            line-height: 1;
            background: #333;
            color: #fff;
            padding: 3px 5px;
            font-size: 11px;
            border-radius: 3px;
        }
    </style>
    <script type="text/javascript">
        jQuery(function($) {

            var order_data = jQuery.parseJSON( '<?php echo wp_json_encode( $chart_data ); ?>' );
            var series = [
                {
                    label: "<?php echo esc_js( __( 'Total Sales', 'dokan-lite' ) ) ?>",
                    data: order_data.order_amounts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr__('Total: ', 'dokan-lite') . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Number of orders', 'dokan-lite' ) ) ?>",
                    data: order_data.order_counts,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    append_tooltip: "<?php echo esc_attr__( 'sales', 'dokan-lite' ); ?>"
                },
                {
                    label: "<?php echo esc_js( __( 'Commision', 'dokan-lite' ) ) ?>",
                    data: order_data.order_commision,
                    shadowSize: 0,
                    hoverable: true,
                    points: { show: true, radius: 5, lineWidth: 3, fillColor: '#fff', fill: true },
                    lines: { show: true, lineWidth: 4, fill: false },
                    shadowSize: 0,
                    prepend_tooltip: "<?php echo esc_attr__( 'Commision: ', 'dokan-lite' ) . esc_attr( get_woocommerce_currency_symbol() ); ?>"
                },
            ];

            var main_chart = jQuery.plot(
                jQuery('.chart-placeholder.main'),
                series,
                {
                    legend: {
                        show: true,
                        position: 'nw'
                    },
                    series: {
                        lines: { show: true, lineWidth: 4, fill: false },
                        points: { show: true }
                    },
                    grid: {
                        borderColor: '#eee',
                        color: '#aaa',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        hoverable: true,
                        show: true,
                        aboveData: false,
                    },
                    xaxis: {
                        color: '#aaa',
                        position: "bottom",
                        tickColor: 'transparent',
                        mode: "time",
                        timeformat: "<?php if ( $group_by == 'day' ) echo '%d %b'; else echo '%b'; ?>",
                        monthNames: <?php echo json_encode( array_values( $wp_locale->month_abbrev ) ) ?>,
                        tickLength: 1,
                        minTickSize: [1, "<?php echo esc_attr( $group_by ); ?>"],
                        font: {
                            color: "#aaa"
                        }
                    },
                    yaxes: [
                        {
                            min: 0,
                            minTickSize: 1,
                            tickDecimals: 0,
                            color: '#d4d9dc',
                            font: { color: "#aaa" }
                        },
                        {
                            position: "right",
                            min: 0,
                            tickDecimals: 2,
                            alignTicksWithAxis: 1,
                            color: 'transparent',
                            font: { color: "#aaa" }
                        }
                    ],
                    colors: ["<?php echo esc_attr( $chart_colours['order_counts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_amounts'] ); ?>", "<?php echo esc_attr( $chart_colours['order_commision'] ); ?>"]
                }
            );

            jQuery('.chart-placeholder').resize();


            function showTooltip(x, y, contents) {
                jQuery('<div class="chart-tooltip">' + contents + '</div>').css({
                    top: y - 16,
                    left: x + 20
                }).appendTo("body").fadeIn(200);
            }

            var prev_data_index = null;
            var prev_series_index = null;

            jQuery(".chart-placeholder").bind("plothover", function(event, pos, item) {
                if (item) {
                    if (prev_data_index != item.dataIndex || prev_series_index != item.seriesIndex) {
                        prev_data_index = item.dataIndex;
                        prev_series_index = item.seriesIndex;

                        jQuery(".chart-tooltip").remove();

                        if (item.series.points.show || item.series.enable_tooltip) {

                            var y = item.series.data[item.dataIndex][1];

                            tooltip_content = '';

                            if (item.series.prepend_label)
                                tooltip_content = tooltip_content + item.series.label + ": ";

                            if (item.series.prepend_tooltip)
                                tooltip_content = tooltip_content + item.series.prepend_tooltip;

                            tooltip_content = tooltip_content + y;

                            if (item.series.append_tooltip)
                                tooltip_content = tooltip_content + item.series.append_tooltip;

                            if (item.series.pie.show) {

                                showTooltip(pos.pageX, pos.pageY, tooltip_content);

                            } else {

                                showTooltip(item.pageX, item.pageY, tooltip_content);

                            }

                        }
                    }
                } else {
                    jQuery(".chart-tooltip").remove();
                    prev_data_index = null;
                }
            });
        });

    </script>
    <?php

    return $data;
}

add_filter( 'post_types_to_delete_with_user', 'dokan_add_wc_post_types_to_delete_user', 10, 2 );

function dokan_add_wc_post_types_to_delete_user( $post_types, $user_id ) {
    if ( ! dokan_is_user_seller( $user_id ) ) {
        return $post_types;
    }

    $wc_post_types = array( 'product', 'product_variation', 'shop_order', 'shop_coupon' );

    return array_merge( $post_types, $wc_post_types );
}

/**
 * Get help documents for admin
 *
 * @since 2.8
 *
 * @return Object
 */
function dokan_admin_get_help() {
    $help_docs = get_transient( 'dokan_help_docs', '[]' );

    if ( false === $help_docs ) {
        $help_url  = 'https://api.bitbucket.org/2.0/snippets/wedevs/oErMz/files/dokan-help.json';
        $response  = wp_remote_get( $help_url, array('timeout' => 15) );
        $help_docs = wp_remote_retrieve_body( $response );

        if ( is_wp_error( $response ) || $response['response']['code'] != 200 ) {
            $help_docs = '[]';
        }

        set_transient( 'dokan_help_docs', $help_docs, 12 * HOUR_IN_SECONDS );
    }

    $help_docs = json_decode( $help_docs );

    return $help_docs;
}

/**
 * Dokan update pages
 *
 * @param array $value
 * @param array $name
 *
 * @return array
 */
function dokan_update_pages( $value, $name ) {
    if ( 'dokan_pages' !== $name ) {
        return $value;
    }

    return array_replace_recursive( get_option( $name ), $value );
}

add_filter( 'dokan_save_settings_value', 'dokan_update_pages', 10, 2 );