<?php

require_once dirname(__FILE__) . '/product-functions.php';
require_once dirname(__FILE__) . '/order-functions.php';
require_once dirname(__FILE__) . '/withdraw-functions.php';


/**
 * Check if a user is seller
 *
 * @param int $user_id
 * @return boolean
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
 * @return boolean
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
 * @param int $product_id
 * @return boolean
 */
function dokan_is_product_author( $product_id = 0 ) {
    global $post;

    if ( !$product_id ) {
        $author = $post->post_author;
    } else {
        $author = get_post_field( 'post_author', $product_id );
    }

    if ( $author == get_current_user_id() ) {
        return true;
    }

    return false;
}

/**
 * Check if it's a store page
 *
 * @return boolean
 */
function dokan_is_store_page() {
    $custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

    if ( get_query_var( $custom_store_url ) ) {
        return true;
    }

    return false;
}

/**
 * Check if it's a Seller Dashboard page
 *
 * @since 2.4.9
 *
 * @return boolean
 */
function dokan_is_seller_dashboard() {
    $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

    if ( ! $page_id ) {
        return false;
    }

    if ( $page_id == get_the_ID() ) {
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
        wp_redirect( $url );
        exit;
    }
}

/**
 * If the current user is not seller, redirect to homepage
 *
 * @param string $redirect
 */
function dokan_redirect_if_not_seller( $redirect = '' ) {
    if ( !dokan_is_user_seller( get_current_user_id() ) ) {
        $redirect = empty( $redirect ) ? home_url( '/' ) : $redirect;

        wp_redirect( $redirect );
        exit;
    }
}

/**
 * Handles the product delete action
 *
 * @return void
 */
function dokan_delete_product_handler() {
    if ( isset( $_GET['action'] ) && $_GET['action'] == 'dokan-delete-product' ) {
        $product_id = isset( $_GET['product_id'] ) ? (int) $_GET['product_id'] : 0;

        if ( !$product_id ) {
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            return;
        }

        if ( !wp_verify_nonce( $_GET['_wpnonce'], 'dokan-delete-product' ) ) {
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            return;
        }

        if ( !dokan_is_product_author( $product_id ) ) {
            wp_redirect( add_query_arg( array( 'message' => 'error' ), dokan_get_navigation_url( 'products' ) ) );
            return;
        }

        wp_delete_post( $product_id );

        $redirect = apply_filters( 'dokan_add_new_product_redirect', dokan_get_navigation_url( 'products' ), '' );

        wp_redirect( add_query_arg( array( 'message' => 'product_deleted' ),  $redirect ) );

        exit;
    }
}

/**
 * Count post type from a user
 *
 * @global WPDB $wpdb
 * @param string $post_type
 * @param int $user_id
 * @return array
 */
function dokan_count_posts( $post_type, $user_id ) {
    global $wpdb;

    $cache_key = 'dokan-count-' . $post_type . '-' . $user_id;
    $counts = wp_cache_get( $cache_key, 'dokan-lite' );

    if ( false === $counts ) {
        $query = "SELECT post_status, COUNT( * ) AS num_posts FROM {$wpdb->posts} WHERE post_type = %s AND post_author = %d GROUP BY post_status";
        $results = $wpdb->get_results( $wpdb->prepare( $query, $post_type, $user_id ), ARRAY_A );
        $post_status = array_keys( dokan_get_post_status() );
        $counts = array_fill_keys( get_post_stati(), 0 );

        $total = 0;
        foreach ( $results as $row ) {
            if ( ! in_array( $row['post_status'], $post_status ) ) {
                continue;
            }

            $counts[ $row['post_status'] ] = (int) $row['num_posts'];
            $total += (int) $row['num_posts'];
        }

        $counts['total'] = $total;
        $counts = (object) $counts;
        wp_cache_set( $cache_key, $counts, 'dokan-lite' );
    }

    return $counts;
}

/**
 * Get comment count based on post type and user id
 *
 * @global WPDB $wpdb
 * @global WP_User $current_user
 * @param string $post_type
 * @param int $user_id
 * @return array
 */
function dokan_count_comments( $post_type, $user_id ) {
    global $wpdb;

    $cache_key = 'dokan-count-comments-' . $post_type . '-' . $user_id;
    $counts = wp_cache_get( $cache_key, 'dokan-lite' );

    if ( $counts === false ) {
        $query = "SELECT c.comment_approved, COUNT( * ) AS num_comments
            FROM $wpdb->comments as c, $wpdb->posts as p
            WHERE p.post_author = %d AND
                p.post_status = 'publish' AND
                c.comment_post_ID = p.ID AND
                p.post_type = %s
            GROUP BY c.comment_approved";

        $count = $wpdb->get_results( $wpdb->prepare( $query, $user_id, $post_type ), ARRAY_A );

        $counts = array('moderated' => 0, 'approved' => 0, 'spam' => 0, 'trash' => 0, 'total' => 0);
        $statuses = array('0' => 'moderated', '1' => 'approved', 'spam' => 'spam', 'trash' => 'trash', 'post-trashed' => 'post-trashed');
        $total = 0;
        foreach ($count as $row) {
            if ( isset( $statuses[$row['comment_approved']] ) ) {
                $counts[$statuses[$row['comment_approved']]] = (int) $row['num_comments'];
                $total += (int) $row['num_comments'];
            }
        }
        $counts['total'] = $total;

        $counts = (object) $counts;
        wp_cache_set( $cache_key, $counts, 'dokan-lite' );
    }

    return $counts;
}

/**
 * Get total pageview for a seller
 *
 * @global WPDB $wpdb
 * @param int $seller_id
 * @return int
 */
function dokan_author_pageviews( $seller_id ) {
    global $wpdb;

    $cache_key = 'dokan-pageview-' . $seller_id;
    $pageview = wp_cache_get( $cache_key, 'dokan-lite' );

    if ( $pageview === false ) {
        $sql = "SELECT SUM(meta_value) as pageview
            FROM {$wpdb->postmeta} AS meta
            LEFT JOIN {$wpdb->posts} AS p ON p.ID = meta.post_id
            WHERE meta.meta_key = 'pageview' AND p.post_author = %d AND p.post_status IN ('publish', 'pending', 'draft')";

        $count = $wpdb->get_row( $wpdb->prepare( $sql, $seller_id ) );
        $pageview = $count->pageview;

        wp_cache_set( $cache_key, $pageview, 'dokan-lite' );
    }

    return $pageview;
}

/**
 * Get total sales amount of a seller
 *
 * @global WPDB $wpdb
 * @param int $seller_id
 * @return float
 */
function dokan_author_total_sales( $seller_id ) {
    global $wpdb;

    $cache_key = 'dokan-earning-' . $seller_id;
    $earnings = wp_cache_get( $cache_key, 'dokan-lite' );

    if ( $earnings === false ) {

        $sql = "SELECT SUM(order_total) as earnings
            FROM {$wpdb->prefix}dokan_orders as do LEFT JOIN {$wpdb->prefix}posts as p ON do.order_id = p.ID
            WHERE seller_id = %d AND order_status IN('wc-completed', 'wc-processing', 'wc-on-hold')";

        $count = $wpdb->get_row( $wpdb->prepare( $sql, $seller_id ) );
        $earnings = $count->earnings;

        wp_cache_set( $cache_key, $earnings, 'dokan-lite' );
    }

    return apply_filters( 'dokan_seller_total_sales', $earnings );
}

/**
 * Generate dokan sync table
 * @deprecated since 2.4.3
 * @global WPDB $wpdb
 */
function dokan_generate_sync_table() {
    global $wpdb;

    $sql = "SELECT oi.order_id, p.ID as product_id, p.post_title, p.post_author as seller_id,
                oim2.meta_value as order_total, p.post_status as order_status
            FROM {$wpdb->prefix}woocommerce_order_items oi
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oim.order_item_id = oi.order_item_id
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2 ON oim2.order_item_id = oi.order_item_id
            INNER JOIN $wpdb->posts p ON oi.order_id = p.ID
            WHERE
                oim.meta_key = '_product_id' AND
                oim2.meta_key = '_line_total'
            GROUP BY oi.order_id";

    $orders = $wpdb->get_results( $sql );
    $table_name = $wpdb->prefix . 'dokan_orders';

    $wpdb->query( 'TRUNCATE TABLE ' . $table_name );

    if ( $orders ) {
        foreach ($orders as $order) {
            $admin_commission   = dokan_get_admin_commission_by( $order, $order->seller_id );

            $wpdb->insert(
                $table_name,
                array(
                    'order_id'     => $order->order_id,
                    'seller_id'    => $order->seller_id,
                    'order_total'  => $order->order_total,
                    'net_amount'   => $order_total - $admin_commission,
                    'order_status' => $order->order_status,
                ),
                array(
                    '%d',
                    '%d',
                    '%f',
                    '%f',
                    '%s',
                )
            );
        } // foreach
    } // if
}

if ( !function_exists( 'dokan_get_seller_earnings_by_order' ) ) {

 /**
 * Get Seller's net Earnings from a order
 *
 * @since 2.5.2
 *
 * @param WC_ORDER $order
 *
 * @param int $seller_id
 *
 * @return int $earned
 */
    function dokan_get_seller_earnings_by_order( $order, $seller_id ) {

        $products = $order->get_items();
        $earned   = 0;

        foreach ( $products as $product ) {
            $comission = dokan_get_seller_percentage( $seller_id, $product['product_id'] );
            $earned    = $earned + ( ( $product['line_total'] * $comission ) / 100 );
        }

        return $earned;
    }
}
if ( !function_exists( 'dokan_get_seller_percentage' ) ) :

/**
 * Get store seller percentage settings
 *
 * @param int $seller_id
 * @return int
 */
function dokan_get_seller_percentage( $seller_id = 0, $product_id = 0 ) {

    //return product wise percentage
    if ( $product_id ) {
        $_per_product_commission = get_post_meta( $product_id, '_per_product_commission', true );
        if ( $_per_product_commission != '' ) {
            return (float) $_per_product_commission;
        }
    }

    //return seller wise percentage
    if ( $seller_id ) {
        $seller_percentage = get_user_meta( $seller_id, 'dokan_seller_percentage', true );
        if ( $seller_percentage != '' ) {
            return (float) $seller_percentage;
        }
    }

    $global_percentage = dokan_get_option( 'seller_percentage', 'dokan_selling' , 10 );
    return $global_percentage;
}

endif;

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

    if ( isset($_SERVER['HTTP_CLIENT_IP'] ) ) {
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    } else if ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else if ( isset( $_SERVER['HTTP_X_FORWARDED'] ) ) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    } else if ( isset( $_SERVER['HTTP_FORWARDED_FOR'] ) ) {
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } else if ( isset( $_SERVER['HTTP_FORWARDED'] ) ) {
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    } else if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    } else {
        $ipaddress = 'UNKNOWN';
    }

    return $ipaddress;
}

/**
 * Datetime format helper function
 *
 * @param string $datetime
 * @return string
 */
function dokan_format_time( $datetime ) {
    $timestamp = strtotime( $datetime );

    $date_format = get_option( 'date_format' );
    $time_format = get_option( 'time_format' );

    return date_i18n( $date_format . ' ' . $time_format, $timestamp );
}

/**
 * generate a input box based on arguments
 *
 * @param int $post_id
 * @param string $meta_key
 * @param array $attr
 * @param string $type
 */
function dokan_post_input_box( $post_id, $meta_key, $attr = array(), $type = 'text'  ) {
    $placeholder = isset( $attr['placeholder'] ) ? esc_attr( $attr['placeholder'] ) : '';
    $class       = isset( $attr['class'] ) ? esc_attr( $attr['class'] ) : 'dokan-form-control';
    $name        = isset( $attr['name'] ) ? esc_attr( $attr['name'] ) : $meta_key;
    $value       = isset( $attr['value'] ) ? $attr['value'] : get_post_meta( $post_id, $meta_key, true );
    $size        = isset( $attr['size'] ) ? $attr['size'] : 30;
    $required    = isset( $attr['required'] ) ? 'required="required"' : '';

    switch ($type) {
        case 'text':
            ?>
            <input <?php echo $required; ?> type="text" name="<?php echo $name; ?>" id="<?php echo $name; ?>" value="<?php echo esc_attr( $value ); ?>" class="<?php echo $class; ?>" placeholder="<?php echo $placeholder; ?>">
            <?php
            break;

        case 'textarea':
            $rows = isset( $attr['rows'] ) ? absint( $attr['rows'] ) : 4;
            ?>
            <textarea name="<?php echo $name; ?>" id="<?php echo $name; ?>" rows="<?php echo $rows; ?>" class="<?php echo $class; ?>" placeholder="<?php echo $placeholder; ?>"><?php echo esc_textarea( $value ); ?></textarea>
            <?php
            break;

        case 'checkbox':
            $label = isset( $attr['label'] ) ? $attr['label'] : '';
            $class = ( $class == 'dokan-form-control' ) ? '' : $class;
            ?>

            <label class="<?php echo $class; ?>" for="<?php echo $name; ?>">
                <input type="hidden" name="<?php echo $name; ?>" value="no">
                <input name="<?php echo $name; ?>" id="<?php echo $name; ?>" value="yes" type="checkbox"<?php checked( $value, 'yes' ); ?>>
                <?php echo $label; ?>
            </label>

            <?php
            break;

        case 'select':
            $options = is_array( $attr['options'] ) ? $attr['options'] : array();
            ?>
            <select name="<?php echo $name; ?>" id="<?php echo $name; ?>" class="<?php echo $class; ?>">
                <?php foreach ($options as $key => $label) { ?>
                    <option value="<?php echo esc_attr( $key ); ?>"<?php selected( $value, $key ); ?>><?php echo $label; ?></option>
                <?php } ?>
            </select>

            <?php
            break;

        case 'number':
            $min = isset( $attr['min'] ) ? $attr['min'] : 0;
            $step = isset( $attr['step'] ) ? $attr['step'] : 'any';
            ?>
            <input <?php echo $required; ?> type="number" name="<?php echo $name; ?>" id="<?php echo $name; ?>" value="<?php echo esc_attr( $value ); ?>" class="<?php echo $class; ?>" placeholder="<?php echo $placeholder; ?>" min="<?php echo esc_attr( $min ); ?>" step="<?php echo esc_attr( $step ); ?>" size="<?php echo esc_attr( $size ); ?>">
            <?php
            break;

        case 'radio':
            $options = is_array( $attr['options'] ) ? $attr['options'] : array();
            foreach ( $options as $key => $label ) {
            ?>
            <label class="<?php echo $class; ?>" for="<?php echo $key; ?>">
                <input name="<?php echo $name; ?>" id="<?php echo $key; ?>" value="<?php echo $key; ?>" type="radio"<?php checked( $value, $key ); ?>>
                <?php echo $label; ?>
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

    $statuses = apply_filters( 'dokan_get_post_status', array(
        'publish' => __( 'Online', 'dokan-lite' ),
        'draft'   => __( 'Draft', 'dokan-lite' ),
        'pending' => __( 'Pending Review', 'dokan-lite' )
    ) );

    if ( $status ) {
        return isset( $statuses[$status] ) ? $statuses[$status] : '';
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

    $labels = apply_filters( 'dokan_get_post_status_label_class', array(
        'publish' => 'dokan-label-success',
        'draft'   => 'dokan-label-default',
        'pending' => 'dokan-label-danger'
    ) );

    if ( $status ) {
        return isset( $labels[$status] ) ? $labels[$status] : '';
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

    $types = apply_filters( 'dokan_get_product_types', array(
        'simple'   => __( 'Simple Product', 'dokan-lite' ),
        'variable' => __( 'Variable Product', 'dokan-lite' ),
        'grouped'  => __( 'Grouped Product', 'dokan-lite' ),
        'external' => __( 'Scheduled Product', 'dokan-lite' )
    ) );

    if ( $status ) {
        return isset( $types[$status] ) ? $types[$status] : '';
    }

    return $types;
}

/**
 * Helper function for input text field
 *
 * @param string $key
 * @return string
 */
function dokan_posted_input( $key, $array = false ) {

    //If array value is submitted return array
    if ( $array && isset( $_POST[$key] ) ) {
        return $_POST[$key];
    }

    $value = isset( $_POST[$key] ) ? trim( $_POST[$key] ) : '';
    return esc_attr( $value );
}

/**
 * Helper function for input textarea
 *
 * @param string $key
 * @return string
 */
function dokan_posted_textarea( $key ) {
    $value = isset( $_POST[$key] ) ? trim( $_POST[$key] ) : '';

    return esc_textarea( $value );
}

/**
 * Get template part implementation for wedocs
 *
 * Looks at the theme directory first
 */
function dokan_get_template_part( $slug, $name = '', $args = array() ) {
    $dokan = WeDevs_Dokan::init();

    $defaults = array(
        'pro' => false
    );

    $args = wp_parse_args( $args, $defaults );

    if ( $args && is_array( $args ) ) {
        extract( $args );
    }

    $template = '';

    // Look in yourtheme/dokan/slug-name.php and yourtheme/dokan/slug.php
    $template = locate_template( array( $dokan->template_path() . "{$slug}-{$name}.php", $dokan->template_path() . "{$slug}.php" ) );

    /**
     * Change template directory path filter
     *
     * @since 2.5.3
     */
    $template_path = apply_filters( 'dokan_set_template_path', $dokan->plugin_path() . '/templates', $template, $args );

    // Get default slug-name.php
    if ( ! $template && $name && file_exists( $template_path . "/{$slug}-{$name}.php" ) ) {
        $template = $template_path . "/{$slug}-{$name}.php";
    }

    if ( ! $template && !$name && file_exists( $template_path . "/{$slug}.php" ) ) {
        $template = $template_path . "/{$slug}.php";
    }

    // Allow 3rd party plugin filter template file from their plugin
    $template = apply_filters( 'dokan_get_template_part', $template, $slug, $name );

    if ( $template ) {
        include( $template );
    }
}

/**
 * Get other templates (e.g. product attributes) passing attributes and including the file.
 *
 * @access public
 * @param mixed $template_name
 * @param array $args (default: array())
 * @param string $template_path (default: '')
 * @param string $default_path (default: '')
 * @return void
 */
function dokan_get_template( $template_name, $args = array(), $template_path = '', $default_path = '' ) {
    if ( $args && is_array( $args ) ) {
        extract( $args );
    }

    $located = dokan_locate_template( $template_name, $template_path, $default_path );

    if ( ! file_exists( $located ) ) {
        _doing_it_wrong( __FUNCTION__, sprintf( '<code>%s</code> does not exist.', $located ), '2.1' );
        return;
    }

    do_action( 'dokan_before_template_part', $template_name, $template_path, $located, $args );

    include( $located );

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
 * @access public
 * @param mixed $template_name
 * @param string $template_path (default: '')
 * @param string $default_path (default: '')
 * @return string
 */
function dokan_locate_template( $template_name, $template_path = '', $default_path = '', $pro = false ) {
    $dokan = WeDevs_Dokan::init();

    if ( ! $template_path ) {
        $template_path = $dokan->template_path();
    }

    if ( ! $default_path ) {
        $default_path = $dokan->plugin_path() . '/templates/';
    }

    // Look within passed path within the theme - this is priority
    $template = locate_template(
        array(
            trailingslashit( $template_path ) . $template_name,
        )
    );

    // Get default template
    if ( ! $template ) {
        $template = $default_path . $template_name;
    }

    // Return what we found
    return apply_filters('dokan_locate_template', $template, $template_name, $template_path );
}

/**
 * Get page permalink based on context
 *
 * @param string $page
 * @param string $context
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
 * @param type $product_id
 * @return type
 */
function dokan_edit_product_url( $product_id ) {
    if ( get_post_field( 'post_status', $product_id ) == 'publish' ) {
        return trailingslashit( get_permalink( $product_id ) ). 'edit/';
    }

    $new_product_url = dokan_get_navigation_url('products');

    return add_query_arg( array( 'product_id' => $product_id, 'action' => 'edit' ), $new_product_url );
}

/**
 * Ads additional columns to admin user table
 *
 * @param array $columns
 * @return array
 */
function my_custom_admin_product_columns( $columns ) {
    $columns['author'] = __( 'Author', 'dokan-lite' );

    return $columns;
}

add_filter( 'manage_edit-product_columns', 'my_custom_admin_product_columns' );


/**
 * Get the value of a settings field
 *
 * @param string $option settings field name
 * @param string $section the section name this field belongs to
 * @param string $default default text if it's not found
 * @return mixed
 */
function dokan_get_option( $option, $section, $default = '' ) {

    $options = get_option( $section );

    if ( isset( $options[$option] ) && !empty( $options[$option] ) ) {
        return $options[$option];
    }

    return $default;
}

/**
 * Redirect users from standard WordPress register page to woocommerce
 * my account page
 *
 * @global string $action
 */
function dokan_redirect_to_register(){
    global $action;

    if ( $action == 'register' ) {
        wp_redirect( dokan_get_page_url( 'myaccount', 'woocommerce' ) );
        exit;
    }
}

add_action( 'login_init', 'dokan_redirect_to_register' );

/**
 * Pretty print a variable
 *
 * @param var $value
 */
function dokan_pre( $value ) {
    printf( '<pre>%s</pre>', print_r( $value, true ) );
}

/**
 * Check if the seller is enabled
 *
 * @param int $user_id
 * @return boolean
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
 * @return boolean
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
 * @return string
 */
function dokan_get_store_url( $user_id ) {
    $userdata = get_userdata( $user_id );
    $user_nicename = ( !false == $userdata ) ? $userdata->user_nicename : '';

    $custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );
    return sprintf( '%s/%s/', home_url( '/' . $custom_store_url ), $user_nicename );
}

/**
 * Check if current page is store review page
 *
 * @since 2.2
 *
 * @return boolean
 */
function dokan_is_store_review_page() {
    if ( get_query_var( 'store_review' ) == 'true' ) {
        return true;
    }

    return false;
}

/**
 * Helper function for loggin
 *
 * @param string $message
 */
function dokan_log( $message ) {
    $message = sprintf( "[%s] %s\n", date( 'd.m.Y h:i:s' ), $message );
    error_log( $message, 3, DOKAN_DIR . '/debug.log' );
}

/**
 * Filter WP Media Manager files if the current user is seller.
 *
 * Do not show other sellers images to a seller. He can see images only by him
 *
 * @param array $args
 * @return array
 */
function dokan_media_uploader_restrict( $args ) {
    // bail out for admin and editor
    if ( current_user_can( 'delete_pages' ) ) {
        return $args;
    }

    if ( current_user_can( 'dokandar' ) ) {
        $args['author'] = get_current_user_id();

        return $args;
    }

    return $args;
}

add_filter( 'ajax_query_attachments_args', 'dokan_media_uploader_restrict' );

/**
 * Get store info based on seller ID
 *
 * @param int $seller_id
 * @return array
 */
function dokan_get_store_info( $seller_id ) {
    $info = get_user_meta( $seller_id, 'dokan_profile_settings', true );
    $info = is_array( $info ) ? $info : array();

    $defaults = array(
        'store_name' => '',
        'social'     => array(),
        'payment'    => array( 'paypal' => array( 'email' ), 'bank' => array() ),
        'phone'      => '',
        'show_email' => 'off',
        'address'    => '',
        'location'   => '',
        'banner'     => 0
    );

    $info               = wp_parse_args( $info, $defaults );
    $info['store_name'] = empty( $info['store_name'] ) ? get_user_by( 'id', $seller_id )->display_name : $info['store_name'];

    return $info;
}

/**
 * Get tabs for showing in a single store page
 *
 * @since 2.2
 *
 * @param  int  $store_id
 *
 * @return array
 */
function dokan_get_store_tabs( $store_id ) {

    $tabs = array(
        'products' => array(
            'title' => __( 'Products', 'dokan-lite' ),
            'url'   => dokan_get_store_url( $store_id )
        ),
    );

    $store_info = dokan_get_store_info( $store_id );
    $tnc_enable = dokan_get_option( 'seller_enable_terms_and_conditions', 'dokan_general', 'off' );

    if ( isset($store_info['enable_tnc']) && $store_info['enable_tnc'] == 'on' && $tnc_enable == 'on' ) {
        $tabs['terms_and_conditions'] = array(
            'title' => __( 'Terms and Conditions', 'dokan-lite' ),
            'url'   => dokan_get_toc_url( $store_id )
        );
    }

    return apply_filters( 'dokan_store_tabs', $tabs, $store_id );
}

/**
 * Get withdraw email method based on seller ID and type
 *
 * @param int $seller_id
 * @param string $type
 * @return string
 */
function dokan_get_seller_withdraw_mail( $seller_id, $type = 'paypal' ) {
    $info = dokan_get_store_info( $seller_id );

    if ( isset( $info['payment'][$type]['email'] ) ) {
        return $info['payment'][$type]['email'];
    }

    return false;
}

/**
 * Get seller bank details
 *
 * @param int $seller_id
 * @return string
 */
function dokan_get_seller_bank_details( $seller_id ) {
    $info = dokan_get_store_info( $seller_id );
    $payment = $info['payment']['bank'];
    $details = array();

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
function dokan_get_sellers( $args = array() ) {

    $defaults = array(
        'role'       => 'seller',
        'number'     => 10,
        'offset'     => 0,
        'orderby'    => 'registered',
        'order'      => 'ASC',
        'meta_query' => array(
            array(
                'key'     => 'dokan_enable_selling',
                'value'   => 'yes',
                'compare' => '='
            )
        )
    );

    $args = wp_parse_args( $args, $defaults );

    $user_query = new WP_User_Query( $args );
    $sellers    = $user_query->get_results();

    return array( 'users' => $sellers, 'count' => $user_query->total_users );
}

/**
 * Put data with post_date's into an array of times
 *
 * @param  array $data array of your data
 * @param  string $date_key key for the 'date' field. e.g. 'post_date'
 * @param  string $data_key key for the data you are charting
 * @param  int $interval
 * @param  string $start_date
 * @param  string $group_by
 * @return string
 */
function dokan_prepare_chart_data( $data, $date_key, $data_key, $interval, $start_date, $group_by ) {
    $prepared_data = array();

    // Ensure all days (or months) have values first in this range
    if ( 'day' === $group_by ) {
        for ( $i = 0; $i <= $interval; $i ++ ) {
            $time = strtotime( date( 'Ymd', strtotime( "+{$i} DAY", $start_date ) ) ) . '000';

            if ( ! isset( $prepared_data[ $time ] ) ) {
                $prepared_data[ $time ] = array( esc_js( $time ), 0 );
            }
        }
    } else {
        $current_yearnum  = date( 'Y', $start_date );
        $current_monthnum = date( 'm', $start_date );

        for ( $i = 0; $i <= $interval; $i ++ ) {
            $time = strtotime( $current_yearnum . str_pad( $current_monthnum, 2, '0', STR_PAD_LEFT ) . '01' ) . '000';

            if ( ! isset( $prepared_data[ $time ] ) ) {
                $prepared_data[ $time ] = array( esc_js( $time ), 0 );
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
            case 'day' :
                $time = strtotime( date( 'Ymd', strtotime( $d->$date_key ) ) ) . '000';
            break;
            case 'month' :
            default :
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
 * Get seller count based on enable and disabled sellers
 *
 * @global WPDB $wpdb
 * @return array
 */
function dokan_get_seller_count() {

    $inactive_sellers = dokan_get_sellers( array(
        'number'     => -1,
        'meta_query' => array(
            array(
                'key'     => 'dokan_enable_selling',
                'value'   => 'no',
                'compare' => '='
            )
        )
    ) );

    $active_sellers = dokan_get_sellers( array(
        'number' => -1,
    ) );

    return array(
        'inactive' => $inactive_sellers['count'],
        'active'   => $active_sellers['count']
    );
}

/**
 * Prevent sellers and customers from seeing the admin bar
 *
 * @param bool $show_admin_bar
 * @return bool
 */
function dokan_disable_admin_bar( $show_admin_bar ) {
    global $current_user;

    if ( $current_user->ID !== 0 ) {
        $role = reset( $current_user->roles );

        if ( in_array( $role, array( 'seller', 'customer' ) ) ) {
            return false;
        }
    }

    return $show_admin_bar;
}

add_filter( 'show_admin_bar', 'dokan_disable_admin_bar' );

/**
 * Human readable number format.
 *
 * Shortens the number by dividing 1000
 *
 * @param type $number
 * @return type
 */
function dokan_number_format( $number ) {
    $threshold = 10000;

    if ( $number > $threshold ) {
        return number_format( $number/1000, 0, '.', '' ) . ' K';
    }

    return $number;
}

/**
 * Get coupon edit url
 *
 * @param int $coupon_id
 * @param string $coupon_page
 * @return string
 */
function dokan_get_coupon_edit_url( $coupon_id, $coupon_page = '' ) {

    if ( !$coupon_page ) {
        $coupon_page = dokan_get_page_url( 'coupons' );
    }

    $edit_url = wp_nonce_url( add_query_arg( array('post' => $coupon_id, 'action' => 'edit', 'view' => 'add_coupons'), $coupon_page ), '_coupon_nonce', 'coupon_nonce_url' );

    return $edit_url;
}

/**
 * User avatar wrapper for custom uploaded avatar
 *
 * @since 2.0
 *
 * @param string $avatar
 * @param mixed $id_or_email
 * @param int $size
 * @param string $default
 * @param string $alt
 * @return string image tag of the user avatar
 */
function dokan_get_avatar( $avatar, $id_or_email, $size, $default, $alt ) {

    if ( is_numeric( $id_or_email ) ) {
        $user = get_user_by( 'id', $id_or_email );
    } elseif ( is_object( $id_or_email ) ) {
        if ( $id_or_email->user_id != '0' ) {
            $user = get_user_by( 'id', $id_or_email->user_id );
        } else {
            return $avatar;
        }
    } else {
        $user = get_user_by( 'email', $id_or_email );
    }

    if ( !$user ) {
        return $avatar;
    }

    // see if there is a user_avatar meta field
    $user_avatar = get_user_meta( $user->ID, 'dokan_profile_settings', true );
    $gravatar_id = isset( $user_avatar['gravatar'] ) ? $user_avatar['gravatar'] : 0;
    if ( empty( $gravatar_id ) ) {
        return $avatar;
    }

    $avater_url = wp_get_attachment_thumb_url( $gravatar_id );

    return sprintf( '<img src="%1$s" alt="%2$s" width="%3$s" height="%3$s" class="avatar photo">', esc_url( $avater_url ), $alt, $size );
}

add_filter( 'get_avatar', 'dokan_get_avatar', 99, 5 );

/**
 * Get navigation url for the dokan dashboard
 *
 * @param  string $name endpoint name
 * @return string url
 */
function dokan_get_navigation_url( $name = '' ) {
    $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

    if ( ! $page_id ) {
        return;
    }

    if ( ! empty( $name ) ) {
        $url = get_permalink( $page_id ) . $name.'/';
    } else {
        $url = get_permalink( $page_id );
    }

    return apply_filters( 'dokan_get_navigation_url', $url, $name );
}


/**
 * Generate country dropdwon
 *
 * @param array $options
 * @param string $selected
 * @param bool $everywhere
 */
function dokan_country_dropdown( $options, $selected = '', $everywhere = false ) {
    printf( '<option value="">%s</option>', __( '- Select a location -', 'dokan-lite' ) );

    if ( $everywhere ) {
        echo '<optgroup label="--------------------------">';
        printf( '<option value="everywhere"%s>%s</option>', selected( $selected, 'everywhere', true ), __( 'Everywhere Else', 'dokan-lite' ) );
        echo '</optgroup>';
    }

    echo '<optgroup label="------------------------------">';
    foreach ($options as $key => $value) {
        printf( '<option value="%s"%s>%s</option>', $key, selected( $selected, $key, true ), $value );
    }
    echo '</optgroup>';
}

/**
 * Generate country dropdwon
 *
 * @param array $options
 * @param string $selected
 * @param bool $everywhere
 */
function dokan_state_dropdown( $options, $selected = '', $everywhere = false ) {
    printf( '<option value="">%s</option>', __( '- Select a State -', 'dokan-lite' ) );

    if ( $everywhere ) {
        echo '<optgroup label="--------------------------">';
        printf( '<option value="everywhere" %s>%s</option>', selected( $selected, 'everywhere', true ), __( 'Everywhere Else', 'dokan-lite' ) );
        echo '</optgroup>';
    }

    echo '<optgroup label="------------------------------">';
    foreach ($options as $key => $value) {
        printf( '<option value="%s" %s>%s</option>', $key, selected( $selected, $key, true ), $value );
    }
    echo '</optgroup>';
}

/**
 * Shupping Processing time dropdown options
 *
 * @return array
 */
function dokan_get_shipping_processing_times() {
    $times = array(
        '' => __( 'Ready to ship in...', 'dokan-lite' ),
        '1' => __( '1 business day', 'dokan-lite' ),
        '2' => __( '1-2 business day', 'dokan-lite' ),
        '3' => __( '1-3 business day', 'dokan-lite' ),
        '4' => __( '3-5 business day', 'dokan-lite' ),
        '5' => __( '1-2 weeks', 'dokan-lite' ),
        '6' => __( '2-3 weeks', 'dokan-lite' ),
        '7' => __( '3-4 weeks', 'dokan-lite' ),
        '8' => __( '4-6 weeks', 'dokan-lite' ),
        '9' => __( '6-8 weeks', 'dokan-lite' ),
    );

    return apply_filters( 'dokan_shipping_processing_times', $times );
}

/**
 * Get a single processing time string
 *
 * @param string $index
 * @return string
 */
function dokan_get_processing_time_value( $index ) {
    $times = dokan_get_shipping_processing_times();

    if ( isset( $times[$index] ) ) {
        return $times[$index];
    }
}

/**
 * Adds seller email to the new order notification email
 *
 * @param string  $admin_email
 * @param WC_Order $order
 *
 * @return array
 */
function dokan_wc_email_recipient_add_seller( $email, $order ) {

    if ( $order ) {

        if ( get_post_meta( dokan_get_prop( $order, 'id' ), 'has_sub_order', true ) == true ) {
            return $email;
        }

        $sellers = dokan_get_seller_id_by_order( dokan_get_prop( $order, 'id' ) );

        //if more than 1 seller
        if ( count( $sellers ) > 1 ) {
            foreach ( $sellers as $seller_id ) {
                $seller       = get_userdata( $seller_id );
                $seller_email = $seller->user_email;

                if ( $email != $seller_email ) {
                    $email .= ',' . $seller_email;
                }
            }
        } else {
            //if single seller is returned
            $seller       = get_userdata( $sellers );
            $seller_email = $seller->user_email;

            if ( $email != $seller_email ) {
                $email .= ',' . $seller_email;
            }
        }
    }

    return $email;
}

add_filter( 'woocommerce_email_recipient_new_order', 'dokan_wc_email_recipient_add_seller', 10, 2 );

/**
 * Display a monthly dropdown for filtering product listing on seller dashboard
 *
 * @since 2.1
 * @access public
 *
 * @param int $user_id
 */
function dokan_product_listing_filter_months_dropdown( $user_id ) {
    global $wpdb, $wp_locale;

    $months = $wpdb->get_results( $wpdb->prepare( "
        SELECT DISTINCT YEAR( post_date ) AS year, MONTH( post_date ) AS month
        FROM $wpdb->posts
        WHERE post_type = 'product'
        AND post_author = %d
        ORDER BY post_date DESC
    ", $user_id )  );

    /**
     * Filter the 'Months' drop-down results.
     *
     * @since 2.1
     *
     * @param object $months    The months drop-down query results.
     */
    $months = apply_filters( 'months_dropdown_results', $months );

    $month_count = count( $months );

    if ( !$month_count || ( 1 == $month_count && 0 == $months[0]->month ) )
        return;

    $date = isset( $_GET['date'] ) ? (int) $_GET['date'] : 0;
    ?>
    <select name="date" id="filter-by-date" class="dokan-form-control">
        <option<?php selected( $date, 0 ); ?> value="0"><?php _e( 'All dates' ); ?></option>
    <?php
    foreach ( $months as $arc_row ) {
        if ( 0 == $arc_row->year )
            continue;

        $month = zeroise( $arc_row->month, 2 );
        $year = $arc_row->year;

        printf( "<option %s value='%s' >%s</option>\n",
            selected( $date, $year . $month, false ),
            esc_attr( $year . $month ),
            /* translators: 1: month name, 2: 4-digit year */
            sprintf( __( '%1$s %2$d' ), $wp_locale->get_month( $month ), $year )
        );
    }
    ?>
    </select>
    <?php
}

/**
 * Display form for filtering product listing on seller dashboard
 *
 * @since 2.1
 * @access public
 *
 */
function dokan_product_listing_filter() {
    dokan_get_template_part( 'products/listing-filter' );
}

/**
 * Search by SKU or ID for seller dashboard product listings.
 *
 * @param string $where
 * @return string
 */
function dokan_product_search_by_sku( $where ) {
    global $pagenow, $wpdb, $wp;

    if ( !isset( $_GET['product_search_name'] ) || empty( $_GET['product_search_name'] ) || ! isset( $_GET['dokan_product_search_nonce'] ) || ! wp_verify_nonce( $_GET['dokan_product_search_nonce'], 'dokan_product_search' ) ) {
        return $where;
    }

    $search_ids = array();
    $terms      = explode( ',', $_GET['product_search_name'] );

    foreach ( $terms as $term ) {
        if ( is_numeric( $term ) ) {
            $search_ids[] = $term;
        }
        // Attempt to get a SKU
        $sku_to_id = $wpdb->get_col( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='_sku' AND meta_value LIKE '%%%s%%';", wc_clean( $term ) ) );

        if ( $sku_to_id && sizeof( $sku_to_id ) > 0 ) {
            $search_ids = array_merge( $search_ids, $sku_to_id );
        }
    }

    $search_ids = array_filter( array_map( 'absint', $search_ids ) );

    if ( sizeof( $search_ids ) > 0 ) {
        $where = str_replace( ')))', ") OR ({$wpdb->posts}.ID IN (" . implode( ',', $search_ids ) . "))))", $where );
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
    $fields = array(
        'fb' => array(
            'icon'  => 'facebook-square',
            'title' => __( 'Facebook', 'dokan-lite' ),
        ),
        'gplus' => array(
            'icon'  => 'google-plus-square',
            'title' => __( 'Google Plus', 'dokan-lite' ),
        ),
        'twitter' => array(
            'icon'  => 'twitter-square',
            'title' => __( 'Twitter', 'dokan-lite' ),
        ),
        'linkedin' => array(
            'icon'  => 'linkedin-square',
            'title' => __( 'LinkedIn', 'dokan-lite' ),
        ),
        'youtube' => array(
            'icon'  => 'youtube-square',
            'title' => __( 'Youtube', 'dokan-lite' ),
        ),
        'instagram' => array(
            'icon'  => 'instagram',
            'title' => __( 'Instagram', 'dokan-lite' ),
        ),
        'flickr' => array(
            'icon'  => 'flickr',
            'title' => __( 'Flickr', 'dokan-lite' ),
        ),
    );

    return apply_filters( 'dokan_profile_social_fields', $fields );
}

/**
 * Generate Address fields form for seller
 * @since 2.3
 *
 * @param boolean verified
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
    $seller_address_fields = apply_filters( 'dokan_seller_address_fields', array(

            'street_1' => array(
                'required' => $required ? 1 : 0,
            ),
            'street_2' => array(
                'required' => 0,
            ),
            'city'     => array(
                'required' => $required ? 1 : 0,
            ),
            'zip'      => array(
                'required' => $required ? 1 : 0,
            ),
            'country'  => array(
                'required' => 1,
            ),
            'state'    => array(
                'required' => 0,
            ),
        )
    );

    $profile_info = dokan_get_store_info( get_current_user_id() );

    dokan_get_template_part( 'settings/address-form', '', array(
        'disabled' => $disabled,
        'seller_address_fields' => $seller_address_fields,
        'profile_info' => $profile_info,
    ) );
}

/**
 * Generate Address string | array for given seller id or current user
 *
 * @since 2.3
 *
 * @param int seller_id, defaults to current_user_id
 * @param boolean get_array, if true returns array instead of string
 *
 * @return String|array Address | array Address
 */
function dokan_get_seller_address( $seller_id = '', $get_array = false ) {

    if ( $seller_id == '' ) {
        $seller_id = get_current_user_id();
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

        $country_name = isset( $countries[$country_code] ) ? $countries[$country_code] : '';
        $state_name   = isset( $states[$country_code][$state_code] ) ? $states[$country_code][$state_code] : $state_code;

    } else {
        return 'N/A';
    }

    if ( $get_array == true ) {
        $address = array(
            'street_1' => $street_1,
            'street_2' => $street_2,
            'city'     => $city,
            'zip'      => $zip,
            'country'  => $country_name,
            'state'    => isset( $states[$country_code][$state_code] ) ? $states[$country_code][$state_code] : $state_code,
        );

        return $address;
    }

    $country           = new WC_Countries();
    $formatted_address = $country->get_formatted_address( array(
        'address_1' => $street_1,
        'address_2' => $street_2,
        'city'      => $city,
        'postcode'  => $zip,
        'state'     => $state_code,
        'country'   => $country_code
    ) );

    return apply_filters( 'dokan_get_seller_address', $formatted_address, $profile_info );
}

/**
 * Dokan get seller short formatted address
 *
 * @since  2.5.7
 *
 * @param  integer $store_id
 *
 * @return string
 */
function dokan_get_seller_short_address( $store_id, $line_break = true ) {
    $store_address = dokan_get_seller_address( $store_id, true );

    $short_address = array();
    $formatted_address = '';

    if ( ! empty( $store_address['street_1'] ) && empty( $store_address['street_2'] ) ) {
        $short_address[] = $store_address['street_1'];
    } else if ( empty( $store_address['street_1'] ) && ! empty( $store_address['street_2'] ) ) {
        $short_address[] = $store_address['street_2'];
    } else if ( ! empty( $store_address['street_1'] ) && ! empty( $store_address['street_2'] ) ) {
        $short_address[] = $store_address['street_1'];
    }

    if ( ! empty( $store_address['city'] ) && ! empty( $store_address['city'] ) ) {
        $short_address[] = $store_address['city'];
    }

    if ( ! empty( $store_address['state'] ) && ! empty( $store_address['country'] ) ) {
        $short_address[] = $store_address['state'] . ', ' . $store_address['country'];
    } else if ( ! empty( $store_address['country'] ) ) {
        $short_address[] = $store_address['country'];
    }

    if ( ! empty( $short_address  ) && $line_break ) {
        $formatted_address = implode( '<br>', $short_address );
    } else {
        $formatted_address = implode( ', ', $short_address );
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
    $userstore = dokan_get_store_url( $store_id );
    return apply_filters( 'dokan_get_toc_url', $userstore ."toc" );
}

/**
 * Login Redirect
 *
 * @since 2.4
 *
 * @param  string $redirect_to [url]
 * @param  object $user
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

    if ( isset( $_GET['redirect_to'] ) && !empty( $_GET['redirect_to'] ) ) {
        $redirect_to = esc_url( $_GET['redirect_to'] );
    }

    return $redirect_to;
}

add_filter( 'woocommerce_login_redirect', 'dokan_after_login_redirect' , 1, 2 );

/**
 * Check if the post belongs to the given user
 *
 * @param int $post_id
 * @param int $user_id
 * @return boolean
 */
function dokan_is_valid_owner( $post_id, $user_id ) {

    $author = get_post_field( 'post_author', $post_id );

    if ( $user_id == $author )
        return true;

    return false;
}

add_action( 'wp', 'dokan_set_is_home_false_on_store' );

function dokan_set_is_home_false_on_store() {
    global $wp_query;
    if ( dokan_is_store_page() ) {
        $wp_query->is_home = false;
    }
}

register_sidebar( array( 'name' => __( 'Dokan Store Sidebar', 'dokan-lite' ), 'id' => 'sidebar-store' ) );