<?php
/**
 * Dokan Admin menu position
 *
 * @since 3.0.0
 *
 * @return void
 */
function dokan_admin_menu_position() {
    return apply_filters( 'dokan_menu_position', '55.4' );
}

/**
 * Dokan Admin menu capability
 *
 * @since 3.0.0
 *
 * @return void
 */
function dokana_admin_menu_capability() {
    return apply_filters( 'dokan_menu_capability', 'manage_woocommerce' );
}

/**
 * Dokan Get current user id
 *
 * @since 2.7.3
 *
 * @return int
 */
function dokan_get_current_user_id() {
    if ( current_user_can( 'vendor_staff' ) ) {
        $staff_id  = get_current_user_id();
        $vendor_id = get_user_meta( $staff_id, '_vendor_id', true );

        if ( empty( $vendor_id ) ) {
            return $staff_id;
        }

        return $vendor_id;
    }

    return get_current_user_id();
}

/**
 * Check if a user is seller
 *
 * @param int $user_id
 *
 * @return bool
 */
function dokan_is_user_seller( $user_id ) {
    if ( ! user_can( $user_id, 'dokandar' ) ) {
        return false;
    }

    return true;
}

/**
 * Check if a user is customer
 *
 * @param int $user_id
 *
 * @return bool
 */
function dokan_is_user_customer( $user_id ) {
    if ( ! user_can( $user_id, 'customer' ) ) {
        return false;
    }

    return true;
}

/**
 * Check if current user is the product author
 *
 * @global WP_Post $post
 *
 * @param int $product_id
 *
 * @return bool
 */
function dokan_is_product_author( $product_id = 0 ) {
    global $post;

    if ( ! $product_id ) {
        $author = $post->post_author;
    } else {
        $author = get_post_field( 'post_author', $product_id );
    }

    if ( absint( $author ) === apply_filters( 'dokan_is_product_author', dokan_get_current_user_id(), $product_id ) ) {
        return true;
    }

    return false;
}

/**
 * Check if it's a store page
 *
 * @return bool
 */
function dokan_is_store_page() {
    $custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

    if ( get_query_var( $custom_store_url ) ) {
        return true;
    }

    return false;
}

/**
 * Check if it's product edit page
 *
 * @since 3.0
 *
 * @return bool
 */
function dokan_is_product_edit_page() {
    if ( get_query_var( 'edit' ) && is_singular( 'product' ) ) {
        return true;
    }

    return false;
}

/**
 * Check if it's a Seller Dashboard page
 *
 * @since 2.4.9
 *
 * @return bool
 */
function dokan_is_seller_dashboard() {
    $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

    if ( ! apply_filters( 'dokan_get_dashboard_page_id', $page_id ) ) {
        return false;
    }

    if ( absint( $page_id ) === apply_filters( 'dokan_get_current_page_id', get_the_ID() ) ) {
        return true;
    }

    return false;
}

/**
 * Redirect to login page if not already logged in
 *
 * @return void
 */
function dokan_redirect_login() {
    if ( ! is_user_logged_in() ) {
        $url = apply_filters( 'dokan_redirect_login', dokan_get_page_url( 'myaccount', 'woocommerce' ) );
        wp_safe_redirect( $url );
        exit();
    }
}

/**
 * If the current user is not seller, redirect to homepage
 *
 * @param string $redirect
 */
function dokan_redirect_if_not_seller( $redirect = '' ) {
    if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
        $redirect = empty( $redirect ) ? home_url( '/' ) : $redirect;

        wp_safe_redirect( $redirect );
        exit();
    }
}

/**
 * Count post type from a user
 *
 * @global WPDB $wpdb
 *
 * @param string $post_type
 * @param int    $user_id
 * @param array  $exclude_product_types The product types that will be excluded from count
 *
 * @return array
 */
function dokan_count_posts( $post_type, $user_id, $exclude_product_types = array( 'booking' ) ) {
    global $wpdb;

    $exclude_product_types      = esc_sql( $exclude_product_types );
    $exclude_product_types_text = "'" . implode( "', '", $exclude_product_types ) . "'";
    $exclude_product_types_key  = implode( '-', $exclude_product_types );
    $cache_group                = 'dokan_cache_seller_product_data_' . $user_id;
    $cache_key                  = 'dokan-count-' . $post_type . '-' . $exclude_product_types_key . '-' . $user_id;
    $counts                     = wp_cache_get( $cache_key, $cache_group );
    $tracked_cache_keys         = get_option( $cache_group, [] );

    if ( ! in_array( $cache_key, $tracked_cache_keys, true ) ) {
        $tracked_cache_keys[] = $cache_key;
        update_option( $cache_group, $tracked_cache_keys );
    }

    if ( false === $counts ) {
        $results = apply_filters( 'dokan_count_posts', null, $post_type, $user_id );

        if ( ! $results ) {
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT post_status, COUNT( * ) AS num_posts FROM {$wpdb->posts} as posts
                            INNER JOIN {$wpdb->term_relationships} AS term_relationships ON posts.ID = term_relationships.object_id
                            INNER JOIN {$wpdb->term_taxonomy} AS term_taxonomy ON term_relationships.term_taxonomy_id = term_taxonomy.term_taxonomy_id
                            INNER JOIN {$wpdb->terms} AS terms ON term_taxonomy.term_id = terms.term_id
                            WHERE
                                term_taxonomy.taxonomy = 'product_type'
                            AND terms.slug NOT IN ({$exclude_product_types_text})
                            AND posts.post_type = %s
                            AND posts.post_author = %d
                                GROUP BY posts.post_status",
                    $post_type,
                    $user_id
                ),
                ARRAY_A
            );
        }

        $post_status = array_keys( dokan_get_post_status() );
        $counts      = array_fill_keys( get_post_stati(), 0 );
        $total       = 0;

        foreach ( $results as $row ) {
            if ( ! in_array( $row['post_status'], $post_status, true ) ) {
                continue;
            }

            $counts[ $row['post_status'] ] = (int) $row['num_posts'];
            $total += (int) $row['num_posts'];
        }

        $counts['total'] = $total;
        $counts          = (object) $counts;

        wp_cache_set( $cache_key, $counts, $cache_group, 3600 * 6 );
    }

    return $counts;
}

/**
 * Count stock product type from a user
 *
 * @global WPDB $wpdb
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param string $post_type
 * @param int    $user_id
 * @param string $stock_type
 *
 * @return int $counts
 */
function dokan_count_stock_posts( $post_type, $user_id, $stock_type ) {
    global $wpdb;

    $cache_group   = 'dokan_cache_seller_product_stock_data_' . $user_id;
    $cache_key     = 'dokan-count-' . $post_type . '_' . $stock_type . '-' . $user_id;
    $counts        = wp_cache_get( $cache_key, $cache_group );
    $get_old_cache = get_option( $cache_group, [] );

    if ( ! in_array( $cache_key, $get_old_cache, true ) ) {
        $get_old_cache[] = $cache_key;
    }

    update_option( $cache_group, $get_old_cache );

    if ( false === $counts ) {
        $results = apply_filters( 'dokan_count_posts_' . $stock_type, null, $post_type, $user_id );

        if ( ! $results ) {
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT p.post_status, COUNT( * ) AS num_posts 
                    FROM {$wpdb->prefix}posts as p INNER JOIN {$wpdb->prefix}postmeta as pm ON p.ID = pm.post_id
                    WHERE p.post_type = %s
                    AND p.post_author = %d
                    AND pm.meta_key   = '_stock_status'
                    AND pm.meta_value = %s
                    GROUP BY p.post_status",
                    $post_type,
                    $user_id,
                    $stock_type
                ),
                ARRAY_A
            );
        }

        $post_status = array_keys( dokan_get_post_status() );
        $total       = 0;

        foreach ( $results as $row ) {
            if ( ! in_array( $row['post_status'], $post_status, true ) ) {
                continue;
            }

            $total += (int) $row['num_posts'];
        }

        $counts = $total;

        wp_cache_set( $cache_key, $counts, $cache_group, 3600 * 6 );
    }

    return $counts;
}

/**
 * Get comment count based on post type and user id
 *
 * @global WPDB $wpdb
 * @global WP_User $current_user
 *
 * @param string $post_type
 * @param int    $user_id
 *
 * @return array
 */
function dokan_count_comments( $post_type, $user_id ) {
    global $wpdb;

    $cache_key = 'dokan-count-comments-' . $post_type . '-' . $user_id;
    $counts    = wp_cache_get( $cache_key, 'dokan-lite' );

    if ( $counts === false ) {
        $count = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT c.comment_approved, COUNT( * ) AS num_comments
                FROM $wpdb->comments as c, $wpdb->posts as p
                WHERE p.post_author = %d AND
                    p.post_status = 'publish' AND
                    c.comment_post_ID = p.ID AND
                    p.post_type = %s
                GROUP BY c.comment_approved",
                $user_id,
                $post_type
            ),
            ARRAY_A
        );

        $total  = 0;
        $counts = [
            'moderated' => 0,
            'approved'  => 0,
            'spam'      => 0,
            'trash'     => 0,
            'total'     => 0,
        ];
        $statuses = [
            '0'            => 'moderated',
            '1'            => 'approved',
            'spam'         => 'spam',
            'trash'        => 'trash',
            'post-trashed' => 'post-trashed',
        ];

        foreach ( $count as $row ) {
            if ( isset( $statuses[ $row['comment_approved'] ] ) ) {
                $counts[ $statuses[ $row['comment_approved'] ] ] = (int) $row['num_comments'];
                $total += (int) $row['num_comments'];
            }
        }
        $counts['total'] = $total;

        $counts = (object) $counts;
        wp_cache_set( $cache_key, $counts, 'dokan-lite', 3600 * 2 );
    }

    return $counts;
}

/**
 * Get total pageview for a seller
 *
 * @global WPDB $wpdb
 *
 * @param int $seller_id
 *
 * @return int
 */
function dokan_author_pageviews( $seller_id ) {
    global $wpdb;

    $cache_key = 'dokan-pageview-' . $seller_id;
    $pageview  = wp_cache_get( $cache_key, 'dokan_page_view' );

    if ( $pageview === false ) {
        $count = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT SUM(meta_value) as pageview
                FROM {$wpdb->postmeta} AS meta
                LEFT JOIN {$wpdb->posts} AS p ON p.ID = meta.post_id
                WHERE meta.meta_key = 'pageview' AND p.post_author = %d AND p.post_status IN ('publish', 'pending', 'draft')",
                $seller_id
            )
        );

        $pageview = $count->pageview;

        wp_cache_set( $cache_key, $pageview, 'dokan_page_view', 3600 * 4 );
    }

    return $pageview;
}

/**
 * Get total sales amount of a seller
 *
 * @global WPDB $wpdb
 *
 * @param int $seller_id
 *
 * @return float
 */
function dokan_author_total_sales( $seller_id ) {
    global $wpdb;

    $cache_group = 'dokan_seller_data_' . $seller_id;
    $cache_key   = 'dokan-earning-' . $seller_id;
    $earnings    = wp_cache_get( $cache_key, $cache_group );

    if ( $earnings === false ) {
        $count = $wpdb->get_row(
            $wpdb->prepare( "SELECT SUM(order_total) as earnings FROM {$wpdb->prefix}dokan_orders WHERE seller_id = %d AND order_status IN('wc-completed', 'wc-processing', 'wc-on-hold')", $seller_id )
        );

        $earnings = $count->earnings;

        wp_cache_set( $cache_key, $earnings, $cache_group );
        dokan_cache_update_group( $cache_key, $cache_group );
    }

    return apply_filters( 'dokan_seller_total_sales', $earnings );
}

/**
 * Generate dokan sync table
 *
 * @deprecated since 2.4.3
 *
 * @global WPDB $wpdb
 */
function dokan_generate_sync_table() {
    global $wpdb;

    $orders = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT oi.order_id, p.ID as product_id, p.post_title, p.post_author as seller_id,
                oim2.meta_value as order_total, p.post_status as order_status
            FROM {$wpdb->prefix}woocommerce_order_items oi
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oim.order_item_id = oi.order_item_id
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2 ON oim2.order_item_id = oi.order_item_id
            INNER JOIN $wpdb->posts p ON oi.order_id = p.ID
            WHERE
                oim.meta_key = %s AND
                oim2.meta_key = %s
            GROUP BY oi.order_id",
            '_product_id',
            '_line_total'
        )
    );

    $table_name = $wpdb->prefix . 'dokan_orders';

    $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}dokan_orders" );

    if ( $orders ) {
        foreach ( $orders as $order ) {
            $wc_order         = wc_get_order( $order->order_id );
            $admin_commission = dokan_get_admin_commission_by( $wc_order, $order->seller_id );

            $wpdb->insert(
                $table_name,
                [
                    'order_id'     => $order->order_id,
                    'seller_id'    => $order->seller_id,
                    'order_total'  => $order->order_total,
                    'net_amount'   => $order->order_total - $admin_commission,
                    'order_status' => $order->order_status,
                ],
                [
                    '%d',
                    '%d',
                    '%f',
                    '%f',
                    '%s',
                ]
            );
        }
    }
}

if ( ! function_exists( 'dokan_get_seller_earnings_by_order' ) ) {

    /**
     * Get Seller's net Earnings from a order
     *
     * @since 2.5.2
     *
     * @param WC_ORDER $order
     * @param int      $seller_id
     *
     * @return int $earned
     */
    function dokan_get_seller_earnings_by_order( $order, $seller_id ) {
        $earned = $order->get_total() - dokan_get_admin_commission_by( $order, $seller_id );

        return apply_filters( 'dokan_get_seller_earnings_by_order', $earned, $order, $seller_id );
    }
}

if ( ! function_exists( 'dokan_get_seller_percentage' ) ) {

    /**
     * Get store seller percentage settings
     *
     * @param int $seller_id
     * @param int $product_id
     *
     * @return int
     */
    function dokan_get_seller_percentage( $seller_id = 0, $product_id = 0, $category_id = 0 ) {

        // Seller will get 100 percent if ( any_input_val < 0 || percentage_input_val > 100 )
        $commission_val = 100;

        //Global percentage
        $global_percentage = dokan_get_option( 'admin_percentage', 'dokan_selling', 0 );

        if ( $global_percentage !== '' && is_numeric( $global_percentage ) && $global_percentage >= 0 ) {
            $global_type = dokan_get_option( 'commission_type', 'dokan_selling', 'percentage' );

            if ( 'percentage' === $global_type ) {
                if ( $global_percentage <= 100 ) {
                    $commission_val = (float) ( 100 - $global_percentage );
                }
            } elseif ( 'flat' === $global_type ) {
                $commission_val = (float) $global_percentage;
            }
        }

        //seller wise percentage
        if ( $seller_id ) {
            $admin_commission = get_user_meta( $seller_id, 'dokan_admin_percentage', true );

            if ( $admin_commission !== '' && is_numeric( $admin_commission ) && $admin_commission >= 0 ) {
                $admin_percentage_type = get_user_meta( $seller_id, 'dokan_admin_percentage_type', true );

                if ( 'percentage' === $admin_percentage_type ) {
                    if ( $admin_commission <= 100 ) {
                        $commission_val = (float) ( 100 - $admin_commission );
                    }
                } elseif ( 'flat' === $admin_percentage_type ) {
                    $commission_val = (float) $admin_commission;
                }
            }
        }

        //product and category wise percentage
        if ( $product_id ) {

            //category wise percentage
            $category_commission = dokan_get_category_wise_seller_commission( $product_id, $category_id );
            $is_single_category  = dokan_get_option( 'product_category_style', 'dokan_selling', 'single' );

            if ( $is_single_category === 'single' && $category_commission !== '' && is_numeric( $category_commission ) && $category_commission >= 0 ) {
                $category_commission_type = dokan_get_category_wise_seller_commission_type( $product_id, $category_id );

                if ( 'percentage' === $category_commission_type ) {
                    if ( $category_commission <= 100 ) {
                        $commission_val = (float) ( 100 - $category_commission );
                    }
                } elseif ( 'flat' === $category_commission_type ) {
                    $commission_val = (float) $category_commission;
                }
            }

            //product wise percentage
            $_per_product_commission = get_post_meta( $product_id, '_per_product_admin_commission', true );

            if ( $_per_product_commission !== '' && is_numeric( $_per_product_commission ) && $_per_product_commission >= 0 ) {
                $_per_product_commission_type = get_post_meta( $product_id, '_per_product_admin_commission_type', true );

                if ( 'percentage' == $_per_product_commission_type ) {
                    if ( $_per_product_commission <= 100 ) {
                        $commission_val = (float) ( 100 - $_per_product_commission );
                    }
                } elseif ( 'flat' == $_per_product_commission_type ) {
                    $commission_val = (float) $_per_product_commission;
                }
            }
        }

        return apply_filters( 'dokan_get_seller_percentage', $commission_val, $seller_id, $product_id );
    }
}

/**
 * Get Dokan commission type by seller or product or both
 *
 * @since 2.6.9
 *
 * @param int $seller_id
 * @param int $product_id
 *
 * @return string $type
 */
function dokan_get_commission_type( $seller_id = 0, $product_id = 0, $category_id = 0 ) {
    //return product wise percentage
    if ( $product_id ) {
        $_per_product_commission = get_post_meta( $product_id, '_per_product_admin_commission', true );

        if ( $_per_product_commission != '' ) {
            $type = get_post_meta( $product_id, '_per_product_admin_commission_type', true );
            $type = empty( $type ) ? 'percentage' : $type;

            if ( 'flat' == $type || ( 'percentage' == $type && $_per_product_commission <= 100 ) ) {
                return $type;
            }
        }

        $category_commission = dokan_get_category_wise_seller_commission( $product_id, $category_id );

        if ( ! empty( $category_commission ) && $category_commission ) {
            $type = dokan_get_category_wise_seller_commission_type( $product_id, $category_id );
            $type = empty( $type ) ? 'percentage' : $type;

            if ( 'flat' == $type || ( 'percentage' == $type && $category_commission <= 100 ) ) {
                return $type;
            }
        }
    }

    //return seller wise percentage
    if ( $seller_id ) {
        $admin_commission = get_user_meta( $seller_id, 'dokan_admin_percentage', true );

        if ( $admin_commission != '' ) {
            $type = get_user_meta( $seller_id, 'dokan_admin_percentage_type', true );
            $type = empty( $type ) ? 'percentage' : $type;

            if ( 'flat' == $type || ( 'percentage' == $type && $admin_commission <= 100 ) ) {
                return $type;
            }
        }
    }

    $global_type = dokan_get_option( 'commission_type', 'dokan_selling', 'percentage' );

    return $global_type;
}

/**
 * Get product status based on user id and settings
 *
 * @return string
 */
function dokan_get_new_post_status() {
    $user_id = get_current_user_id();

    // trusted seller
    if ( dokan_is_seller_trusted( $user_id ) ) {
        return 'publish';
    }

    // if not trusted, send the option
    $status = dokan_get_option( 'product_status', 'dokan_selling', 'pending' );

    return $status;
}

/**
 * Function to get the client ip address
 *
 * @return string
 */
function dokan_get_client_ip() {
    $ipaddress = '';
    $_server   = $_SERVER;

    if ( isset( $_server['HTTP_CLIENT_IP'] ) ) {
        $ipaddress = $_server['HTTP_CLIENT_IP'];
    } elseif ( isset( $_server['HTTP_X_FORWARDED_FOR'] ) ) {
        $ipaddress = $_server['HTTP_X_FORWARDED_FOR'];
    } elseif ( isset( $_server['HTTP_X_FORWARDED'] ) ) {
        $ipaddress = $_server['HTTP_X_FORWARDED'];
    } elseif ( isset( $_server['HTTP_FORWARDED_FOR'] ) ) {
        $ipaddress = $_server['HTTP_FORWARDED_FOR'];
    } elseif ( isset( $_server['HTTP_FORWARDED'] ) ) {
        $ipaddress = $_server['HTTP_FORWARDED'];
    } elseif ( isset( $_server['REMOTE_ADDR'] ) ) {
        $ipaddress = $_server['REMOTE_ADDR'];
    } else {
        $ipaddress = 'UNKNOWN';
    }

    return $ipaddress;
}

/**
 * Datetime format helper function
 *
 * @param string $datetime
 *
 * @return string
 */
function dokan_format_time( $datetime ) {
    $timestamp   = strtotime( $datetime );
    $date_format = get_option( 'date_format' );
    $time_format = get_option( 'time_format' );

    return date_i18n( $date_format . ' ' . $time_format, $timestamp );
}

/**
 * generate a input box based on arguments
 *
 * @param int    $post_id
 * @param string $meta_key
 * @param array  $attr
 * @param string $type
 */
function dokan_post_input_box( $post_id, $meta_key, $attr = [], $type = 'text' ) {
    $placeholder = isset( $attr['placeholder'] ) ? esc_attr( $attr['placeholder'] ) : '';
    $class       = isset( $attr['class'] ) ? esc_attr( $attr['class'] ) : 'dokan-form-control';
    $name        = isset( $attr['name'] ) ? esc_attr( $attr['name'] ) : $meta_key;
    $value       = isset( $attr['value'] ) ? $attr['value'] : get_post_meta( $post_id, $meta_key, true );
    $size        = isset( $attr['size'] ) ? $attr['size'] : 30;
    $required    = isset( $attr['required'] ) ? 'required' : '';

    switch ( $type ) {
        case 'text':
            ?>
            <input <?php echo esc_attr( $required ); ?> type="text" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" class="<?php echo esc_attr( $class ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>">
            <?php
            break;

        case 'price':
            ?>
            <input <?php echo esc_attr( $required ); ?> type="text" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( wc_format_localized_price( $value ) ); ?>" class="wc_input_price <?php echo esc_attr( $class ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>">
            <?php
            break;

        case 'decimal':
            ?>
            <input <?php echo esc_attr( $required ); ?> type="text" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( wc_format_localized_price( $value ) ); ?>" class="wc_input_decimal <?php echo esc_attr( $class ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>">
            <?php
            break;

        case 'textarea':
            $rows = isset( $attr['rows'] ) ? absint( $attr['rows'] ) : 4;
            ?>
            <textarea <?php echo esc_attr( $required ); ?> name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" rows="<?php echo esc_attr( $rows ); ?>" class="<?php echo esc_attr( $class ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>"><?php echo esc_textarea( $value ); ?></textarea>
            <?php
            break;

        case 'checkbox':
            $label = isset( $attr['label'] ) ? $attr['label'] : '';
            $class = ( $class == 'dokan-form-control' ) ? '' : $class;
            ?>

            <label class="<?php echo esc_attr( $class ); ?>" for="<?php echo esc_attr( $name ); ?>">
                <input type="hidden" name="<?php echo esc_attr( $name ); ?>" value="no">
                <input <?php echo esc_attr( $required ); ?> name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="yes" type="checkbox"<?php checked( $value, 'yes' ); ?>>
                <?php echo esc_html( $label ); ?>
            </label>

            <?php
            break;

        case 'select':
            $options = is_array( $attr['options'] ) ? $attr['options'] : [];
            ?>
            <select name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" class="<?php echo esc_attr( $class ); ?>">
                <?php foreach ( $options as $key => $label ) { ?>
                    <option value="<?php echo esc_attr( $key ); ?>"<?php selected( $value, $key ); ?>><?php echo esc_html( $label ); ?></option>
                <?php } ?>
            </select>

            <?php
            break;

        case 'number':
            $min  = isset( $attr['min'] ) ? $attr['min'] : 0;
            $step = isset( $attr['step'] ) ? $attr['step'] : 'any';
            ?>
            <input <?php echo esc_attr( $required ); ?> type="number" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" class="<?php echo esc_attr( $class ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>" min="<?php echo esc_attr( $min ); ?>" step="<?php echo esc_attr( $step ); ?>" size="<?php echo esc_attr( $size ); ?>">
            <?php
            break;

        case 'radio':
            $options = is_array( $attr['options'] ) ? $attr['options'] : [];

            foreach ( $options as $key => $label ) {
                ?>
                <label class="<?php echo esc_attr( $class ); ?>" for="<?php echo esc_attr( $key ); ?>">
                    <input name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $key ); ?>" type="radio"<?php checked( $value, $key ); ?>>
                    <?php echo esc_html( $label ); ?>
                </label>

                <?php
            }
            break;
    }
}

/**
 * Get user friendly post status based on post
 *
 * @param string $status
 *
 * @return string|array
 */
function dokan_get_post_status( $status = '' ) {
    $statuses = apply_filters(
        'dokan_get_post_status', [
            'publish' => __( 'Online', 'dokan-lite' ),
            'draft'   => __( 'Draft', 'dokan-lite' ),
            'pending' => __( 'Pending Review', 'dokan-lite' ),
            'future'  => __( 'Scheduled', 'dokan-lite' ),
        ]
    );

    if ( $status ) {
        return isset( $statuses[ $status ] ) ? $statuses[ $status ] : '';
    }

    return $statuses;
}

/**
 * Get user friendly post status label based class
 *
 * @param string $status
 *
 * @return string|array
 */
function dokan_get_post_status_label_class( $status = '' ) {
    $labels = apply_filters(
        'dokan_get_post_status_label_class', [
            'publish' => 'dokan-label-success',
            'draft'   => 'dokan-label-default',
            'pending' => 'dokan-label-danger',
            'future'  => 'dokan-label-warning',
        ]
    );

    if ( $status ) {
        return isset( $labels[ $status ] ) ? $labels[ $status ] : '';
    }

    return $labels;
}

/**
 * Get readable product type based on product
 *
 * @param string $status
 *
 * @return string
 */
function dokan_get_product_types( $status = '' ) {
    $types = apply_filters(
        'dokan_get_product_types', [
            'simple'   => __( 'Simple Product', 'dokan-lite' ),
            'variable' => __( 'Variable Product', 'dokan-lite' ),
            'grouped'  => __( 'Grouped Product', 'dokan-lite' ),
            'external' => __( 'External/Affiliate Product', 'dokan-lite' ),
        ]
    );

    if ( $status ) {
        return isset( $types[ $status ] ) ? $types[ $status ] : '';
    }

    return $types;
}

/**
 * Helper function for input text field
 *
 * @param string $key
 *
 * @return string
 */
function dokan_posted_input( $key, $array = false ) {
    $postdata = wp_unslash( $_POST ); // WPCS: CSRF ok.

    // If array value is submitted return array
    if ( $array && isset( $postdata[ $key ] ) ) {
        return $postdata[ $key ];
    }

    $value = isset( $postdata[ $key ] ) ? trim( $postdata[ $key ] ) : ''; // WPCS: CSRF ok.

    return esc_attr( $value );
}

/**
 * Helper function for input textarea
 *
 * @param string $key
 *
 * @return string
 */
function dokan_posted_textarea( $key ) {
    $postdata = wp_unslash( $_POST ); // WPCS: CSRF ok.
    $value    = isset( $postdata[ $key ] ) ? trim( $postdata[ $key ] ) : ''; // WPCS: CSRF ok.

    return esc_textarea( $value );
}

/**
 * Get template part implementation for wedocs
 *
 * Looks at the theme directory first
 */
function dokan_get_template_part( $slug, $name = '', $args = [] ) {
    $defaults = [
        'pro' => false,
    ];

    $args = wp_parse_args( $args, $defaults );

    if ( $args && is_array( $args ) ) {
        extract( $args );
    }

    $template = '';

    // Look in yourtheme/dokan/slug-name.php and yourtheme/dokan/slug.php
    $template = locate_template( [ dokan()->template_path() . "{$slug}-{$name}.php", dokan()->template_path() . "{$slug}.php" ] );

    /**
     * Change template directory path filter
     *
     * @since 2.5.3
     */
    $template_path = apply_filters( 'dokan_set_template_path', dokan()->plugin_path() . '/templates', $template, $args );

    // Get default slug-name.php
    if ( ! $template && $name && file_exists( $template_path . "/{$slug}-{$name}.php" ) ) {
        $template = $template_path . "/{$slug}-{$name}.php";
    }

    if ( ! $template && ! $name && file_exists( $template_path . "/{$slug}.php" ) ) {
        $template = $template_path . "/{$slug}.php";
    }

    // Allow 3rd party plugin filter template file from their plugin
    $template = apply_filters( 'dokan_get_template_part', $template, $slug, $name );

    if ( $template ) {
        include $template;
    }
}

/**
 * Get other templates (e.g. product attributes) passing attributes and including the file.
 *
 * @param mixed  $template_name
 * @param array  $args          (default: array())
 * @param string $template_path (default: '')
 * @param string $default_path  (default: '')
 *
 * @return void
 */
function dokan_get_template( $template_name, $args = [], $template_path = '', $default_path = '' ) {
    if ( $args && is_array( $args ) ) {
        extract( $args );
    }

    $located = dokan_locate_template( $template_name, $template_path, $default_path );

    if ( ! file_exists( $located ) ) {
        _doing_it_wrong( __FUNCTION__, sprintf( '<code>%s</code> does not exist.', esc_html( $located ) ), '2.1' );

        return;
    }

    do_action( 'dokan_before_template_part', $template_name, $template_path, $located, $args );

    include $located;

    do_action( 'dokan_after_template_part', $template_name, $template_path, $located, $args );
}

/**
 * Locate a template and return the path for inclusion.
 *
 * This is the load order:
 *
 *      yourtheme       /   $template_path  /   $template_name
 *      yourtheme       /   $template_name
 *      $default_path   /   $template_name
 *
 * @param mixed  $template_name
 * @param string $template_path (default: '')
 * @param string $default_path  (default: '')
 *
 * @return string
 */
function dokan_locate_template( $template_name, $template_path = '', $default_path = '', $pro = false ) {
    if ( ! $template_path ) {
        $template_path = dokan()->template_path();
    }

    if ( ! $default_path ) {
        $default_path = dokan()->plugin_path() . '/templates/';
    }

    // Look within passed path within the theme - this is priority
    $template = locate_template(
        [
            trailingslashit( $template_path ) . $template_name,
        ]
    );

    // Get default template
    if ( ! $template ) {
        $template = $default_path . $template_name;
    }

    // Return what we found
    return apply_filters( 'dokan_locate_template', $template, $template_name, $template_path );
}

/**
 * Get page permalink based on context
 *
 * @param string $page
 * @param string $context
 *
 * @return string url of the page
 */
function dokan_get_page_url( $page, $context = 'dokan' ) {
    if ( $context == 'woocommerce' ) {
        $page_id = wc_get_page_id( $page );
    } else {
        $page_id = dokan_get_option( $page, 'dokan_pages' );
    }

    return apply_filters( 'dokan_get_page_url', get_permalink( $page_id ), $page_id, $context );
}

/**
 * Get edit product url
 *
 * @param int|WC_Product $product
 *
 * @return string|false on filure
 */
function dokan_edit_product_url( $product ) {
    if ( ! $product instanceof WC_Product ) {
        $product = wc_get_product( $product );
    }

    if ( ! $product ) {
        return false;
    }


    $url = add_query_arg(
        [
            'product_id' => $product->get_id(),
            'action'     => 'edit',
        ],
        dokan_get_navigation_url( 'products' )
    );


    return apply_filters( 'dokan_get_edit_product_url', $url, $product );
}

/**
 * Ads additional columns to admin user table
 *
 * @param array $columns
 *
 * @return array
 */
function dokan_admin_product_columns( $columns ) {
    $columns['author'] = __( 'Author', 'dokan-lite' );

    return $columns;
}

add_filter( 'manage_edit-product_columns', 'dokan_admin_product_columns' );

/**
 * Get the value of a settings field
 *
 * @param string $option  settings field name
 * @param string $section the section name this field belongs to
 * @param string $default default text if it's not found
 *
 * @return mixed
 */
function dokan_get_option( $option, $section, $default = '' ) {
    list( $option, $section ) = dokan_admin_settings_rearrange_map( $option, $section );

    $options = get_option( $section );

    if ( isset( $options[ $option ] ) ) {
        return $options[ $option ];
    }

    return $default;
}

/**
 * Redirect users from standard WordPress register page to woocommerce
 * my account page
 *
 * @global string $action
 */
function dokan_redirect_to_register() {
    global $action;

    if ( $action == 'register' ) {
        wp_redirect( dokan_get_page_url( 'myaccount', 'woocommerce' ) );
        exit;
    }
}

add_action( 'login_init', 'dokan_redirect_to_register' );

/**
 * Check if the seller is enabled
 *
 * @param int $user_id
 *
 * @return bool
 */
function dokan_is_seller_enabled( $user_id ) {
    $selling = get_user_meta( $user_id, 'dokan_enable_selling', true );

    if ( $selling == 'yes' ) {
        return true;
    }

    return false;
}

/**
 * Check if the seller is trusted
 *
 * @param int $user_id
 *
 * @return bool
 */
function dokan_is_seller_trusted( $user_id ) {
    $publishing = get_user_meta( $user_id, 'dokan_publishing', true );

    if ( $publishing == 'yes' ) {
        return true;
    }

    return false;
}

/**
 * Get store page url of a seller
 *
 * @param int $user_id
 *
 * @return string
 */
function dokan_get_store_url( $user_id ) {
    if ( ! $user_id ) {
        return '';
    }

    $userdata         = get_userdata( $user_id );
    $user_nicename    = ( ! false == $userdata ) ? $userdata->user_nicename : '';
    $custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

    return home_url( '/' . $custom_store_url . '/' . $user_nicename . '/' );
}

/**
 * Check if current page is store review page
 *
 * @since 2.2
 *
 * @return bool
 */
function dokan_is_store_review_page() {
    if ( get_query_var( 'store_review' ) == 'true' ) {
        return true;
    }

    return false;
}

/**
 * Helper function for logging
 *
 * For valid levels, see `WC_Log_Levels` class
 *
 * Description of levels:
 *     'emergency': System is unusable.
 *     'alert': Action must be taken immediately.
 *     'critical': Critical conditions.
 *     'error': Error conditions.
 *     'warning': Warning conditions.
 *     'notice': Normal but significant condition.
 *     'info': Informational messages.
 *     'debug': Debug-level messages.
 *
 * @param string $message
 */
function dokan_log( $message, $level = 'debug' ) {
    $logger  = wc_get_logger();
    $context = [ 'source' => 'dokan' ];

    return $logger->log( $level, $message, $context );
}

/**
 * Filter WP Media Manager files if the current user is seller.
 *
 * Do not show other sellers images to a seller. He can see images only by him
 *
 * @param array $args
 *
 * @return array
 */
function dokan_media_uploader_restrict( $args ) {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return $args;
    }

    if ( current_user_can( 'dokandar' ) ) {
        $args['author'] = dokan_get_current_user_id();

        return $args;
    }

    return $args;
}

add_filter( 'ajax_query_attachments_args', 'dokan_media_uploader_restrict' );

/**
 * Get store info based on seller ID
 *
 * @param int $seller_id
 *
 * @return array
 */
function dokan_get_store_info( $seller_id ) {
    return dokan()->vendor->get( $seller_id )->get_shop_info();
}

/**
 * Get tabs for showing in a single store page
 *
 * @since 2.2
 *
 * @param int $store_id
 *
 * @return array
 */
function dokan_get_store_tabs( $store_id ) {
    $tabs = [
        'products' => [
            'title' => __( 'Products', 'dokan-lite' ),
            'url'   => dokan_get_store_url( $store_id ),
        ],
        'terms_and_conditions' => [
            'title' => __( 'Terms and Conditions', 'dokan-lite' ),
            'url'   => dokan_get_toc_url( $store_id ),
        ],
    ];

    return apply_filters( 'dokan_store_tabs', $tabs, $store_id );
}

/**
 * Get withdraw email method based on seller ID and type
 *
 * @param int    $seller_id
 * @param string $type
 *
 * @return string
 */
function dokan_get_seller_withdraw_mail( $seller_id, $type = 'paypal' ) {
    $info = dokan_get_store_info( $seller_id );

    if ( isset( $info['payment'][ $type ]['email'] ) ) {
        return $info['payment'][ $type ]['email'];
    }

    return false;
}

/**
 * Get seller bank details
 *
 * @param int $seller_id
 *
 * @return string
 */
function dokan_get_seller_bank_details( $seller_id ) {
    $info    = dokan_get_store_info( $seller_id );
    $payment = $info['payment']['bank'];
    $details = [];

    if ( isset( $payment['ac_name'] ) ) {
        $details[] = sprintf( __( 'Account Name: %s', 'dokan-lite' ), $payment['ac_name'] );
    }

    if ( isset( $payment['ac_number'] ) ) {
        $details[] = sprintf( __( 'Account Number: %s', 'dokan-lite' ), $payment['ac_number'] );
    }

    if ( isset( $payment['bank_name'] ) ) {
        $details[] = sprintf( __( 'Bank Name: %s', 'dokan-lite' ), $payment['bank_name'] );
    }

    if ( isset( $payment['bank_addr'] ) ) {
        $details[] = sprintf( __( 'Address: %s', 'dokan-lite' ), $payment['bank_addr'] );
    }

    if ( isset( $payment['routing_number'] ) ) {
        $details[] = sprintf( __( 'Routing Number: %s', 'dokan-lite' ), $payment['routing_number'] );
    }

    if ( isset( $payment['iban'] ) ) {
        $details[] = sprintf( __( 'IBAN: %s', 'dokan-lite' ), $payment['iban'] );
    }

    if ( isset( $payment['swift'] ) ) {
        $details[] = sprintf( __( 'SWIFT: %s', 'dokan-lite' ), $payment['swift'] );
    }

    return nl2br( implode( "\n", $details ) );
}

/**
 * Get seller listing
 *
 * @param array $args
 *
 * @return array
 */
function dokan_get_sellers( $args = [] ) {
    $vendors    = dokan()->vendor;
    $all_vendor = wp_list_pluck( $vendors->get_vendors( $args ), 'data' );

    return [
        'users' => $all_vendor,
        'count' => $vendors->get_total(),
    ];
}

/**
 * Put data with post_date's into an array of times
 *
 * @param array  $data       array of your data
 * @param string $date_key   key for the 'date' field. e.g. 'post_date'
 * @param string $data_key   key for the data you are charting
 * @param int    $interval
 * @param string $start_date
 * @param string $group_by
 *
 * @return string
 */
function dokan_prepare_chart_data( $data, $date_key, $data_key, $interval, $start_date, $group_by ) {
    $prepared_data = [];

    // Ensure all days (or months) have values first in this range
    if ( 'day' === $group_by ) {
        for ( $i = 0; $i <= $interval; $i ++ ) {
            $time = strtotime( date( 'Ymd', strtotime( "+{$i} DAY", $start_date ) ) ) . '000';

            if ( ! isset( $prepared_data[ $time ] ) ) {
                $prepared_data[ $time ] = [ esc_js( $time ), 0 ];
            }
        }
    } else {
        $current_yearnum  = date( 'Y', $start_date );
        $current_monthnum = date( 'm', $start_date );

        for ( $i = 0; $i <= $interval; $i ++ ) {
            $time = strtotime( $current_yearnum . str_pad( $current_monthnum, 2, '0', STR_PAD_LEFT ) . '01' ) . '000';

            if ( ! isset( $prepared_data[ $time ] ) ) {
                $prepared_data[ $time ] = [ esc_js( $time ), 0 ];
            }

            $current_monthnum ++;

            if ( $current_monthnum > 12 ) {
                $current_monthnum = 1;
                $current_yearnum  ++;
            }
        }
    }

    foreach ( $data as $d ) {
        switch ( $group_by ) {
            case 'day':
                $time = strtotime( date( 'Ymd', strtotime( $d->$date_key ) ) ) . '000';
                break;

            case 'month':
            default:
                $time = strtotime( date( 'Ym', strtotime( $d->$date_key ) ) . '01' ) . '000';
                break;
        }

        if ( ! isset( $prepared_data[ $time ] ) ) {
            continue;
        }

        if ( $data_key ) {
            $prepared_data[ $time ][1] += $d->$data_key;
        } else {
            $prepared_data[ $time ][1] ++;
        }
    }

    return $prepared_data;
}

/**
 * Disable selling capability by default once a seller is registered
 *
 * @param int $user_id
 */
function dokan_admin_user_register( $user_id ) {
    $user = new WP_User( $user_id );
    $role = reset( $user->roles );

    if ( $role == 'seller' ) {
        if ( dokan_get_option( 'new_seller_enable_selling', 'dokan_selling' ) == 'off' ) {
            update_user_meta( $user_id, 'dokan_enable_selling', 'no' );
        } else {
            update_user_meta( $user_id, 'dokan_enable_selling', 'yes' );
        }
    }
}

add_action( 'user_register', 'dokan_admin_user_register' );

/**
 * Get percentage based owo two numeric data
 *
 * @param int $this_period
 * @param int $last_period
 *
 * @return array
 */
function dokan_get_percentage_of( $this_period = 0, $last_period = 0 ) {
    if ( 0 == $this_period && 0 == $last_period || $this_period == $last_period ) {
        $parcent = 0;
        $class   = 'up';
    } elseif ( 0 == $this_period ) {
        $parcent = $last_period * 100;
        $class   = 'down';
    } elseif ( 0 == $last_period ) {
        $parcent = $this_period * 100;
        $class   = 'up';
    } elseif ( $this_period > $last_period ) {
        $parcent = ( $this_period - $last_period ) / $last_period * 100;
        $class   = 'up';
    } elseif ( $this_period < $last_period ) {
        $parcent = ( $last_period - $this_period ) / $last_period * 100;
        $class   = 'down';
    }

    $parcent = round( $parcent, 2 ); //'integer' == gettype($parcent) ? $parcent : number_format($parcent,2)

    return [
        'parcent' => $parcent,
        'class'   => $class,
    ];
}

/**
 * Get seller count based on enable, disabled sellers and time period
 *
 * @param string $from
 * @param string $to
 *
 * @return array
 */
function dokan_get_seller_count( $from = null, $to = null ) {
    $inactive_sellers = dokan_get_sellers(
        [
            'number' => -1,
            'status' => 'pending',
        ]
    );

    $active_sellers = dokan_get_sellers(
        [
            'number' => -1,
        ]
    );

    $this_month = dokan_get_sellers(
        [
            'date_query' => [
                [
                    'year'  => date( 'Y' ),
                    'month' => date( 'm' ),
                ],
            ],
        ]
    );

    $last_month = dokan_get_sellers(
        [
            'date_query' => [
                [
                    'year'  => date( 'Y', strtotime( 'last month' ) ),
                    'month' => date( 'm', strtotime( 'last month' ) ),
                ],
            ],
        ]
    );

    if ( $from && $to ) {
        $prepared_date = dokan_prepare_date_query( $from, $to );

        $this_period = dokan_get_sellers(
            [
                'date_query' => [
                    [
                        'after' => [
                            'year'  => $prepared_date['from_year'],
                            'month' => $prepared_date['from_month'],
                            'day'   => $prepared_date['from_day'],
                        ],
                        'before' => [
                            'year'  => $prepared_date['to_year'],
                            'month' => $prepared_date['to_month'],
                            'day'   => $prepared_date['to_day'],
                        ],
                    ],
                ],
            ]
        );

        $last_period = dokan_get_sellers(
            [
                'date_query' => [
                    [
                        'after' => [
                            'year'  => $prepared_date['last_from_year'],
                            'month' => $prepared_date['last_from_month'],
                            'day'   => $prepared_date['last_from_day'],
                        ],
                        'before' => [
                            'year'  => $prepared_date['last_to_year'],
                            'month' => $prepared_date['last_to_month'],
                            'day'   => $prepared_date['last_to_day'],
                        ],
                    ],
                ],
            ]
        );

        $vendor_parcent = dokan_get_percentage_of( $this_period['count'], $last_period['count'] );
    } else {
        $vendor_parcent = dokan_get_percentage_of( $this_month['count'], $last_month['count'] );
    }

    return [
        'inactive'    => $inactive_sellers['count'],
        'active'      => $active_sellers['count'],
        'this_month'  => $this_month['count'],
        'last_month'  => $last_month['count'],
        'this_period' => $from && $to ? $this_period['count'] : null,
        'class'       => $vendor_parcent['class'],
        'parcent'     => $vendor_parcent['parcent'],
    ];
}

/**
 * Get product count of this month and last month with percentage
 *
 * @param string $from
 * @param string $to
 *
 * @return array
 */
function dokan_get_product_count( $from = null, $to = null, $seller_id = null ) {
    $this_month_posts = dokan()->product->all(
        [
            'date_query' => [
                [
                    'year'  => date( 'Y' ),
                    'month' => date( 'm' ),
                ],
            ],
            'author' => $seller_id ? $seller_id : '',
            'fields' => 'ids',
        ]
    );

    $last_month_posts = dokan()->product->all(
        [
            'date_query' => [
                [
                    'year'  => date( 'Y', strtotime( 'last month' ) ),
                    'month' => date( 'm', strtotime( 'last month' ) ),
                ],
            ],
            'author' => $seller_id ? $seller_id : '',
            'fields' => 'ids',
        ]
    );

    if ( $from && $to ) {
        $prepared_date = dokan_prepare_date_query( $from, $to );

        $this_period = dokan()->product->all(
            [
                'date_query' => [
                    [
                        'after' => [
                            'year'  => $prepared_date['from_year'],
                            'month' => $prepared_date['from_month'],
                            'day'   => $prepared_date['from_day'],
                        ],
                        'before' => [
                            'year'  => $prepared_date['to_year'],
                            'month' => $prepared_date['to_month'],
                            'day'   => $prepared_date['to_day'],
                        ],
                    ],
                ],
                'author' => $seller_id ? $seller_id : '',
                'fields' => 'ids',
            ]
        );

        $last_period = dokan()->product->all(
            [
                'date_query' => [
                    [
                        'after' => [
                            'year'  => $prepared_date['last_from_year'],
                            'month' => $prepared_date['last_from_month'],
                            'day'   => $prepared_date['last_from_day'],
                        ],
                        'before' => [
                            'year'  => $prepared_date['last_to_year'],
                            'month' => $prepared_date['last_to_month'],
                            'day'   => $prepared_date['last_to_day'],
                        ],
                    ],
                ],
                'author' => $seller_id ? $seller_id : '',
                'fields' => 'ids',
            ]
        );

        $product_parcent = dokan_get_percentage_of( $this_period->found_posts, $last_period->found_posts );
    } else {
        $product_parcent = dokan_get_percentage_of( $this_month_posts->found_posts, $last_month_posts->found_posts );
    }

    return [
        'this_month'  => $this_month_posts->found_posts,
        'last_month'  => $last_month_posts->found_posts,
        'this_period' => $from && $to ? $this_period->found_posts : null,
        'class'       => $product_parcent['class'],
        'parcent'     => $product_parcent['parcent'],
    ];
}

/**
 * Dokan prepare date query
 *
 * @param string $from
 * @param string $to
 *
 * @return array
 */
function dokan_prepare_date_query( $from, $to ) {
    if ( ! $from || ! $to ) {
        return;
    }

    $from_date     = date_create( $from );
    $raw_from_date = date_create( $from );
    $to_date       = date_create( $to );
    $raw_to_date   = date_create( $to );

    if ( ! $from_date || ! $to_date ) {
        return wp_send_json( __( 'Date is not valid', 'dokan-lite' ) );
    }

    $from_year  = $from_date->format( 'Y' );
    $from_month = $from_date->format( 'm' );
    $from_day   = $from_date->format( 'd' );

    $to_year    = $to_date->format( 'Y' );
    $to_month   = $to_date->format( 'm' );
    $to_day     = $to_date->format( 'd' );

    $date_diff      = date_diff( $from_date, $to_date );
    $last_from_date = $from_date->sub( $date_diff );
    $last_to_date   = $to_date->sub( $date_diff );

    $last_from_year  = $last_from_date->format( 'Y' );
    $last_from_month = $last_from_date->format( 'm' );
    $last_from_day   = $last_from_date->format( 'd' );

    $last_to_year    = $last_to_date->format( 'Y' );
    $last_to_month   = $last_to_date->format( 'm' );
    $last_to_day     = $last_to_date->format( 'd' );

    $prepared_data = [
        'from_year'           => $from_year,
        'from_month'          => $from_month,
        'from_day'            => $from_day,
        'to_year'             => $to_year,
        'to_month'            => $to_month,
        'to_day'              => $to_day,
        'from_full_date'      => $raw_from_date->format( 'Y-m-d' ),
        'to_full_date'        => $raw_to_date->format( 'Y-m-d' ),
        'last_from_year'      => $last_from_year,
        'last_from_month'     => $last_from_month,
        'last_from_day'       => $last_from_day,
        'last_from_full_date' => $last_from_date->format( 'Y-m-d' ),
        'last_to_year'        => $last_to_year,
        'last_to_month'       => $last_to_month,
        'last_to_day'         => $last_to_day,
        'last_to_full_date'   => $last_to_date->format( 'Y-m-d' ),
    ];

    return $prepared_data;
}

/**
 * Get seles count based on this month and last month
 *
 * @global WPDB $wpdb
 *
 * @return array
 */
function dokan_get_sales_count( $from = null, $to = null, $seller_id = 0 ) {
    $this_month_report_data = dokan_admin_report_data( 'day', '', '', '', $seller_id );

    $this_month_order_total = $this_month_earning_total = $this_month_total_orders = 0;

    if ( $this_month_report_data ) {
        foreach ( $this_month_report_data as $row ) {
            $this_month_order_total += $row->order_total;
            $this_month_earning_total += $row->earning;
            $this_month_total_orders += $row->total_orders;
        }
    }

    $last_month_report_data = dokan_admin_report_data( 'day', '', date( 'Y-m-d', strtotime( 'first day of previous month' ) ), date( 'Y-m-d', strtotime( 'last day of previous month' ) ), $seller_id );
    $last_month_order_total = $last_month_earning_total = $last_month_total_orders = 0;

    if ( $last_month_report_data ) {
        foreach ( $last_month_report_data as $row ) {
            $last_month_order_total += $row->order_total;
            $last_month_earning_total += $row->earning;
            $last_month_total_orders += $row->total_orders;
        }
    }

    if ( $from && $to ) {
        $date             = dokan_prepare_date_query( $from, $to );
        $this_period_data = dokan_admin_report_data( 'day', $date['from_year'], $date['from_full_date'], $date['to_full_date'], $seller_id );
        $last_period_data = dokan_admin_report_data( 'day', $date['last_from_year'], $date['last_from_full_date'], $date['last_to_full_date'], $seller_id );

        $this_period_order_total = $this_period_earning_total = $this_period_total_orders = 0;
        $last_period_order_total = $last_period_earning_total = $last_period_total_orders = 0;

        if ( $this_period_data ) {
            foreach ( $this_period_data as $row ) {
                $this_period_order_total += $row->order_total;
                $this_period_earning_total += $row->earning;
                $this_period_total_orders += $row->total_orders;
            }
        }

        if ( $last_period_data ) {
            foreach ( $last_period_data as $row ) {
                $last_period_order_total += $row->order_total;
                $last_period_earning_total += $row->earning;
                $last_period_total_orders += $row->total_orders;
            }
        }

        $sale_percentage    = dokan_get_percentage_of( $this_period_order_total, $last_period_order_total );
        $earning_percentage = dokan_get_percentage_of( $this_period_earning_total, $last_period_earning_total );
        $order_percentage   = dokan_get_percentage_of( $this_period_total_orders, $last_period_total_orders );
    } else {
        $sale_percentage    = dokan_get_percentage_of( $this_month_order_total, $last_month_order_total );
        $earning_percentage = dokan_get_percentage_of( $this_month_earning_total, $last_month_earning_total );
        $order_percentage   = dokan_get_percentage_of( $this_month_total_orders, $last_month_total_orders );
    }

    $data = [
        'sales'    => [
            'this_month'  => $this_month_order_total,
            'last_month'  => $last_month_order_total,
            'this_period' => $from && $to ? $this_period_order_total : null,
            'class'       => $sale_percentage['class'],
            'parcent'     => $sale_percentage['parcent'],
        ],
        'orders'    => [
            'this_month'  => $this_month_total_orders,
            'last_month'  => $last_month_total_orders,
            'this_period' => $from && $to ? $this_period_total_orders : null,
            'class'       => $order_percentage['class'],
            'parcent'     => $order_percentage['parcent'],
        ],
        'earning'   => [
            'this_month'  => $this_month_earning_total,
            'last_month'  => $last_month_earning_total,
            'this_period' => $from && $to ? $this_period_earning_total : null,
            'class'       => $earning_percentage['class'],
            'parcent'     => $earning_percentage['parcent'],
        ],
    ];

    return $data;

    // $data = array(
    //     'this_month_order_total'    => $this_month_order_total,
    //     'this_month_total_orders'   => $this_month_total_orders,
    //     'last_month_order_total'    => $last_month_order_total,

    //     'this_month_earning_total'  => $this_month_earning_total,
    //     'last_month_earning_total'  => $last_month_earning_total,
    //     'last_month_total_orders'   => $last_month_total_orders,

    //     'sale_parcent_class'        => $sale_percentage['class'],
    //     'sale_parcent'              => $sale_percentage['parcent'],

    //     'earning_parcent_class'     => $earning_percentage['class'],
    //     'earning_parcent'           => $earning_percentage['parcent'],

    //     'order_parcent_class'       => $order_percentage['class'],
    //     'order_parcent'             => $order_percentage['parcent'],
    // );

    // return $data;
}

/**
 * Prevent sellers and customers from seeing the admin bar
 *
 * @param bool $show_admin_bar
 *
 * @return bool
 */
function dokan_disable_admin_bar( $show_admin_bar ) {
    global $current_user;

    if ( $current_user->ID !== 0 ) {
        $role = reset( $current_user->roles );

        if ( dokan_get_option( 'admin_access', 'dokan_general' ) == 'on' ) {
            if ( in_array( $role, [ 'seller', 'customer', 'vendor_staff' ] ) ) {
                return false;
            }
        }
    }

    return $show_admin_bar;
}

add_filter( 'show_admin_bar', 'dokan_disable_admin_bar' );

/**
 * Filter products of current user
 *
 * @param object $query
 *
 * @since 2.7.3
 *
 * @return object $query
 */
function dokan_filter_product_for_current_vendor( $query ) {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return $query;
    }

    if ( ! isset( $query->query_vars['post_type'] ) ) {
        return $query;
    }

    if ( is_admin() && $query->is_main_query() && $query->query_vars['post_type'] == 'product' ) {
        $query->set( 'author', get_current_user_id() );
    }

    return $query;
}

add_filter( 'pre_get_posts', 'dokan_filter_product_for_current_vendor' );

/**
 * Filter orders of current user
 *
 * @param object $args
 * @param object $query
 *
 * @since 2.9.4
 *
 * @return object $args
 */
function dokan_filter_orders_for_current_vendor( $args, $query ) {
    global $wpdb;

    if ( ! is_admin() || ! $query->is_main_query() ) {
        return $args;
    }

    if ( ! isset( $query->query_vars['post_type'] ) ) {
        return $args;
    }

    if ( ! in_array( $query->query_vars['post_type'], [ 'shop_order', 'wc_booking' ] ) ) {
        return $args;
    }

    $vendor_id = 0;

    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        $vendor_id = dokan_get_current_user_id();
    } elseif ( ! empty( $_GET['vendor_id'] ) ) {
        $get       = wp_unslash( $_GET );
        $vendor_id = absint( $get['vendor_id'] );
    }

    if ( ! $vendor_id ) {
        return $args;
    }

    $args['join'] .= " LEFT JOIN {$wpdb->prefix}dokan_orders as do ON $wpdb->posts.ID=do.order_id";
    $args['where'] .= " AND do.seller_id=$vendor_id";

    return $args;
}

add_filter( 'posts_clauses', 'dokan_filter_orders_for_current_vendor', 12, 2 );

/**
 * Dokan map meta cpas for vendors
 *
 * @param array  $caps
 * @param string $cap
 * @param int    $user_id
 * @param array  $args
 *
 * @return array
 */
function dokan_map_meta_caps( $caps, $cap, $user_id, $args ) {
    global $post;

    if ( ! is_admin() ) {
        return $caps;
    }

    $post_id = ! empty( $args[0] ) ? $args[0] : 0;

    if ( $cap === 'edit_post' || $cap === 'edit_others_shop_orders' ) {
        $post_id = ! empty( $args[0] ) ? $args[0] : 0;

        if ( empty( $post_id ) ) {
            if ( empty( $post->ID ) ) {
                return $caps;
            }

            $post_id = $post->ID;
        }

        $vendor_id       = get_post_meta( $post_id, '_dokan_vendor_id', true );
        $current_user_id = get_current_user_id();

        if ( absint( $vendor_id ) === absint( $current_user_id ) ) {
            return [ 'edit_shop_orders' ];
        }
    }

    return $caps;
}

add_filter( 'map_meta_cap', 'dokan_map_meta_caps', 12, 4 );

/**
 * Remove sellerdiv metabox when a seller can access the backend
 *
 * @since 2.7.8
 *
 * @return void
 */
function dokan_remove_sellerdiv_metabox() {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return;
    }

    if ( is_admin() && get_post_type() == 'product' && ! defined( 'DOING_AJAX' ) ) {
        remove_meta_box( 'sellerdiv', 'product', 'normal' );
    }
}

add_action( 'do_meta_boxes', 'dokan_remove_sellerdiv_metabox' );

/**
 * Human readable number format.
 *
 * Shortens the number by dividing 1000
 *
 * @param type $number
 *
 * @return type
 */
function dokan_number_format( $number ) {
    $threshold = 10000;

    if ( $number > $threshold ) {
        return number_format( $number / 1000, 0, '.', '' ) . ' K';
    }

    return $number;
}

/**
 * Get coupon edit url
 *
 * @param int    $coupon_id
 * @param string $coupon_page
 *
 * @return string
 */
function dokan_get_coupon_edit_url( $coupon_id, $coupon_page = '' ) {
    if ( ! $coupon_page ) {
        $coupon_page = dokan_get_page_url( 'coupons' );
    }

    $edit_url = wp_nonce_url(
        add_query_arg(
            [
                'post'   => $coupon_id,
                'action' => 'edit',
                'view'   => 'add_coupons',
            ],
            $coupon_page
        ),
        '_coupon_nonce',
        'coupon_nonce_url'
    );

    return $edit_url;
}

/**
 * Filter `get_avatar_url` to retrieve image url from dokan profile settings
 * called by `get_avatar_url()` as well as `get_avatar()`
 *
 * @since 2.7.0
 *
 * @param string $url         avatar url
 * @param mixed  $id_or_email userdata or user_id or user_email
 * @param array  $args        arguments
 *
 * @return string maybe modified url
 */
function dokan_get_avatar_url( $url, $id_or_email, $args ) {
    if ( is_numeric( $id_or_email ) ) {
        $user = get_user_by( 'id', $id_or_email );
    } elseif ( is_object( $id_or_email ) ) {
        if ( $id_or_email->user_id != '0' ) {
            $user = get_user_by( 'id', $id_or_email->user_id );
        } else {
            return $url;
        }
    } else {
        $user = get_user_by( 'email', $id_or_email );
    }

    if ( ! $user ) {
        return $url;
    }

    $vendor = dokan()->vendor;

    if ( ! $vendor ) {
        return $url;
    }

    $vendor      = $vendor->get( $user->ID );
    $gravatar_id = $vendor->get_avatar_id();

    if ( ! $gravatar_id ) {
        return $url;
    }

    $dokan_avatar_url = wp_get_attachment_thumb_url( $gravatar_id );

    if ( empty( $dokan_avatar_url ) ) {
        return $url;
    }

    return esc_url( $dokan_avatar_url );
}

add_filter( 'get_avatar_url', 'dokan_get_avatar_url', 99, 3 );

/**
 * Get navigation url for the dokan dashboard
 *
 * @param string $name endpoint name
 *
 * @return string url
 */
function dokan_get_navigation_url( $name = '' ) {
    $page_id = (int) dokan_get_option( 'dashboard', 'dokan_pages', 0 );

    if ( ! $page_id ) {
        return '';
    }

    $url = get_permalink( $page_id );

    if ( ! empty( $name ) ) {
        $urlParts         = wp_parse_url( $url );
        $urlParts['path'] = $urlParts['path'] . $name . '/';
        $url              = http_build_url( '', $urlParts );
    }

    return apply_filters( 'dokan_get_navigation_url', esc_url( $url ), $name );
}

/**
 * Generate country dropdwon
 *
 * @param array  $options
 * @param string $selected
 * @param bool   $everywhere
 */
function dokan_country_dropdown( $options, $selected = '', $everywhere = false ) {
    printf( '<option value="">%s</option>', esc_html__( '- Select a location -', 'dokan-lite' ) );

    if ( $everywhere ) {
        echo '<optgroup label="--------------------------">';
        printf( '<option value="everywhere"%s>%s</option>', selected( $selected, 'everywhere', true ), esc_html__( 'Everywhere Else', 'dokan-lite' ) );
        echo '</optgroup>';
    }

    echo '<optgroup label="------------------------------">';

    foreach ( $options as $key => $value ) {
        printf( '<option value="%s"%s>%s</option>', esc_attr( $key ), selected( $selected, $key, true ), esc_html( $value ) );
    }
    echo '</optgroup>';
}

/**
 * Generate country dropdwon
 *
 * @param array  $options
 * @param string $selected
 * @param bool   $everywhere
 */
function dokan_state_dropdown( $options, $selected = '', $everywhere = false ) {
    printf( '<option value="">%s</option>', esc_html__( '- Select a State -', 'dokan-lite' ) );

    if ( $everywhere ) {
        echo '<optgroup label="--------------------------">';
        printf( '<option value="everywhere" %s>%s</option>', selected( $selected, 'everywhere', true ), esc_html__( 'Everywhere Else', 'dokan-lite' ) );
        echo '</optgroup>';
    }

    echo '<optgroup label="------------------------------">';

    foreach ( $options as $key => $value ) {
        printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $selected, $key, true ), esc_html( $value ) );
    }
    echo '</optgroup>';
}

/**
 * Shupping Processing time dropdown options
 *
 * @return array
 */
function dokan_get_shipping_processing_times() {
    $times = [
        ''  => __( 'Ready to ship in...', 'dokan-lite' ),
        '1' => __( '1 business day', 'dokan-lite' ),
        '2' => __( '1-2 business days', 'dokan-lite' ),
        '3' => __( '1-3 business days', 'dokan-lite' ),
        '4' => __( '3-5 business days', 'dokan-lite' ),
        '5' => __( '1-2 weeks', 'dokan-lite' ),
        '6' => __( '2-3 weeks', 'dokan-lite' ),
        '7' => __( '3-4 weeks', 'dokan-lite' ),
        '8' => __( '4-6 weeks', 'dokan-lite' ),
        '9' => __( '6-8 weeks', 'dokan-lite' ),
    ];

    return apply_filters( 'dokan_shipping_processing_times', $times );
}

/**
 * Get a single processing time string
 *
 * @param string $index
 *
 * @return string
 */
function dokan_get_processing_time_value( $index ) {
    $times = dokan_get_shipping_processing_times();

    if ( isset( $times[ $index ] ) ) {
        return $times[ $index ];
    }
}

/**
 * Dokan get vendor order details by order ID
 *
 * @param int $order
 * @param int $vendor_id
 *
 * @return array
 */
function dokan_get_vendor_order_details( $order_id, $vendor_id ) {
    $order      = wc_get_order( $order_id );
    $info       = [];
    $order_info = [];

    foreach ( $order->get_items( 'line_item' ) as $item ) {
        $product_id  = $item->get_product()->get_id();
        $author_id   = get_post_field( 'post_author', $product_id );

        if ( $vendor_id == $author_id ) {
            $info['product']  = $item['name'];
            $info['quantity'] = $item['quantity'];
            $info['total']    = $item['total'];
            array_push( $order_info, $info );
        }
    }

    return apply_filters( 'dokan_get_vendor_order_details', $order_info, $order_id, $vendor_id );
}

/**
 * Send email to seller and admin when there is no product in stock or low stock
 *
 * @param string recipient email
 * @param object product
 *
 * @since 2.8.0
 *
 * @return string recipient emails
 */
function dokan_wc_email_recipient_add_seller_no_stock( $recipient, $product ) {
    $product_id   = $product->get_id();
    $seller_id    = get_post_field( 'post_author', $product_id );
    $seller_email = dokan()->vendor->get( $seller_id )->get_email();

    return $recipient . ', ' . $seller_email;
}

add_filter( 'woocommerce_email_recipient_no_stock', 'dokan_wc_email_recipient_add_seller_no_stock', 10, 2 );
add_filter( 'woocommerce_email_recipient_low_stock', 'dokan_wc_email_recipient_add_seller_no_stock', 10, 2 );

/**
 * Display a monthly dropdown for filtering product listing on seller dashboard
 *
 * @since 2.1
 *
 * @param int $user_id
 */
function dokan_product_listing_filter_months_dropdown( $user_id ) {
    global $wpdb, $wp_locale;

    $months = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT DISTINCT YEAR( post_date ) AS year, MONTH( post_date ) AS month
            FROM $wpdb->posts
            WHERE post_type = 'product'
            AND post_author = %d
            ORDER BY post_date DESC",
            $user_id
        )
    );

    /**
     * Filter the 'Months' drop-down results.
     *
     * @since 2.1
     *
     * @param object $months the months drop-down query results
     */
    $months      = apply_filters( 'months_dropdown_results', $months, 'product' );
    $month_count = count( $months );

    if ( ! $month_count || ( 1 == $month_count && 0 == $months[0]->month ) ) {
        return;
    }

    $date = isset( $_GET['date'] ) ? (int) $_GET['date'] : 0; ?>
    <select name="date" id="filter-by-date" class="dokan-form-control">
        <option<?php selected( $date, 0 ); ?> value="0"><?php esc_html_e( 'All dates', 'dokan-lite' ); ?></option>
    <?php
    foreach ( $months as $arc_row ) {
        if ( 0 == $arc_row->year ) {
            continue;
        }

        $month = zeroise( $arc_row->month, 2 );
        $year  = $arc_row->year;

        printf(
            "<option %s value='%s' >%s</option>\n",
            selected( $date, $year . $month, false ),
            esc_attr( $year . $month ),
            /* translators: 1: month name, 2: 4-digit year */
            sprintf( esc_html__( '%1$s %2$d', 'dokan-lite' ), esc_html( $wp_locale->get_month( $month ) ), esc_html( $year ) ) // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        );
    } ?>
    </select>
    <?php
}

/**
 * Display form for filtering product listing on seller dashboard
 *
 * @since 2.1
 */
function dokan_product_listing_filter() {
    dokan_get_template_part( 'products/listing-filter' );
}

/**
 * Search by SKU or ID for seller dashboard product listings.
 *
 * @param string $where
 *
 * @return string
 */
function dokan_product_search_by_sku( $where ) {
    global $pagenow, $wpdb, $wp;

    $getdata = wp_unslash( $_GET );

    if ( empty( $getdata['product_search_name'] ) || ! isset( $getdata['dokan_product_search_nonce'] ) || ! wp_verify_nonce( sanitize_key( $getdata['dokan_product_search_nonce'] ), 'dokan_product_search' ) ) {
        return $where;
    }

    $search_ids = [];
    $terms      = explode( ',', wc_clean( $getdata['product_search_name'] ) );

    foreach ( $terms as $term ) {
        if ( is_numeric( $term ) ) {
            $search_ids[] = $term;
        }

        // Attempt to get a SKU
        $wild = '%';
        $find = wc_clean( $term );
        $like = $wild . $wpdb->esc_like( $find ) . $wild;

        $sku_to_id = $wpdb->get_col( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='_sku' AND meta_value LIKE %s", $like ) );

        if ( $sku_to_id && sizeof( $sku_to_id ) > 0 ) {
            $search_ids = array_merge( $search_ids, $sku_to_id );
        }
    }

    $search_ids = array_filter( array_map( 'absint', $search_ids ) );

    if ( sizeof( $search_ids ) > 0 ) {
        $where = str_replace( ')))', ") OR ({$wpdb->posts}.ID IN (" . implode( ',', $search_ids ) . '))))', $where );
    }

    return $where;
}

add_filter( 'posts_search', 'dokan_product_search_by_sku' );

/**
 * Dokan Social Profile fields
 *
 * @since 2.2
 *
 * @return array
 */
function dokan_get_social_profile_fields() {
    $fields = [
        'fb' => [
            'icon'  => 'facebook-square',
            'title' => __( 'Facebook', 'dokan-lite' ),
        ],
        'twitter' => [
            'icon'  => 'twitter-square',
            'title' => __( 'Twitter', 'dokan-lite' ),
        ],
        'pinterest' => [
            'icon'  => 'pinterest-square',
            'title' => __( 'Pinterest', 'dokan-lite' ),
        ],
        'linkedin' => [
            'icon'  => 'linkedin-square',
            'title' => __( 'LinkedIn', 'dokan-lite' ),
        ],
        'youtube' => [
            'icon'  => 'youtube-square',
            'title' => __( 'Youtube', 'dokan-lite' ),
        ],
        'instagram' => [
            'icon'  => 'instagram',
            'title' => __( 'Instagram', 'dokan-lite' ),
        ],
        'flickr' => [
            'icon'  => 'flickr',
            'title' => __( 'Flickr', 'dokan-lite' ),
        ],
    ];

    return apply_filters( 'dokan_profile_social_fields', $fields );
}

/**
 * Generate Address fields form for seller
 *
 * @since 2.3
 *
 * @param bool verified
 *
 * @return void
 */
function dokan_seller_address_fields( $verified = false, $required = false ) {
    $disabled = $verified ? 'disabled' : '';

    /**
     * Filter the seller Address fields
     *
     * @since 2.2
     *
     * @param array $dokan_seller_address
     */
    $seller_address_fields = apply_filters(
        'dokan_seller_address_fields', [
            'street_1' => [
                'required' => $required ? 1 : 0,
            ],
            'street_2' => [
                'required' => 0,
            ],
            'city'     => [
                'required' => $required ? 1 : 0,
            ],
            'zip'      => [
                'required' => $required ? 1 : 0,
            ],
            'country'  => [
                'required' => 1,
            ],
            'state'    => [
                'required' => 0,
            ],
        ]
    );

    $profile_info = dokan_get_store_info( dokan_get_current_user_id() );

    dokan_get_template_part(
        'settings/address-form', '', [
            'disabled'              => $disabled,
            'seller_address_fields' => $seller_address_fields,
            'profile_info'          => $profile_info,
        ]
    );
}

/**
 * Generate Address string | array for given seller id or current user
 *
 * @since 2.3
 *
 * @param int seller_id, defaults to current_user_id
 * @param bool get_array, if true returns array instead of string
 *
 * @return string|array Address | array Address
 */
function dokan_get_seller_address( $seller_id = '', $get_array = false ) {
    if ( $seller_id == '' ) {
        $seller_id = dokan_get_current_user_id();
    }

    $profile_info = dokan_get_store_info( $seller_id );

    if ( isset( $profile_info['address'] ) ) {
        $address = $profile_info['address'];

        $country_obj = new WC_Countries();
        $countries   = $country_obj->countries;
        $states      = $country_obj->states;

        $street_1     = isset( $address['street_1'] ) ? $address['street_1'] : '';
        $street_2     = isset( $address['street_2'] ) ? $address['street_2'] : '';
        $city         = isset( $address['city'] ) ? $address['city'] : '';

        $zip          = isset( $address['zip'] ) ? $address['zip'] : '';
        $country_code = isset( $address['country'] ) ? $address['country'] : '';
        $state_code   = isset( $address['state'] ) ? $address['state'] : '';
        $state_code   = isset( $address['state'] ) ? ( $address['state'] == 'N/A' ) ? '' : $address['state'] : '';

        $country_name = isset( $countries[ $country_code ] ) ? $countries[ $country_code ] : '';
        $state_name   = isset( $states[ $country_code ][ $state_code ] ) ? $states[ $country_code ][ $state_code ] : $state_code;
    } else {
        return 'N/A';
    }

    if ( $get_array == true ) {
        $address = [
            'street_1' => $street_1,
            'street_2' => $street_2,
            'city'     => $city,
            'zip'      => $zip,
            'country'  => $country_name,
            'state'    => isset( $states[ $country_code ][ $state_code ] ) ? $states[ $country_code ][ $state_code ] : $state_code,
        ];

        return apply_filters( 'dokan_get_seller_address', $address, $profile_info );
    }

    $country           = new WC_Countries();
    $formatted_address = $country->get_formatted_address(
        [
            'address_1' => $street_1,
            'address_2' => $street_2,
            'city'      => $city,
            'postcode'  => $zip,
            'state'     => $state_code,
            'country'   => $country_code,
        ]
    );

    return apply_filters( 'dokan_get_seller_formatted_address', $formatted_address, $profile_info );
}

/**
 * Dokan get seller short formatted address
 *
 * @since  2.5.7
 *
 * @param int $store_id
 *
 * @return string
 */
function dokan_get_seller_short_address( $store_id, $line_break = true ) {
    $store_address   = dokan_get_seller_address( $store_id, true );
    $address_classes = [
        'street_1',
        'street_2',
        'city',
        'state',
        'country',
    ];
    $short_address     = [];
    $formatted_address = '';

    if ( ! empty( $store_address['street_1'] ) && empty( $store_address['street_2'] ) ) {
        $short_address[] = "<span class='{$address_classes[0]}'> {$store_address['street_1']},</span>";
    } elseif ( empty( $store_address['street_1'] ) && ! empty( $store_address['street_2'] ) ) {
        $short_address[] = "<span class='{$address_classes[1]}'> {$store_address['street_2']},</span>";
    } elseif ( ! empty( $store_address['street_1'] ) && ! empty( $store_address['street_2'] ) ) {
        $short_address[] = "<span class='{$address_classes[0]} {$address_classes[1]}'> {$store_address['street_1']}, {$store_address['street_2']}</span>";
    }

    if ( ! empty( $store_address['city'] ) && ! empty( $store_address['city'] ) ) {
        $short_address[] = "<span class='{$address_classes[2]}'> {$store_address['city']},</span>";
    }

    if ( ! empty( $store_address['state'] ) && ! empty( $store_address['country'] ) ) {
        $short_address[] = "<span class='{$address_classes[3]}'> {$store_address['state']},</span>" . "<span class='{$address_classes[4]}'> {$store_address['country']} </span>";
    } elseif ( ! empty( $store_address['country'] ) ) {
        $short_address[] = "<span class='{$address_classes[4]}'> {$store_address['country']} </span>";
    }

    if ( ! empty( $short_address ) && $line_break ) {
        $formatted_address = implode( '<br>', $short_address );
    } else {
        $formatted_address = implode( ' ', $short_address );
    }

    return apply_filters( 'dokan_store_header_adress', $formatted_address, $store_address, $short_address );
}

/**
 * Get terms and conditions page
 *
 * @since 2.3
 *
 * @param $store_id
 * @param $store_info
 *
 * @return string
 */
function dokan_get_toc_url( $store_id ) {
    if ( ! $store_id ) {
        return '';
    }

    $store_info = dokan_get_store_info( $store_id );
    $tnc_enable = dokan_get_option( 'seller_enable_terms_and_conditions', 'dokan_general', 'off' );

    if ( ! ( isset( $store_info['enable_tnc'] ) && $store_info['enable_tnc'] == 'on' && $tnc_enable == 'on' ) ) {
        return '';
    }

    $userstore = dokan_get_store_url( $store_id );

    return apply_filters( 'dokan_get_toc_url', $userstore . 'toc' );
}

/**
 * Login Redirect
 *
 * @since 2.4
 *
 * @param string $redirect_to [url]
 * @param object $user
 *
 * @return string [url]
 */
function dokan_after_login_redirect( $redirect_to, $user ) {
    if ( user_can( $user, 'dokandar' ) ) {
        $seller_dashboard = dokan_get_option( 'dashboard', 'dokan_pages' );

        if ( $seller_dashboard != -1 ) {
            $redirect_to = get_permalink( $seller_dashboard );
        }
    }

    $getdata = wp_unslash( $_GET );

    if ( isset( $getdata['redirect_to'] ) && ! empty( $getdata['redirect_to'] ) ) {
        $redirect_to = esc_url( $getdata['redirect_to'] );
    }

    return $redirect_to;
}

add_filter( 'woocommerce_login_redirect', 'dokan_after_login_redirect', 1, 2 );

/**
 * Check if the post belongs to the given user
 *
 * @param int $post_id
 * @param int $user_id
 *
 * @return bool
 */
function dokan_is_valid_owner( $post_id, $user_id ) {
    $author = get_post_field( 'post_author', $post_id );

    if ( $user_id == $author ) {
        return true;
    }

    return false;
}

add_action( 'wp', 'dokan_set_is_home_false_on_store' );

function dokan_set_is_home_false_on_store() {
    global $wp_query;

    if ( dokan_is_store_page() ) {
        $wp_query->is_home = false;
    }
}

/**
 * Register dokan store widget
 *
 * @return void
 */
function dokan_register_store_widget() {
    register_sidebar(
        apply_filters(
            'dokan_store_widget_args', [
                'name'          => __( 'Dokan Store Sidebar', 'dokan-lite' ),
                'id'            => 'sidebar-store',
                'before_widget' => '<aside id="%1$s" class="widget dokan-store-widget %2$s">',
                'after_widget'  => '</aside>',
                'before_title'  => '<h3 class="widget-title">',
                'after_title'   => '</h3>',
            ]
        )
    );
}

add_action( 'widgets_init', 'dokan_register_store_widget' );

/**
 * Calculate category wise commission for given product
 *
 * @since 2.6.8
 *
 * @param int $product_id
 *
 * @return int $commission_rate
 */
function dokan_get_category_wise_seller_commission( $product_id, $category_id = 0 ) {
    $terms = get_the_terms( $product_id, 'product_cat' );

    if ( empty( $terms ) ) {
        return 0;
    }

    $term_id = $terms[0]->term_id;

    $category_commision = null;

    if ( $category_id ) {
        $terms   = get_term( $category_id );
        $term_id = $terms->term_id;
    }

    if ( $terms ) {
        $category_commision = get_term_meta( $term_id, 'per_category_admin_commission', true );
    }

    if ( ! empty( $category_commision ) ) {
        return (float) $category_commision;
    }

    return 0;
}

/**
 * Calculate category wise commission type for given product
 *
 * @since 2.6.9
 *
 * @param int $product_id
 *
 * @return int $commission_rate
 */
function dokan_get_category_wise_seller_commission_type( $product_id, $category_id = 0 ) {
    $terms              = get_the_terms( $product_id, 'product_cat' );
    $term_id            = $terms[0]->term_id;
    $category_commision = '';

    if ( $category_id ) {
        $terms   = get_term( $category_id );
        $term_id = $terms->term_id;
    }

    if ( $terms ) {
        $category_commision = get_term_meta( $term_id, 'per_category_admin_commission_type', true );
    }

    return $category_commision;
}

/**
 * Keep record of keys by group name
 *
 * @since 2.6.9
 *
 * @param string $key
 * @param string $group
 *
 * @return void
 */
function dokan_cache_update_group( $key, $group ) {
    $keys = get_option( $group, [] );

    if ( in_array( $key, $keys ) ) {
        return;
    }

    $keys[] = $key;
    update_option( $group, $keys );
}

/**
 * Bulk clear cache values by group name
 *
 * @since 2.6.9
 *
 * @param string $group
 *
 * @return void
 */
function dokan_cache_clear_group( $group ) {
    $keys = get_option( $group, [] );

    if ( ! empty( $keys ) ) {
        foreach ( $keys as $key ) {
            wp_cache_delete( $key, $group );
            unset( $keys[ $key ] );
        }
    }

    update_option( $group, $keys );
}

//cache reset actions
add_action( 'dokan_checkout_update_order_meta', 'dokan_cache_reset_seller_order_data', 10, 2 );
add_action( 'woocommerce_order_status_changed', 'dokan_cache_reset_order_data_on_status', 10, 4 );
add_action( 'dokan_new_product_added', 'dokan_cache_clear_seller_product_data', 20, 2 );
add_action( 'dokan_product_updated', 'dokan_cache_clear_seller_product_data', 20 );
add_action( 'delete_post', 'dokan_cache_clear_deleted_product', 20 );

/**
 * Reset cache group related to seller orders
 */
function dokan_cache_reset_seller_order_data( $order_id, $seller_id ) {
    dokan_cache_clear_group( 'dokan_seller_data_' . $seller_id );
}

function dokan_cache_reset_order_data_on_status( $order_id, $from_status, $to_status, $order ) {
    $seller_id = dokan_get_seller_id_by_order( $order_id );
    dokan_cache_clear_group( 'dokan_seller_data_' . $seller_id );
}

/**
 * Reset cache group related to seller products
 */
function dokan_cache_clear_seller_product_data( $product_id, $post_data = [] ) {
    $seller_id = dokan_get_current_user_id();

    dokan_clear_product_caches( $product_id );
    dokan_cache_clear_group( 'dokan_seller_product_data_' . $seller_id );
    dokan_cache_clear_group( 'dokan_cache_seller_product_data_' . $seller_id );
    dokan_cache_clear_group( 'dokan_cache_seller_product_stock_data_' . $seller_id );
    delete_transient( 'dokan-store-category-' . $seller_id );
}

/**
 * Reset the cache group for store category when deleted
 *
 * @param int $post_id
 *
 * @return void
 */
function dokan_cache_clear_deleted_product( $post_id ) {
    $seller_id = get_post_field( 'post_author', $post_id );

    delete_transient( 'dokan-store-category-' . $seller_id );
}

/**
 * Get seller earning for a given product
 *
 * @since 2.6.9
 *
 * @param int $product_id
 * @param int $seller_id
 *
 * @return float $earning | zero on failure or no price
 */
function dokan_get_earning_by_product( $product_id, $seller_id ) {
    wc_deprecated_function( 'dokan_get_earning_by_product', '2.9.21', 'dokan()->comission->get_earning_by_product()' );

    return dokan()->commission->get_earning_by_product( $product_id );

    $product   = wc_get_product( $product_id );
    $parent_id = $product->get_parent_id();

    // if parent id found, override product_id with parent id
    if ( $parent_id ) {
        $product_id = $parent_id;
    }

    $percentage         = dokan_get_seller_percentage( $seller_id, $product_id );
    $percentage_type    = dokan_get_commission_type( $seller_id, $product_id );
    $price              = $product->get_price();

    if ( ! $price || 0 > $price ) {
        return 0;
    }

    $earning = 'percentage' == $percentage_type ? (float) ( $price * $percentage ) / 100 : $price - $percentage;

    return wc_format_decimal( $earning );
}

add_action( 'delete_user', 'dokan_delete_user_details', 10, 2 );

/**
 * Delete user's details when the user is deleted
 *
 * @since 2.6.9
 *
 * @param int $user_id, int $reassign
 *
 * @return void
 */
function dokan_delete_user_details( $user_id, $reassign ) {
    if ( ! dokan_is_user_seller( $user_id ) ) {
        return;
    }

    if ( is_null( $reassign ) ) {
        $args = [
            'numberposts'   => -1,
            'post_type'     => 'any',
            'author'        => $user_id,
        ];

        // get all posts by this user
        $user_posts = get_posts( $args );

        if ( empty( $user_posts ) ) {
            return;
        }

        // delete all the posts
        foreach ( $user_posts as $user_post ) {
            wp_delete_post( $user_post->ID, true );
        }
    }
}

/**
 * Get a vendor
 *
 * @since 2.6.10
 *
 * @param int $vendor_id
 *
 * @return \Dokan_Vendor
 */
function dokan_get_vendor( $vendor_id = null ) {
    if ( ! $vendor_id ) {
        $vendor_id = wp_get_current_user();
    }

    return dokan()->vendor->get( $vendor_id );
}

/**
 * Get all cap related to seller
 *
 * @since 2.7.3
 *
 * @return array
 */
function dokan_get_all_caps() {
    $capabilities = [
        'overview' => [
            'dokan_view_sales_overview'        => __( 'View sales overview', 'dokan-lite' ),
            'dokan_view_sales_report_chart'    => __( 'View sales report chart', 'dokan-lite' ),
            'dokan_view_announcement'          => __( 'View announcement', 'dokan-lite' ),
            'dokan_view_order_report'          => __( 'View order report', 'dokan-lite' ),
            'dokan_view_review_reports'        => __( 'View review report', 'dokan-lite' ),
            'dokan_view_product_status_report' => __( 'View product status report', 'dokan-lite' ),
        ],
        'report' => [
            'dokan_view_overview_report'    => __( 'View overview report', 'dokan-lite' ),
            'dokan_view_daily_sale_report'  => __( 'View daily sales report', 'dokan-lite' ),
            'dokan_view_top_selling_report' => __( 'View top selling report', 'dokan-lite' ),
            'dokan_view_top_earning_report' => __( 'View top earning report', 'dokan-lite' ),
            'dokan_view_statement_report'   => __( 'View statement report', 'dokan-lite' ),
        ],
        'order' => [
            'dokan_view_order'        => __( 'View order', 'dokan-lite' ),
            'dokan_manage_order'      => __( 'Manage order', 'dokan-lite' ),
            'dokan_manage_order_note' => __( 'Manage order note', 'dokan-lite' ),
            'dokan_manage_refund'     => __( 'Manage refund', 'dokan-lite' ),
        ],

        'coupon' => [
            'dokan_add_coupon'    => __( 'Add coupon', 'dokan-lite' ),
            'dokan_edit_coupon'   => __( 'Edit coupon', 'dokan-lite' ),
            'dokan_delete_coupon' => __( 'Delete coupon', 'dokan-lite' ),
        ],
        'review' => [
            'dokan_view_reviews'   => __( 'View reviews', 'dokan-lite' ),
            'dokan_manage_reviews' => __( 'Manage reviews', 'dokan-lite' ),
        ],

        'withdraw' => [
            'dokan_manage_withdraw' => __( 'Manage withdraw', 'dokan-lite' ),
        ],
        'product' => [
            'dokan_add_product'       => __( 'Add product', 'dokan-lite' ),
            'dokan_edit_product'      => __( 'Edit product', 'dokan-lite' ),
            'dokan_delete_product'    => __( 'Delete product', 'dokan-lite' ),
            'dokan_view_product'      => __( 'View product', 'dokan-lite' ),
            'dokan_duplicate_product' => __( 'Duplicate product', 'dokan-lite' ),
            'dokan_import_product'    => __( 'Import product', 'dokan-lite' ),
            'dokan_export_product'    => __( 'Export product', 'dokan-lite' ),
        ],
        'menu' => [
            'dokan_view_overview_menu'       => __( 'View overview menu', 'dokan-lite' ),
            'dokan_view_product_menu'        => __( 'View product menu', 'dokan-lite' ),
            'dokan_view_order_menu'          => __( 'View order menu', 'dokan-lite' ),
            'dokan_view_coupon_menu'         => __( 'View coupon menu', 'dokan-lite' ),
            'dokan_view_report_menu'         => __( 'View report menu', 'dokan-lite' ),
            'dokan_view_review_menu'         => __( 'Vuew review menu', 'dokan-lite' ),
            'dokan_view_withdraw_menu'       => __( 'View withdraw menu', 'dokan-lite' ),
            'dokan_view_store_settings_menu' => __( 'View store settings menu', 'dokan-lite' ),
            'dokan_view_store_payment_menu'  => __( 'View payment settings menu', 'dokan-lite' ),
            'dokan_view_store_shipping_menu' => __( 'View shipping settings menu', 'dokan-lite' ),
            'dokan_view_store_social_menu'   => __( 'View social settings menu', 'dokan-lite' ),
            'dokan_view_store_seo_menu'      => __( 'View seo settings menu', 'dokan-lite' ),
        ],
    ];

    return apply_filters( 'dokan_get_all_cap', $capabilities );
}

/**
 * Get translated capability
 *
 * @since 3.0.2
 *
 * @param string $cap
 *
 * @return string
 */
function dokan_get_all_cap_labels( $cap ) {
    $caps = apply_filters(
        'dokan_get_all_cap_labels', [
            'overview' => __( 'Overview', 'dokan-lite' ),
            'report'   => __( 'Report', 'dokan-lite' ),
            'order'    => __( 'Order', 'dokan-lite' ),
            'coupon'   => __( 'Coupon', 'dokan-lite' ),
            'review'   => __( 'Review', 'dokan-lite' ),
            'withdraw' => __( 'Withdraw', 'dokan-lite' ),
            'product'  => __( 'Product', 'dokan-lite' ),
            'menu'     => __( 'Menu', 'dokan-lite' ),
        ]
    );

    return ! empty( $caps[ $cap ] ) ? $caps[ $cap ] : '';
}

/**
 * Merge user defined arguments into defaults array.
 *
 * This function is similiar to WordPress wp_parse_args().
 * It's support multidimensional array.
 *
 * @param array $args
 * @param array $defaults optional
 *
 * @return array
 */
function dokan_parse_args( &$args, $defaults = [] ) {
    $args     = (array) $args;
    $defaults = (array) $defaults;
    $r        = $defaults;

    foreach ( $args as $k => &$v ) {
        if ( is_array( $v ) && isset( $r[ $k ] ) ) {
            $r[ $k ] = dokan_parse_args( $v, $r[ $k ] );
        } else {
            $r[ $k ] = $v;
        }
    }

    return $r;
}

function dokan_get_translations_for_plugin_domain( $domain, $language_dir = null ) {
    if ( $language_dir == null ) {
        $language_dir = DOKAN_DIR . '/languages/';
    }

    $languages     = get_available_languages( $language_dir );
    $get_site_lang = is_admin() ? get_user_locale() : get_locale();
    $mo_file_name  = $domain . '-' . $get_site_lang;
    $translations  = [];

    if ( in_array( $mo_file_name, $languages ) && file_exists( $language_dir . $mo_file_name . '.mo' ) ) {
        $mo = new MO();

        if ( $mo->import_from_file( $language_dir . $mo_file_name . '.mo' ) ) {
            $translations = $mo->entries;
        }
    }

    return [
        'header'       => isset( $mo ) ? $mo->headers : '',
        'translations' => $translations,
    ];
}

/**
 * Returns Jed-formatted localization data.
 *
 * @param string $domain translation domain
 *
 * @return array
 */
function dokan_get_jed_locale_data( $domain, $language_dir = null ) {
    $plugin_translations = dokan_get_translations_for_plugin_domain( $domain, $language_dir );
    $translations        = get_translations_for_domain( $domain );

    $locale = [
        'domain'      => $domain,
        'locale_data' => [
            $domain => [
                '' => [
                    'domain' => $domain,
                    'lang'   => is_admin() ? get_user_locale() : get_locale(),
                ],
            ],
        ],
    ];

    if ( ! empty( $translations->headers['Plural-Forms'] ) ) {
        $locale['locale_data'][ $domain ]['']['plural_forms'] = $translations->headers['Plural-Forms'];
    } elseif ( ! empty( $plugin_translations['header'] ) ) {
        $locale['locale_data'][ $domain ]['']['plural_forms'] = $plugin_translations['header']['Plural-Forms'];
    }

    $entries = array_merge( $plugin_translations['translations'], $translations->entries );

    foreach ( $entries as $msgid => $entry ) {
        $locale['locale_data'][ $domain ][ $msgid ] = $entry->translations;
    }

    return $locale;
}

/**
 * Revoke vendor access of changing order status in the backend if permission is not given
 *
 * @since 2.8.0
 *
 * @return void;
 */
function dokan_revoke_change_order_status() {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return;
    }

    if ( is_admin() && get_current_screen()->id == 'shop_order' ) {
        if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) !== 'on' ) {
            ?>
            <style media="screen">
                .order_data_column .wc-order-status {
                    display:  none !important;
                }
            </style>
            <?php
        }
    }
}

add_action( 'load-post.php', 'dokan_revoke_change_order_status' );

/**
 * Revoke vendor access of changing order status in the backend if permission is not given
 *
 * @since 2.8.0
 *
 * @return array;
 */
function dokan_remove_action_column( $columns ) {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return $columns;
    }

    if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) !== 'on' ) {
        unset( $columns['wc_actions'] );
    }

    return $columns;
}

add_filter( 'manage_edit-shop_order_columns', 'dokan_remove_action_column', 15 );

/**
 * Revoke vendor access of changing order status in the backend if permission is not given
 *
 * @since 2.8.0
 *
 * @return array;
 */
function dokan_remove_action_button( $actions ) {
    if ( current_user_can( 'manage_woocommerce' ) ) {
        return $actions;
    }

    if ( dokan_get_option( 'order_status_change', 'dokan_selling', 'on' ) !== 'on' ) {
        unset( $actions['status'] );
    }

    return $actions;
}

add_filter( 'woocommerce_admin_order_preview_actions', 'dokan_remove_action_button', 15 );

/**
 * Dokan get translated days
 *
 * @param  string day
 *
 * @since  2.8.2
 *
 * @return string
 */
function dokan_get_translated_days( $day ) {
    switch ( $day ) {
        case 'saturday':
            return __( 'Saturday', 'dokan-lite' );

        case 'sunday':
            return __( 'Sunday', 'dokan-lite' );

        case 'monday':
            return __( 'Monday', 'dokan-lite' );

        case 'tuesday':
            return __( 'Tuesday', 'dokan-lite' );

        case 'wednesday':
            return __( 'Wednesday', 'dokan-lite' );

        case 'thursday':
            return __( 'Thursday', 'dokan-lite' );

        case 'friday':
            return __( 'Friday', 'dokan-lite' );

        case 'close':
            return apply_filters( 'dokan_store_close_day_label', __( 'Off Day', 'dokan-lite' ) );

        default:
            return apply_filters( 'dokan_get_translated_days', '', $day );
            break;
    }
}

/**
 * Dokan is store open
 *
 * @param  int user_id
 *
 * @since  2.8.2
 * @since  3.2.1 replaced time related functions with dokan_current_datetime()
 *
 * @return bool
 */
function dokan_is_store_open( $user_id ) {
    $store_user = dokan()->vendor->get( $user_id );
    $store_info = $store_user->get_shop_info();
    $open_days  = isset( $store_info['dokan_store_time'] ) ? $store_info['dokan_store_time'] : '';

    $current_time = dokan_current_datetime();
    $today        = strtolower( $current_time->format( 'l' ) );

    if ( ! isset( $open_days[ $today ] ) ) {
        return false;
    }

    $schedule = $open_days[ $today ];
    $status   = isset( $schedule['open'] ) ? $schedule['open'] : $schedule['status'];

    if ( 'open' === $status ) {
        if ( empty( $schedule['opening_time'] ) || empty( $schedule['closing_time'] ) ) {
            return true;
        }

        $open  = DateTimeImmutable::createFromFormat( esc_attr( get_option( 'time_format' ) ), $schedule['opening_time'], new DateTimeZone( dokan_wp_timezone_string() ) );
        $close = DateTimeImmutable::createFromFormat( esc_attr( get_option( 'time_format' ) ), $schedule['closing_time'], new DateTimeZone( dokan_wp_timezone_string() ) );

        if ( $open <= $current_time && $close >= $current_time ) {
            return true;
        }
    }

    return false;
}

/**
 * Customer has order from current seller
 *
 * @param int $customer_id
 * @param int $seller_id
 *
 * @since  2.8.6
 *
 * @return bool
 */
function dokan_customer_has_order_from_this_seller( $customer_id, $seller_id = null ) {
    $seller_id = ! empty( $seller_id ) ? $seller_id : dokan_get_current_user_id();
    $args      = [
        'customer_id'   => $customer_id,
        'post_type'     => 'shop_order',
        'meta_key'      => '_dokan_vendor_id',
        'meta_value'    => $seller_id,
        'post_status'   => 'any',
        'return'        => 'ids',
        'numberposts'   => 1,
    ];

    $orders = wc_get_orders( $args );

    return ! empty( $orders ) ? true : false;
}

/**
 * Dokan get pro buy now url
 *
 * @since 2.8.5
 *
 * @return string [url]
 */
function dokan_pro_buynow_url() {
    $link = 'https://wedevs.com/dokan/pricing/';

    if ( $aff = get_option( '_dokan_aff_ref' ) ) {
        $link = add_query_arg( [ 'ref' => $aff ], $link );
    }

    return $link;
}

/**
 * Add vendor info in restful wc_order
 *
 * @param object $response
 *
 * @return WP_REST_Response
 */
function dokan_add_vendor_info_in_rest_order( $response ) {
    $vendor_ids = [];

    foreach ( $response as $data ) {
        if ( empty( $data['line_items'] ) ) {
            continue;
        }

        foreach ( $data['line_items'] as $item ) {
            $product_id = ! empty( $item['product_id'] ) ? $item['product_id'] : 0;
            $vendor_id  = get_post_field( 'post_author', $product_id );

            if ( $vendor_id && ! in_array( $vendor_id, $vendor_ids ) ) {
                array_push( $vendor_ids, $vendor_id );
            }
        }
    }

    if ( ! $vendor_ids ) {
        return $response;
    }

    $data = $response->get_data();

    foreach ( $vendor_ids as $store_id ) {
        $store            = dokan()->vendor->get( $store_id );
        $data['stores'][] = [
            'id'        => $store->get_id(),
            'name'      => $store->get_name(),
            'shop_name' => $store->get_shop_name(),
            'url'       => $store->get_shop_url(),
            'address'   => $store->get_address(),
        ];
    }

    // for backward compatibility, if there are multiple vendors, pass empty array.
    if ( count( $vendor_ids ) > 1 ) {
        $data['store'] = [];
    } else {
        $store         = dokan()->vendor->get( $vendor_ids[0] );
        $data['store'] = [
            'id'        => $store->get_id(),
            'name'      => $store->get_name(),
            'shop_name' => $store->get_shop_name(),
            'url'       => $store->get_shop_url(),
            'address'   => $store->get_address(),
        ];
    }

    $response->set_data( $data );

    return $response;
}

add_filter( 'woocommerce_rest_prepare_shop_order_object', 'dokan_add_vendor_info_in_rest_order', 10, 1 );

/**
 * Stop sending multiple email for an order
 *
 * @since 2.8.6
 *
 * @return void
 */
function dokan_stop_sending_multiple_email() {
    if ( did_action( 'woocommerce_order_status_pending_to_on-hold_notification' ) == 1 ) {
        dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_pending_to_on-hold_notification', 'WC_Email_Customer_On_Hold_Order', 'trigger', 10 );
    }

    if ( did_action( 'woocommerce_order_status_on-hold_to_processing_notification' ) == 1 ) {
        dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_on-hold_to_processing_notification', 'WC_Email_Customer_Processing_Order', 'trigger', 10 );
    }

    if ( did_action( 'woocommerce_order_status_pending_to_processing_notification' ) == 1 ) {
        dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_pending_to_processing_notification', 'WC_Email_Customer_Processing_Order', 'trigger', 10 );
    }

    if ( did_action( 'woocommerce_order_status_completed_notification' ) == 1 ) {
        dokan_remove_hook_for_anonymous_class( 'woocommerce_order_status_completed_notification', 'WC_Email_Customer_Completed_Order', 'trigger', 10 );
    }
}

add_action( 'woocommerce_order_status_pending_to_on-hold', 'dokan_stop_sending_multiple_email' );
add_action( 'woocommerce_order_status_on-hold_to_processing', 'dokan_stop_sending_multiple_email' );
add_action( 'woocommerce_order_status_pending_to_processing', 'dokan_stop_sending_multiple_email' );
add_action( 'woocommerce_order_status_completed', 'dokan_stop_sending_multiple_email' );

/**
 * Remove hook for anonymous class
 *
 * @param string $hook_name
 * @param string $class_name
 * @param string $method_name
 * @param int    $priority
 *
 * @return bool
 */
function dokan_remove_hook_for_anonymous_class( $hook_name = '', $class_name = '', $method_name = '', $priority = 0 ) {
    global $wp_filter;

    // Take only filters on right hook name and priority
    if ( ! isset( $wp_filter[ $hook_name ][ $priority ] ) || ! is_array( $wp_filter[ $hook_name ][ $priority ] ) ) {
        return false;
    }

    // Loop on filters registered
    foreach ( (array) $wp_filter[ $hook_name ][ $priority ] as $unique_id => $filter_array ) {
        // Test if filter is an array ! (always for class/method)
        if ( isset( $filter_array['function'] ) && is_array( $filter_array['function'] ) ) {
            // Test if object is a class, class and method is equal to param !
            if ( is_object( $filter_array['function'][0] ) && get_class( $filter_array['function'][0] ) && get_class( $filter_array['function'][0] ) == $class_name && $filter_array['function'][1] == $method_name ) {
                // Test for WordPress >= 4.7 WP_Hook class (https://make.wordpress.org/core/2016/09/08/wp_hook-next-generation-actions-and-filters/)
                if ( is_a( $wp_filter[ $hook_name ], 'WP_Hook' ) ) {
                    unset( $wp_filter[ $hook_name ]->callbacks[ $priority ][ $unique_id ] );
                } else {
                    unset( $wp_filter[ $hook_name ][ $priority ][ $unique_id ] );
                }
            }
        }
    }

    return false;
}

/**
 * Dokan get variable product earnings
 *
 * @param int  $product_id
 * @param bool $formated
 * @param bool $deprecated
 *
 * @return float|string
 */
function dokan_get_variable_product_earning( $product_id, $formated = true, $deprecated = false ) {
    if ( $deprecated ) {
        wc_deprecated_argument( 'seller_id', '2.9.21', 'dokan_get_variable_product_earning() does not require a seller_id anymore.' );
    }

    $product = wc_get_product( $product_id );

    if ( ! $product ) {
        return null;
    }

    $variations = $product->get_children();

    if ( empty( $variations ) || ! is_array( $variations ) ) {
        return null;
    }

    $earnings = array_map(
        function ( $id ) {
            return dokan()->commission->get_earning_by_product( $id );
        }, $variations
    );

    if ( empty( $earnings ) || ! is_array( $earnings ) ) {
        return null;
    }

    if ( count( $earnings ) == 1 ) {
        return $formated ? wc_price( $earnings[0] ) : $earnings[0];
    }

    $min_earning = $formated ? wc_price( min( $earnings ) ) : min( $earnings );
    $max_earning = $formated ? wc_price( max( $earnings ) ) : max( $earnings );
    $seperator   = apply_filters( 'dokan_get_variable_product_earning_seperator', ' - ', $product_id );
    $earning     = $min_earning . $seperator . $max_earning;

    return $earning;
}

/**
 * Get page permalink of dokan pages by page id
 *
 * @since 2.9.10
 *
 * @param string $page_id
 *
 * @return string
 */
function dokan_get_permalink( $page_id ) {
    if ( ! $page_id ) {
        return false;
    }

    $pages = get_option( 'dokan_pages' );

    return isset( $pages[ $page_id ] ) ? get_permalink( $pages[ $page_id ] ) : false;
}

/**
 * Check if it's store listing page
 *
 * @since 2.9.10
 *
 * @return bool
 */
function dokan_is_store_listing() {
    $page_id = get_the_ID();
    $found   = false;

    if ( $page_id === intval( dokan_get_option( 'store_listing', 'dokan_pages' ) ) ) {
        $found = true;
    }

    if ( ! $found ) {
        $post = get_post( $page_id );

        if ( $post && false !== strpos( $post->post_content, '[dokan-stores' ) ) {
            $found = true;
        }
    }

    return apply_filters( 'dokan_is_store_listing', $found, $page_id );
}

/**
 * Dokan generate username
 *
 * @param string $name
 *
 * @return string
 */
function dokan_generate_username( $name = 'store' ) {
    static $i = 1;

    $name = implode( '', explode( ' ', $name ) );

    if ( ! username_exists( $name ) ) {
        return $name;
    }

    $new_name = sprintf( '%s-%d', $name, $i++ );

    if ( ! username_exists( $new_name ) ) {
        return $new_name;
    }

    return call_user_func( __FUNCTION__, $name );
}

/**
 * Replaces placeholders with links to policy pages.
 *
 * @since 2.9.10
 *
 * @param string $text text to find/replace within
 *
 * @return string
 */
function dokan_replace_policy_page_link_placeholders( $text ) {
    $privacy_page_id = dokan_get_option( 'privacy_page', 'dokan_privacy' );
    $privacy_link    = $privacy_page_id ? '<a href="' . esc_url( get_permalink( $privacy_page_id ) ) . '" class="dokan-privacy-policy-link" target="_blank">' . __( 'privacy policy', 'dokan-lite' ) . '</a>' : __( 'privacy policy', 'dokan-lite' );

    $find_replace = [
        '[dokan_privacy_policy]' => $privacy_link,
    ];

    return str_replace( array_keys( $find_replace ), array_values( $find_replace ), $text );
}

/**
 * Dokan privacy policy text
 *
 * @since 2.9.10
 * @since DOKAN_LITE_VERSION Add `$return` param to return the text on demand instead of printing
 *
 * @return string
 */
function dokan_privacy_policy_text( $return = false ) {
    $is_enabled   = 'on' === dokan_get_option( 'enable_privacy', 'dokan_privacy' ) ? true : false;
    $privacy_page = dokan_get_option( 'privacy_page', 'dokan_privacy' );
    $privacy_text = dokan_get_option( 'privacy_policy', 'dokan_privacy', __( 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]', 'dokan-lite' ) );

    if ( ! $is_enabled || ! $privacy_page ) {
        return;
    }

    $text = wpautop( dokan_replace_policy_page_link_placeholders( $privacy_text ), true );

    if ( $return ) {
        return wp_kses_post( $text );
    }

    echo wp_kses_post( $text );
}

/**
 * Dokan commission types
 *
 * @since 2.9.21
 *
 * @return array
 */
function dokan_commission_types() {
    return apply_filters(
        'dokan_commission_types', [
            'flat'       => __( 'Flat', 'dokan-lite' ),
            'percentage' => __( 'Percentage', 'dokan-lite' ),
        ]
    );
}

/**
 * Dokan Login Form
 *
 * @since 2.9.11
 *
 * @param array $args
 * @param bool  $echo
 *
 * @return void|string
 */
function dokan_login_form( $args = [], $echo = false ) {
    $defaults = [
        'title'        => esc_html__( 'Please Login to Continue', 'dokan-lite' ),
        'id'           => 'dokan-login-form',
        'nonce_action' => 'dokan-login-form-action',
        'nonce_name'   => 'dokan-login-form-nonce',
    ];

    $args = wp_parse_args( $args, $defaults );

    if ( $echo ) {
        dokan_get_template_part( 'login-form/login-form', false, $args );
    } else {
        ob_start();
        dokan_get_template_part( 'login-form/login-form', false, $args );

        return ob_get_clean();
    }
}

/**
 * Validate a boolean variable
 *
 * @since 2.9.12
 *
 * @param mixed $var
 *
 * @return bool
 */
function dokan_validate_boolean( $var ) {
    return filter_var( $var, FILTER_VALIDATE_BOOLEAN );
}

/**
 * Backward compatibile settings option map
 *
 * @since 2.9.21
 *
 * @param string $option
 * @param string $section
 *
 * @return array
 */
function dokan_admin_settings_rearrange_map( $option, $section ) {
    $id = $option . '_' . $section;

    $map = apply_filters(
        'dokan_admin_settings_rearrange_map', [
            'shipping_fee_recipient_dokan_general'     => [ 'shipping_fee_recipient', 'dokan_selling' ],
            'tax_fee_recipient_dokan_general'          => [ 'tax_fee_recipient', 'dokan_selling' ],
            'store_open_close_dokan_general'           => [ 'store_open_close', 'dokan_appearance' ],
            'store_map_dokan_general'                  => [ 'store_map', 'dokan_appearance' ],
            'gmap_api_key_dokan_general'               => [ 'gmap_api_key', 'dokan_appearance' ],
            'contact_seller_dokan_general'             => [ 'contact_seller', 'dokan_appearance' ],
            'enable_theme_store_sidebar_dokan_general' => [ 'enable_theme_store_sidebar', 'dokan_appearance' ],
            'setup_wizard_logo_url_dokan_appearance'   => [ 'setup_wizard_logo_url', 'dokan_general' ],
            'disable_welcome_wizard_dokan_selling'     => [ 'disable_welcome_wizard', 'dokan_general' ],
        ]
    );

    if ( isset( $map[ $id ] ) ) {
        return $map[ $id ];
    }

    return [ $option, $section ];
}

/**
 * Dokan get terms and condition page url
 *
 * @since 2.9.16
 *
 * @return url | null on failure
 */
function dokan_get_terms_condition_url() {
    $page_id = dokan_get_option( 'reg_tc_page', 'dokan_pages' );

    if ( ! $page_id ) {
        return null;
    }

    return apply_filters( 'dokan_get_terms_condition_url', get_permalink( $page_id ), $page_id );
}

/**
 * Add item in specefic position of an array
 *
 * @since 2.9.21
 *
 * @param array      $array
 * @param int|string $position  <index position or name of the key after which you want to add the new array>
 * @param array      $new_array
 *
 * @return array
 */
function dokan_array_after( $array, $position, $new_array ) {
    if ( is_int( $position ) ) {
        return array_merge(
            array_slice( $array, 0, $position ),
            $new_array,
            array_slice( $array, $position )
        );
    }

    $pos = array_search( $position, array_keys( $array ) );

    return array_merge(
        array_slice( $array, 0, $pos + 1 ),
        $new_array,
        array_slice( $array, $pos )
    );
}

if ( ! function_exists( 'dokan_get_seller_status_count' ) ) {
    /**
     * Get Seller status counts, used in admin area
     *
     * @since 2.9.23
     *
     * @return array
     */
    function dokan_get_seller_status_count() {
        $active_users = new WP_User_Query(
            [
                'role__in'       => [ 'seller', 'administrator' ],
                'meta_key'   => 'dokan_enable_selling',
                'meta_value' => 'yes',
                'fields'     => 'ID',
            ]
        );

        $all_users      = new WP_User_Query(
            [
                'role__in' => [ 'seller', 'administrator' ],
                'fields'   => 'ID',
            ]
        );
        $active_count   = $active_users->get_total();
        $inactive_count = $all_users->get_total() - $active_count;

        return apply_filters(
            'dokan_get_seller_status_count', [
                'total'    => $active_count + $inactive_count,
                'active'   => $active_count,
                'inactive' => $inactive_count,
            ]
        );
    }
}
/**
 * Install an plugin from wp.org
 *
 * Example:
 * To download WooCommerce `dokan_install_wp_org_plugin( 'woocommerce' )`
 * To download plugin like dokan-lite that has different slug and main plugin file,
 * `dokan_install_wp_org_plugin( 'dokan-lite', 'dokan.php' )`
 *
 * @since 2.9.27
 *
 * @param string $plugin_slug
 * @param string $main_file
 *
 * @return bool|\WP_Error
 */
function dokan_install_wp_org_plugin( $plugin_slug, $main_file = null ) {
    $plugin = $plugin_slug . '/' . ( $main_file ? $main_file : $plugin_slug . '.php' );

    if ( ! file_exists( WP_PLUGIN_DIR . '/' . $plugin ) ) {
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        $api = plugins_api(
            'plugin_information', [
                'slug'   => $plugin_slug,
                'fields' => [
                    'sections' => false,
                ],
            ]
        );

        if ( is_wp_error( $api ) ) {
            return new WP_Error(
                'dokan_install_wp_org_plugin_error_api',
                sprintf( __( 'Unable to fetch plugin information from wordpress.org for %s.', 'dokan-lite' ), $plugin_slug )
            );
        }

        $upgrader  = new Plugin_Upgrader( new WP_Ajax_Upgrader_Skin() );
        $installed = $upgrader->install( $api->download_link );

        if ( is_wp_error( $installed ) ) {
            return $installed;
        } elseif ( ! $installed ) {
            return new WP_Error(
                'dokan_install_wp_org_plugin_error',
                sprintf( __( 'Unable to install %s from wordpress.org', 'dokan-lite' ), $plugin_slug )
            );
        }
    }

    $activate_plugin = activate_plugin( $plugin );

    if ( is_wp_error( $activate_plugin ) ) {
        return $activate_plugin;
    }

    return true;
}

/**
 * Redirect to Dokan admin setup wizard page
 *
 * @since 2.9.27
 *
 * @return void
 */
function dokan_redirect_to_admin_setup_wizard() {
    // Delete the redirect transient
    delete_transient( '_dokan_setup_page_redirect' );

    wp_safe_redirect( add_query_arg( [ 'page' => 'dokan-setup' ], admin_url( 'index.php' ) ) );
    exit;
}

/**
 * Dokan generate star ratings
 *
 * @since  3.0.0
 *
 * @param int $rating Number of rating point
 * @param int $starts Total number of stars
 *
 * @return string
 */
function dokan_generate_ratings( $rating, $stars ) {
    $result = '';

    for ( $i = 1; $i <= $stars; $i++ ) {
        if ( $rating >= $i ) {
            $result .= "<i class='dashicons dashicons-star-filled'></i>";
        } elseif ( $rating > ( $i - 1 ) && $rating < $i ) {
            $result .= "<i class='dashicons dashicons-star-half'></i>";
        } else {
            $result .= "<i class='dashicons dashicons-star-empty'></i>";
        }
    }

    return apply_filters( 'dokan_generate_ratings', $result );
}

/**
 * Check if current PHP version met the minimum requried PHP version for WooCommerce
 *
 * @since 3.0.0
 *
 * @param string $required_version
 *
 * @return bool
 */
function dokan_met_minimum_php_version_for_wc( $required_version = '7.0' ) {
    return apply_filters( 'dokan_met_minimum_php_version_for_wc', version_compare( PHP_VERSION, $required_version, '>=' ), $required_version );
}

/**
 * Checks if Dokan settings has map api key
 *
 * @since 3.0.2
 *
 * @return bool
 */
function dokan_has_map_api_key() {
    $dokan_appearance = get_option( 'dokan_appearance', [] );

    if ( 'google_maps' === $dokan_appearance['map_api_source'] && ! empty( $dokan_appearance['gmap_api_key'] ) ) {
        return true;
    } elseif ( 'mapbox' === $dokan_appearance['map_api_source'] && ! empty( $dokan_appearance['mapbox_access_token'] ) ) {
        return true;
    }

    return false;
}

/**
 * Dokan clear product caches.
 * We'll be calling `WC_Product_Data_Store_CPT::clear_caches()` to clear product caches.
 *
 * @since 3.0.3
 *
 * @param int|\WC_Product $product
 *
 * @return void
 */
function dokan_clear_product_caches( $product ) {
    if ( ! $product instanceof \WC_Product ) {
        $product = wc_get_product( $product );
    }

    $store       = \WC_Data_Store::load( 'product-' . $product->get_type() );
    $class       = $store->get_current_class_name();
    $class       = is_object( $class ) ? $class : new $class();
    $reflection  = new \ReflectionClass( $class );
    $method_name = 'clear_caches';

    if ( ! $reflection->hasMethod( $method_name ) ) {
        return;
    }

    $method = $reflection->getMethod( $method_name );
    $method->setAccessible( true );
    $method->invokeArgs( $class, [ &$product ] );
}

/**
 * Check which vendor info should be hidden
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param string $option
 *
 * @return bool|array if no param is passed
 */
function dokan_is_vendor_info_hidden( $option = null ) {
    $options = dokan_get_option( 'hide_vendor_info', 'dokan_appearance' );

    if ( is_null( $option ) ) {
        return $options;
    }

    return ! empty( $options[ $option ] );
}

/**
 * Function current_datetime() compatibility for wp version < 5.3
 *
 * @since 3.1.1
 * @throws Exception
 * @return DateTimeImmutable
 */
function dokan_current_datetime() {
    if ( function_exists( 'current_datetime' ) ) {
        return current_datetime();
    }

    return new DateTimeImmutable( 'now', dokan_wp_timezone() );
}

/**
 * Function wp_timezone() compatibility for wp version < 5.3
 *
 * @since 3.1.1
 *
 * @return DateTimeZone
 */
function dokan_wp_timezone() {
    if ( function_exists( 'wp_timezone' ) ) {
        return wp_timezone();
    }

    return new DateTimeZone( dokan_wp_timezone_string() );
}

/**
 * Function wp_timezone_string() compatibility for wp version < 5.3
 *
 * @since 3.1.1
 *
 * @return string
 */
function dokan_wp_timezone_string() {
    if ( function_exists( 'wp_timezone_string' ) ) {
        return wp_timezone_string();
    }

    $timezone_string = get_option( 'timezone_string' );

    if ( $timezone_string ) {
        return $timezone_string;
    }

    $offset  = (float) get_option( 'gmt_offset' );
    $hours   = (int) $offset;
    $minutes = ( $offset - $hours );

    $sign      = ( $offset < 0 ) ? '-' : '+';
    $abs_hour  = abs( $hours );
    $abs_mins  = abs( $minutes * 60 );
    $tz_offset = sprintf( '%s%02d:%02d', $sign, $abs_hour, $abs_mins );

    return $tz_offset;
}

/**
 * Get a formatted date from WordPress format
 *
 * @param string|timestamp $date the date string or timestamp
 * @param string|bool $format date format string or false for default WordPress date
 * @since 3.1.1
 *
 * @throws Exception
 * @return string|false The date, translated if locale specifies it. False on invalid timestamp input.
 */
function dokan_format_date( $date = '', $format = false ) {
    // if date is empty, get current datetime timestamp
    if ( empty( $date ) ) {
        $date = dokan_current_datetime()->getTimestamp();
    }

    // if no format is specified, get default WordPress date format
    if ( ! $format ) {
        $format = wc_date_format();
    }

    // if date is not timestamp, convert it to timestamp
    if ( ! is_numeric( $date ) && strtotime( $date ) ) {
        $date = dokan_current_datetime()->modify( $date )->getTimestamp();
    }

    if ( function_exists( 'wp_date' ) ) {
        return wp_date( $format, $date );
    }

    return date_i18n( $format, $date );
}

/**
 * Get threshold day for a user
 *
 * @param $user_id
 *
 * @since DOKAN_LITE_SINCE
 *
 * @return integer threshold day
 */
function dokan_get_withdraw_threshold( $user_id ) {
    if ( get_user_meta( $user_id, 'withdraw_date_limit', true ) !== '' ) {
        $threshold_day = get_user_meta( $user_id, 'withdraw_date_limit', true );
    } else {
        $threshold_day = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', 0 );
    }

    return ( $threshold_day ) ? absint( $threshold_day ) : 0;
}
