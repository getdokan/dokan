<?php

namespace WeDevs\Dokan\Vendor;

use Automattic\WooCommerce\Utilities\NumberUtil;
use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Product\ProductCache;
use WP_Query;
use WP_User;

/**
 * Dokan Vendor
 *
 * @since 2.6.10
 */
class Vendor {

    /**
     * The vendor ID
     *
     * @var integer
     */
    public $id = 0;

    /**
     * Holds the user data object
     *
     * @var null|WP_User
     */
    public $data = null;

    /**
     * Holds the store info
     *
     * @var array
     */
    private $shop_data = array();

    /**
     * Holds the chanages data
     *
     * @var array
     */
    private $changes = array();

    /**
     * The constructor
     *
     * @param int|WP_User $vendor
     */
    public function __construct( $vendor = null ) {
        if ( is_numeric( $vendor ) ) {

            $the_user = get_user_by( 'id', $vendor );;

            if ( $the_user ) {
                $this->id   = $the_user->ID;
                $this->data = $the_user;
            }

        } elseif ( is_a( $vendor, 'WP_User' ) ) {
            $this->id   = $vendor->ID;
            $this->data = $vendor;
        }

        do_action( 'dokan_vendor', $this );
    }

    /**
     * Magic method to access vendor properties
     *
     * When you try to access a property by calling a method
     * with 'get_' prefixed, this magic method will look into
     * shop_data for that property.
     *
     * @param string $name
     * @param array  $param
     *
     * @return mixed|void
     */
    public function __call( $name, $param ) {
        if ( strpos( $name, 'get_' ) === 0 ) {
            $function_name  = str_replace('get_', '', $name );

            if ( empty( $this->shop_data ) ) {
                $this->popluate_store_data();
            }

            return ! empty( $this->shop_data[$function_name] ) ? $this->shop_data[$function_name] : null;
        }
    }

    /**
     * Vendor info to array
     *
     * @since 2.8
     *
     * @return array
     */
    public function to_array() {
        $data = array(
            'id'                    => $this->get_id(),
            'store_name'            => $this->get_shop_name(),
            'first_name'            => $this->get_first_name(),
            'last_name'             => $this->get_last_name(),
            'email'                 => $this->get_email(),
            'social'                => $this->get_social_profiles(),
            'phone'                 => $this->get_phone(),
            'show_email'            => $this->show_email(),
            'address'               => $this->get_address(),
            'location'              => $this->get_location(),
            'banner'                => $this->get_banner(),
            'banner_id'             => $this->get_banner_id(),
            'gravatar'              => $this->get_avatar(),
            'gravatar_id'           => $this->get_avatar_id(),
            'shop_url'              => $this->get_shop_url(),
            'products_per_page'     => $this->get_per_page(),
            'show_more_product_tab' => $this->show_more_products_tab(),
            'toc_enabled'           => $this->toc_enabled(),
            'store_toc'             => $this->get_toc(),
            'featured'              => $this->is_featured(),
            'rating'                => $this->get_rating(),
            'enabled'               => $this->is_enabled(),
            'registered'            => $this->get_register_date(),
            'payment'               => $this->get_payment_profiles(),
            'trusted'               => $this->is_trusted(),
            'store_open_close'      => [
                'enabled'      => $this->is_store_time_enabled(),
                'time'         => $this->get_store_time(),
                'open_notice'  => $this->get_store_open_notice(),
                'close_notice' => $this->get_store_close_notice(),
            ],
        );

        return apply_filters( 'dokan_vendor_to_array', $data, $this );
    }

    /**
     * Check if key is exist
     *
     * @param $key
     *
     * @return string
     */
    public function get_value( $key ) {
        return ! empty( $key ) ? $key : '';
    }

    /**
     * Check if the user is vendor
     *
     * @return boolean
     */
    public function is_vendor() {
        return dokan_is_user_seller( $this->id );
    }

    /**
     * If the selling capacity is enabled
     *
     * @return boolean
     */
    public function is_enabled() {
        return dokan_is_seller_enabled( $this->id );
    }

    /**
     * If the vendor is marked as trusted
     *
     * @return boolean
     */
    public function is_trusted() {
        return dokan_is_seller_trusted( $this->id );
    }

    /**
     * If the vendor is marked as featured
     *
     * @return boolean
     */
    public function is_featured() {
        return 'yes' == get_user_meta( $this->id, 'dokan_feature_seller', true );
    }

    /**
     * Populate store info
     *
     * @return void
     */
    public function popluate_store_data() {
        $defaults = array(
            'store_name'              => '',
            'social'                  => array(),
            'payment'                 => array( 'paypal' => array( 'email' ), 'bank' => array() ),
            'phone'                   => '',
            'show_email'              => 'no',
            'address'                 => array(),
            'location'                => '',
            'banner'                  => 0,
            'icon'                    => 0,
            'gravatar'                => 0,
            'show_more_ptab'          => 'yes',
            'store_ppp'               => (int) dokan_get_option( 'store_products_per_page', 'dokan_general', 12 ),
            'enable_tnc'              => 'off',
            'store_tnc'               => '',
            'show_min_order_discount' => 'no',
            'store_seo'               => array(),
            'dokan_store_time_enabled' => 'no',
            'dokan_store_open_notice'  => '',
            'dokan_store_close_notice' => ''
        );

        if ( ! $this->id ) {
            $this->shop_data = $defaults;
            return;
        }

        $shop_info = get_user_meta( $this->id, 'dokan_profile_settings', true );
        $shop_info = is_array( $shop_info ) ? $shop_info : array();
        $shop_info = wp_parse_args( $shop_info, $defaults );

        $this->shop_data = apply_filters( 'dokan_vendor_shop_data', $shop_info, $this );
    }

    /*
    |--------------------------------------------------------------------------
    | Getters
    |--------------------------------------------------------------------------
    */

    /**
     * Get the store info by lazyloading
     *
     * @return array
     */
    public function get_shop_info() {

        // return if already populated
        if ( ! empty( $this->shop_data ) ) {
            return $this->shop_data;
        }

        $this->popluate_store_data();

        return $this->shop_data;
    }

    /**
     * Get store info by key
     *
     * @param  string $item
     *
     * @return mixed
     */
    public function get_info_part( $item ) {
        $info = $this->get_shop_info();

        if ( is_array( $info ) && array_key_exists( $item, $info ) ) {
            return $info[ $item ];
        }
    }

    /**
     * Get store ID
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_id() {
        return $this->id;
    }

    /**
     * Get the vendor name
     *
     * @return string
     */
    public function get_name() {
        if ( $this->id ) {
            return $this->get_value( $this->data->display_name );
        }
    }

    /**
     * Get the shop name
     *
     * @return string
     */
    public function get_shop_name() {
        return $this->get_info_part( 'store_name' );
    }

    /**
     * Get the shop URL
     *
     * @return string
     */
    public function get_shop_url() {
        return dokan_get_store_url( $this->id );
    }

    /**
     * Get email address
     *
     * @return string
     */
    public function get_email() {
        if ( $this->id ) {
            return $this->get_value( $this->data->user_email );
        }
    }

    /**
     * Get first name
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_first_name() {
        if ( $this->id ) {
            return $this->get_value( $this->data->first_name );
        }
    }

    /**
     * Get last name
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_last_name() {
        if ( $this->id ) {
            return $this->get_value( $this->data->last_name );
        }
    }

    /**
     * Get last name
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_register_date() {
        if ( $this->id ) {
            return $this->get_value( $this->data->user_registered );
        }
    }

    /**
     * Get the shop name
     *
     * @return array
     */
    public function get_social_profiles() {
        return $this->get_info_part( 'social' );
    }

    /**
     * Get the shop payment profiles
     *
     * @return array
     */
    public function get_payment_profiles() {
        return $this->get_info_part( 'payment' );
    }

    /**
     * Get the phone name
     *
     * @return string
     */
    public function get_phone() {
        return $this->get_info_part( 'phone' );
    }

    /**
     * Get the shop address
     *
     * @return array
     */
    public function get_address() {
        return $this->get_info_part( 'address' );
    }

    /**
     * Get the shop location
     *
     * @return array
     */
    public function get_location() {
        $default  = array( 'lat' => 0, 'long' => 0 );
        $location = $this->get_info_part( 'location' );

        if ( $location ) {
            list( $default['lat'], $default['long'] ) = explode( ',', $location );
        }

        return $location;
    }

    /**
     * Get the shop banner
     *
     * @return string
     */
    public function get_banner() {
        $banner_id = $this->get_banner_id();

        return $banner_id ? wp_get_attachment_url( $banner_id ) : '';
    }

    /**
     * Get the shop banner id
     *
     * @since 2.9.13
     *
     * @return int
     */
    public function get_banner_id() {
        $banner_id = (int) $this->get_info_part( 'banner' );

        return $banner_id ? $banner_id : 0;
    }

    /**
     * Get the shop profile icon
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_avatar() {
        $avatar_id = $this->get_avatar_id();

        if ( ! $avatar_id && ! empty( $this->data->user_email ) ) {
            return get_avatar_url( $this->data->user_email, 96 );
        }

        return wp_get_attachment_url( $avatar_id );
    }

    /**
     * Get shop gravatar id
     *
     * @since 2.9.13
     *
     * @return int
     */
    public function get_avatar_id() {
        $avatar_id = (int) $this->get_info_part( 'gravatar' );

        return $avatar_id ? $avatar_id : 0;
    }

    /**
     * Get per page pagination
     *
     * @since 2.8
     *
     * @return integer
     */
    public function get_per_page() {
        $per_page = (int) $this->get_info_part( 'store_ppp' );

        if ( ! $per_page ) {
            return 10;
        }

        return $per_page;
    }

    /**
     * If should show the email
     *
     * @return boolean
     */
    public function show_email() {
        return 'yes' == $this->get_info_part( 'show_email' );
    }

    /**
     * Check if terms and conditions enabled
     *
     * @since 2.8
     *
     * @return boolean
     */
    public function toc_enabled() {
        return 'on' == $this->get_info_part( 'enable_tnc' );
    }

    /**
     * Get terms and conditions
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_toc() {
        return $this->get_info_part( 'store_tnc' );
    }

    /**
     * Check if showing more product is enabled
     *
     * @since 2.8
     *
     * @return boolean
     */
    public function show_more_products_tab() {
        return 'yes' == $this->get_info_part( 'show_more_ptab' );
    }

    /**
     * Get a vendor products
     *
     * @return object
     */
    public function get_products() {
        $products = dokan()->product->all( [
            'author' => $this->id
        ] );

        if ( ! $products ) {
            return null;
        }

        return $products;
    }

    /**
     * Get a vendor all published products
     *
     * @since 3.2.11
     *
     * @return array
     */
    public function get_published_products() {
        $transient_group = "seller_product_data_{$this->get_id()}";
        $transient_key   = "get_published_products_{$this->get_id()}";

        if ( false === ( $products = Cache::get_transient( $transient_key, $transient_group ) ) ) {
            $products = dokan()->product->all( [
                'author'      => $this->id,
                'post_status' => 'publish',
                'fields'      => 'ids'
            ] );
            $products = $products->posts;
            Cache::set_transient( $transient_key, $products, $transient_group );
        }

        return $products;
    }

    /**
     * Get a vendor all published products
     *
     * @since 3.2.11
     *
     * @return array
     */
    public function get_best_selling_products() {
        $transient_group = "seller_product_data_{$this->get_id()}";
        $transient_key   = "get_best_selling_products_{$this->get_id()}";

        if ( false === ( $products = Cache::get_transient( $transient_key, $transient_group ) ) ) {
            $args = [
                'author'         => $this->id,
                'post_status'    => 'publish',
                'fields'         => 'ids',
                'posts_per_page' => -1,
            ];

            $args['meta_query'] = [ //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                [
                    'key'     => '_stock_status',
                    'value'   => 'outofstock',
                    'compare' => '!=',
                ],
            ];

            $products = dokan()->product->best_selling( $args );
            $products = $products->posts;
            Cache::set_transient( $transient_key, $products, $transient_group );
        }

        return $products;
    }

    /**
     * Get a vendor store published products categories
     *
     * @param bool $best_selling
     *
     * @since 3.2.11
     *
     * @return array
     */
    public function get_store_categories( $best_selling = false ) {
        $transient_group = "seller_product_data_{$this->get_id()}";
        $transient_key = function_exists( 'wpml_get_current_language' ) ? 'get_store_categories_' . wpml_get_current_language() . '_' . $this->get_id()  : 'get_store_categories_' . $this->get_id();
        if ( $best_selling ) {
            $transient_key = function_exists( 'wpml_get_current_language' ) ? 'get_best_selling_categories_' . wpml_get_current_language() . '_' . $this->get_id() : 'get_best_selling_categories_' . $this->get_id();
        }

        if ( false === ( $all_categories = Cache::get_transient( $transient_key, $transient_group ) ) ) {
            $products = true === $best_selling ? $this->get_best_selling_products() : $this->get_published_products();
            if ( empty( $products ) ) {
                return [];
            }

            $all_categories = [];
            $category_index = [];
            foreach ( $products as $product_id ) {
                $terms = get_the_terms( $product_id, 'product_cat' );

                //allow when there is terms and do not have any wp_errors
                if ( $terms && ! is_wp_error( $terms ) ) {
                    foreach ( $terms as $term ) {
                        if ( ! in_array( $term->term_id, $category_index, true ) ) {
                            // get extra information
                            $display_type            = get_term_meta( $term->term_id, 'display_type', true );
                            $thumbnail_id            = absint( get_term_meta( $term->term_id, 'thumbnail_id', true ) );
                            $category_commision_type = get_term_meta( $term->term_id, 'per_category_admin_commission_type', true );
                            $category_commision      = get_term_meta( $term->term_id, 'per_category_admin_commission', true );
                            $category_icon           = get_term_meta( $term->term_id, 'dokan_cat_icon', true );
                            $category_icon_color     = get_term_meta( $term->term_id, 'dokan_cat_icon_color', true );


                            // get category image url
                            if ( $thumbnail_id ) {
                                $thumbnail = wp_get_attachment_thumb_url( $thumbnail_id );
                                // get the image URL
                                $image = wp_get_attachment_url( $thumbnail_id );
                            } else {
                                $image = $thumbnail = wc_placeholder_img_src();
                            }

                            // fix commission
                            $category_commision = ! empty( $category_commision ) ? wc_format_decimal( $category_commision ) : 0.00;

                            // set extra fields to term object
                            $term->thumbnail = $thumbnail;
                            $term->image     = $image;
                            // set icon and icon color
                            $term->icon         = $category_icon;
                            $term->icon_color   = $category_icon_color;
                            $term->display_type = $display_type;
                            // set commissions
                            $term->admin_commission_type = $category_commision_type;
                            $term->admin_commission      = $category_commision;

                            // finally store category data
                            $all_categories[] = $term;
                            $category_index[] = $term->term_id;
                        }
                    }
                }
            }

            Cache::set_transient( $transient_key, $all_categories, $transient_group );
        }

        return $all_categories;
    }

    /**
     * Get vendor used terms list.
     *
     * @since 3.5.0
     *
     * @param $vendor_id
     * @param $taxonomy
     *
     * @return array|mixed
     */
    public function get_vendor_used_terms_list( $vendor_id, $taxonomy ){
        $transient_group = "seller_taxonomy_widget_data_{$this->get_id()}";
        $transient_key = function_exists( 'wpml_get_current_language' ) ? 'product_taxonomy_'. $taxonomy .'_' . wpml_get_current_language() : 'product_taxonomy_'. $taxonomy;

        // get the author's posts
        $products = $this->get_published_products();
        if ( empty( $products ) ) {
            return [];
        }

        $author_terms = Cache::get_transient( $transient_key, $transient_group );

        if ( false !== $author_terms ) {
            return $author_terms;
        }

        $author_terms = [];
        //loop over the posts and collect the terms
        $category_index = [];
        foreach ( $products as $product ) {
            $terms = get_the_terms( $product, $taxonomy );
            if ( ! $terms || is_wp_error( $terms ) ) {
                continue;
            }

            foreach ( $terms as $term ) {
                $args = [
                    'nopaging' => true,
                    'post_type' => 'product',
                    'author' => $vendor_id,
                    'tax_query' => [
                        [
                            'taxonomy' => $taxonomy,
                            'field' => 'slug',
                            'terms' => $term
                        ],
                    ],
                    'fields' => 'ids'
                ];

                $all_posts = get_posts( $args );

                if ( ! in_array( $term->term_id, $category_index, true ) ) {
                    $term->count  = count( $all_posts );
                    $category_index[] = $term->term_id;
                    $author_terms[]   = $term;
                }
            }
        }

//        Cache::set_transient( $transient_key, $author_terms, $transient_group );

        return $author_terms;
    }

    /**
     * Get vendor orders
     *
     * @since 3.0.0
     *
     * @return wc_get_order objects
     */
    public function get_orders( $args = [] ) {
        return dokan()->order->all( $args );
    }

    /**
     * Get the total sales amount of this vendor
     *
     * @return float
     */
    public function get_total_sales() {
        return dokan_author_total_sales( $this->id );
    }

    /**
     * Get total pageview for all the products
     *
     * @return integer
     */
    public function get_product_views() {
        return (int) dokan_author_pageviews( $this->id );
    }

    /**
     * Get vendor total earnings
     *
     * @return float|string float if formatted is false, string otherwise
     */
    public function get_earnings( $formatted = true, $on_date = '' ) {
        global $wpdb;

        $on_date     = $on_date && strtotime( $on_date ) ? dokan_current_datetime()->modify( $on_date ) : dokan_current_datetime();
        $cache_group = "seller_order_data_{$this->get_id()}";
        $cache_key   = "seller_earnings_{$this->get_id()}_{$on_date->format('Y_m_d')}";
        $earning     = Cache::get( $cache_key, $cache_group );
        $on_date     = $on_date->format( 'Y-m-d H:i:s' );

        if ( false === $earning ) {
            $installed_version = get_option( 'dokan_theme_version' );
            $status            = dokan_withdraw_get_active_order_status_in_comma();

            if ( ! $installed_version || version_compare( $installed_version, '2.8.2', '>' ) ) {
                $debit_balance  = $wpdb->get_var( $wpdb->prepare(
                    "SELECT SUM(debit) AS earnings
                    FROM {$wpdb->prefix}dokan_vendor_balance
                    WHERE
                        vendor_id = %d AND DATE(balance_date) <= %s AND status IN ($status) AND trn_type = 'dokan_orders'",
                    $this->id, $on_date ) );

               $credit_balance = $wpdb->get_var( $wpdb->prepare(
                    "SELECT SUM(credit) AS earnings
                    FROM {$wpdb->prefix}dokan_vendor_balance
                    WHERE
                        vendor_id = %d AND DATE(balance_date) <= %s AND trn_type = %s AND status = %s",
                    $this->id, $on_date, 'dokan_refund', 'approved' ) );

                $earning = floatval( $debit_balance - $credit_balance );
            } else {
                $earning = (float) $wpdb->get_var( $wpdb->prepare(
                    "SELECT
                        SUM(net_amount) as earnings
                    FROM
                        {$wpdb->prefix}dokan_orders as do LEFT JOIN {$wpdb->prefix}posts as p ON do.order_id = p.ID
                    WHERE
                        seller_id = %d AND DATE(p.post_date) <= %s AND order_status IN ($status)",
                    $this->id, $on_date ) );
            }

            Cache::set( $cache_key, $earning, $cache_group );
        }

        if ( $formatted ) {
            return apply_filters( 'dokan_get_formatted_seller_earnings', wc_price( $earning ), $this->id );
        }

        return apply_filters( 'dokan_get_seller_earnings', $earning, $this->id );
    }

    /**
     * Get balance
     *
     * @since 3.0.0
     *
     * @param bool $formatted
     * @param string $on_date
     *
     * @return float|string float if formatted is false, string otherwise
     */
    public function get_balance( $formatted = true, $on_date = '' ) {
        global $wpdb;

        $seller_id     = $this->get_id() ? $this->get_id() : dokan_get_current_user_id();
        $threshold_day = dokan_get_withdraw_threshold( $seller_id );
        $on_date       = $on_date && strtotime( $on_date ) ? dokan_current_datetime()->modify( $on_date ) : dokan_current_datetime();
        $date          = $on_date->modify( "- $threshold_day days" )->format( 'Y-m-d' );
        $cache_group   = "withdraws_seller_{$seller_id}";
        $cache_key     = "seller_balance_{$seller_id}_{$on_date->format( 'Y_m_d' )}";
        $earning       = Cache::get( $cache_key, $cache_group );
        $on_date       = $on_date->format( 'Y-m-d H:i:s' );


        if ( false === $earning ) {
            $installed_version = get_option( 'dokan_theme_version' );
            $status            = dokan_withdraw_get_active_order_status_in_comma();

            if ( ! $installed_version || version_compare( $installed_version, '2.8.2', '>' ) ) {
                $result = $wpdb->get_row( $wpdb->prepare(
                        "SELECT SUM(debit) as earnings,
                        ( SELECT SUM(credit) FROM {$wpdb->prefix}dokan_vendor_balance WHERE vendor_id = %d AND DATE(balance_date) <= %s ) as withdraw
                        from {$wpdb->prefix}dokan_vendor_balance
                        WHERE vendor_id = %d AND DATE(balance_date) <= %s AND status IN($status)",
                    $seller_id, $on_date, $seller_id, $on_date ) );
            } else {
                $result = $wpdb->get_row( $wpdb->prepare(
                    "SELECT SUM(net_amount) as earnings,
                    (SELECT SUM(amount) FROM {$wpdb->prefix}dokan_withdraw WHERE user_id = %d AND status = 1 AND DATE(`date`) <= %s) as withdraw
                    FROM {$wpdb->prefix}dokan_orders as do LEFT JOIN {$wpdb->prefix}posts as p ON do.order_id = p.ID
                    WHERE seller_id = %d AND DATE(p.post_date) <= %s AND order_status IN ($status)",
                    $seller_id, $on_date, $seller_id, $date ) );
            }

            $earning = (float) $result->earnings - (float) NumberUtil::round( $result->withdraw, wc_get_rounding_precision() );

            Cache::set( $cache_key, $earning, $cache_group );
        }

        if ( $formatted ) {
            $decimal = ( 0 === wc_get_price_decimals() ) ? 2 : wc_get_price_decimals();
            return apply_filters(
                'dokan_get_formatted_seller_balance',
                wc_price( $earning, [ 'decimals' => $decimal ]
            ), $this->id );
        }

        return apply_filters( 'dokan_get_seller_balance', $earning, $this->id );
    }

    /**
     * Get vendor rating
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_rating() {
        global $wpdb;

        $result = $wpdb->get_row( $wpdb->prepare(
            "SELECT AVG(cm.meta_value) as average, COUNT(wc.comment_ID) as count FROM $wpdb->posts p
            INNER JOIN $wpdb->comments wc ON p.ID = wc.comment_post_ID
            LEFT JOIN $wpdb->commentmeta cm ON cm.comment_id = wc.comment_ID
            WHERE p.post_author = %d AND p.post_type = 'product' AND p.post_status = 'publish'
            AND ( cm.meta_key = 'rating' OR cm.meta_key IS NULL) AND wc.comment_approved = 1
            ORDER BY wc.comment_post_ID", $this->id ) );

        $rating_value = apply_filters( 'dokan_seller_rating_value', array(
            'rating' => number_format( $result->average, 2 ),
            'count'  => (int) $result->count
        ), $this->id );

        return $rating_value;
    }

    /**
     * Get vendor readable rating
     *
     * @since 3.0.0
     *
     * @return void|string
     */
    public function get_readable_rating( $display = true ) {
        $rating = $this->get_rating( $this->id );

        if ( ! $rating['count'] ) {
            $html = __( 'No ratings found yet!', 'dokan-lite' );
        } else {
            $long_text   = _n( '%s rating from %d review', '%s rating from %d reviews', $rating['count'], 'dokan-lite' );
            $text        = sprintf( __( 'Rated %s out of %d', 'dokan-lite' ), $rating['rating'], number_format( 5 ) );
            $width       = ( $rating['rating']/5 ) * 100;
            $review_text = sprintf( $long_text, $rating['rating'], $rating['count'] );

            if ( function_exists( 'dokan_get_review_url' ) ) {
                $review_text = sprintf( '<a href="%s">%s</a>', esc_url( dokan_get_review_url( $this->id ) ), $review_text );
            }
            $stars = wc_get_rating_html( $rating['rating'], $rating['count'] );
            $html = '<span class="text">' . $review_text . '</span>' . '<span class="seller-rating">' . $stars . '</span>';
        }

        if ( ! $display ) {
            return $html;
        }

        echo esc_html( $html );
    }

    /**
     * Get vendor percentage
     *
     * @param  integer $product_id
     *
     * @return integer
     */
    public function get_percentage( $product_id = 0 ) {
        return dokan_get_seller_percentage( $this->id, $product_id );
    }

    /**
     * Make vendor active
     *
     * @since 2.8.0
     *
     * @return array
     */
    public function make_active() {
        $this->update_meta( 'dokan_enable_selling', 'yes' );

        // change product status to publish
        $this->change_product_status( 'revert' );

        do_action( 'dokan_vendor_enabled', $this->get_id() );

        return $this->to_array();
    }

    /**
     * Make vendor active
     *
     * @since 2.8.0
     *
     * @return array
     */
    public function make_inactive() {
        $this->update_meta( 'dokan_enable_selling', 'no' );

        // change product status to pending
        $this->change_product_status( 'change_status' );

        do_action( 'dokan_vendor_disabled', $this->get_id() );

        return $this->to_array();
    }

    /**
     * Change product status when toggling seller active status
     *
     * @since 2.6.9
     * @since 3.7.18 introduced new bg process to change product status
     *
     * @param string $task_type
     *
     * @return void
     */
    public function change_product_status( $task_type ) {
        $product_status_changer = dokan()->bg_process->change_vendor_product_status;
        $product_status_changer->reset();
        $product_status_changer->set_vendor_id( $this->get_id() );
        $product_status_changer->add_to_queue( $task_type );
    }

    /**
     * Get store opening closing time
     *
     * @return array
     */
    public function get_store_time() {
        $time = $this->get_info_part( 'dokan_store_time' );

        return $time ? $time : [];
    }

    /**
     * Get store opening closing time
     *
     * @return boolean|null on failure
     */
    public function is_store_time_enabled() {
        return 'yes' === $this->get_info_part( 'dokan_store_time_enabled' );
    }

    /**
     * Get store open notice
     *
     * @param string $default_notice
     *
     * @return string
     */
    public function get_store_open_notice( $default_notice = '' ) {
        $notice         = $this->get_info_part( 'dokan_store_open_notice' );
        $default_notice = $default_notice ? $default_notice : __( 'Store is open', 'dokan-lite' );

        return $notice ? $notice : $default_notice;
    }

    /**
     * Get store close notice
     *
     * @param string $default_notice
     *
     * @return string
     */
    public function get_store_close_notice( $default_notice = '' ) {
        $notice         = $this->get_info_part( 'dokan_store_close_notice' );
        $default_notice = $default_notice ? $default_notice : __( 'Store is closed', 'dokan-lite' );

        return $notice ? $notice : $default_notice;
    }

    /*
    |--------------------------------------------------------------------------
    | Setters
    |--------------------------------------------------------------------------
    */

    /**
     * Set enable tnc
     *
     * @param int value
     */
    public function set_enable_tnc( $value ) {
        $this->set_prop( 'enable_tnc', wc_clean( $value ) );
    }

    /**
     * Set store tnc
     *
     * @since 3.0.0
     *
     * @param string
     *
     * @return void
     */
    public function set_store_tnc( $value ) {
        $this->set_prop( 'store_tnc', wc_clean( $value ) );
    }

    /**
     * Set gravatar
     *
     * @param int value
     */
    public function set_gravatar_id( $value ) {
        $this->set_prop( 'gravatar', (int) $value );
    }

    /**
     * Set banner
     *
     * @param int value
     */
    public function set_banner_id( $value ) {
        $this->set_prop( 'banner', (int) $value );
    }

    /**
     * Set banner
     *
     * @param int value
     */
    public function set_icon( $value ) {
        $this->set_prop( 'icon', (int) $value );
    }

    /**
     * Set store name
     *
     * @param string
     */
    public function set_store_name( $value ) {
        $this->set_prop( 'store_name', wc_clean( $value ) );
    }

    /**
     * Set phone
     *
     * @param string
     */
    public function set_phone( $value ) {
        $this->set_prop( 'phone', wc_clean( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_show_email( $value ) {
        $this->set_prop( 'show_email', wc_clean( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_fb( $value ) {
        $this->set_social_prop( 'fb', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_gplus( $value ) {
        $this->set_social_prop( 'gplus', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_twitter( $value ) {
        $this->set_social_prop( 'twitter', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_pinterest( $value ) {
        $this->set_social_prop( 'pinterest', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_linkedin( $value ) {
        $this->set_social_prop( 'linkedin', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_youtube( $value ) {
        $this->set_social_prop( 'youtube', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set show email
     *
     * @param string
     */
    public function set_instagram( $value ) {
        $this->set_social_prop( 'instagram', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set flickr
     *
     * @param string
     */
    public function set_flickr( $value ) {
        $this->set_social_prop( 'flickr', 'social', esc_url_raw( $value ) );
    }

    /**
     * Set paypal email
     *
     * @param string $value
     */
    public function set_paypal_email( $value ) {
        $this->set_payment_prop( 'email', 'paypal', sanitize_email( $value ) );
    }

    /**
     * Set bank ac name
     *
     * @param string $value
     */
    public function set_bank_ac_name( $value ) {
        $this->set_payment_prop( 'ac_name', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank ac type
     *
     * @param string $value
     */
    public function set_bank_ac_type( $value ) {
        $this->set_payment_prop( 'ac_type', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank ac number
     *
     * @param string $value
     */
    public function set_bank_ac_number( $value ) {
        $this->set_payment_prop( 'ac_number', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank name
     *
     * @param string $value
     */
    public function set_bank_bank_name( $value ) {
        $this->set_payment_prop( 'bank_name', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank address
     *
     * @param string value
     */
    public function set_bank_bank_addr( $value ) {
        $this->set_payment_prop( 'bank_addr', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank routing number
     *
     * @param string value
     */
    public function set_bank_routing_number( $value ) {
        $this->set_payment_prop( 'routing_number', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank iban
     *
     * @param string $value
     */
    public function set_bank_iban( $value ) {
        $this->set_payment_prop( 'iban', 'bank', wc_clean( $value ) );
    }

    /**
     * Set bank swtif number
     *
     * @param string $value
     */
    public function set_bank_swift( $value ) {
        $this->set_payment_prop( 'swift', 'bank', wc_clean( $value ) );
    }

    /**
     * Set street 1
     *
     * @param string $value
     */
    public function set_street_1( $value ) {
        $this->set_address_prop( 'street_1', 'address', wc_clean( $value ) );
    }

    /**
     * Set street 2
     *
     * @param string $value
     */
    public function set_street_2( $value ) {
        $this->set_address_prop( 'street_2', 'address', wc_clean( $value ) );
    }

    /**
     * Set city
     *
     * @param string $value
     */
    public function set_city( $value ) {
        $this->set_address_prop( 'city', 'address', wc_clean( $value ) );
    }

    /**
     * Set zip
     *
     * @param string $value
     */
    public function set_zip( $value ) {
        $this->set_address_prop( 'zip', 'address', wc_clean( $value ) );
    }

    /**
     * Set state
     *
     * @param string $value
     */
    public function set_state( $value ) {
        $this->set_address_prop( 'state', 'address', wc_clean( $value ) );
    }

    /**
     * Set country
     *
     * @param string $value
     */
    public function set_country( $value ) {
        $this->set_address_prop( 'country', 'address', wc_clean( $value ) );
    }

    /**
     * Sets a prop for a setter method.
     *
     * This stores changes in a special array so we can track what needs saving
     * the the DB later.
     *
     * @since 2.9.11
     *
     * @param string $prop Name of prop to set.
     * @param mixed  $value Value of the prop.
     */
    protected function set_prop( $prop, $value ) {
        if ( ! $this->shop_data ) {
            $this->popluate_store_data();
        }

        if ( array_key_exists( $prop, $this->shop_data ) ) {
            if ( $value !== $this->shop_data[ $prop ] || array_key_exists( $prop, $this->changes ) ) {
                $this->changes[ $prop ] = $value;
            }
        }
    }

    /**
     * Get vendor meta data
     *
     * @since 2.9.23
     *
     * @param string $key
     * @param bool $single  Whether to return a single value
     *
     * @return Mix
     */
    public function get_meta( $key, $single = false ) {
        return get_user_meta( $this->get_id(), $key, $single );
    }

    /**
     * Update vendor meta data
     *
     * @since 2.9.11
     *
     * @param string $key
     * @param mix $value
     *
     * @return void
     */
    public function update_meta( $key, $value ) {
        update_user_meta( $this->get_id(), $key, $value );
    }

    /**
     * Update meta data
     *
     * @since  2.9.23
     *
     * @return void
     */
    public function update_meta_data() {
        if ( ! $this->changes ) {
            return;
        }

        if ( ! empty( $this->changes['store_name'] ) ) {
            $this->update_meta( 'dokan_store_name', $this->changes['store_name'] );
        }
    }

    /**
     * Sets a prop for a setter method.
     *
     * @since 2.9.11
     *
     * @param string $prop    Name of prop to set.
     * @param string $social Name of social settings to set, fb, twitter
     * @param string $value
     */
    protected function set_social_prop( $prop, $social = 'social', $value = '' ) {
        if ( ! $this->shop_data ) {
            $this->popluate_store_data();
        }

        if ( ! isset( $this->shop_data[ $social ][ $prop ] ) ) {
            $this->shop_data[ $social ][ $prop ] = null;
        }

        if ( $value !== $this->shop_data[ $social ][ $prop ] || ( isset( $this->changes[ $social ] ) && array_key_exists( $prop, $this->changes[ $social ] ) ) ) {
            $this->changes[ $social ][ $prop ] = $value;
        }
    }

    /**
     * Set address props
     *
     * @param string $prop
     * @param string $address
     * @param string value
     */
    protected function set_address_prop( $prop, $address = 'address', $value = '' ) {
        $this->set_social_prop( $prop, $address, $value );
    }

    /**
     * Set payment props
     *
     * @param string $prop
     * @param string $paypal
     * @param mix value
     */
    protected function set_payment_prop( $prop, $paypal = 'paypal', $value = '' ) {
        if ( ! $this->shop_data ) {
            $this->popluate_store_data();
        }

        if ( ! isset( $this->shop_data[ 'payment' ][ $paypal ][ $prop ] ) ) {
            $this->shop_data[ 'payment' ][ $paypal ][ $prop ] = null;
        }

        if ( $value !== $this->shop_data[ 'payment' ][ $paypal ][ $prop ] || ( isset( $this->changes[ 'payment' ] ) && array_key_exists( $prop, $this->changes[ 'payment' ] ) ) ) {
            $this->changes[ 'payment' ][ $paypal ][ $prop ] = $value;
        }
    }

    /**
     * Set store open close props
     *
     * @param string $prop
     * @param array $value
     *
     * @since 2.9.13
     *
     * @return void
     */
    protected function set_store_open_close_prop( $prop, $value ) {
        if ( ! $this->shop_data ) {
            $this->popluate_store_data();
        }

        if ( ! isset( $this->shop_data[ 'dokan_store_time' ][ $prop ] ) ) {
            $this->shop_data[ 'dokan_store_time' ][ $prop ] = null;
        }

        if ( $value !== $this->shop_data[ 'dokan_store_time' ][ $prop ] || ( isset( $this->changes[ 'dokan_store_time' ] ) && array_key_exists( $prop, $this->changes[ 'dokan_store_time' ] ) ) ) {
            $this->changes[ 'dokan_store_time' ][ $prop ] = $value;
        }
    }

    /**
     * Set store times
     *
     * @param array $data
     *
     * @since 2.9.13
     *
     * @return void
     */
    public function set_store_times( array $data ) {
        foreach ( $data as $prop => $value ) {
            $this->set_store_open_close_prop( $prop, $value );
        }
    }

    /**
     * Set store times enable
     *
     * @param boolean $value
     *
     * @since 2.9.13
     *
     * @return void
     */
    public function set_store_times_enable( $value ) {
        $this->set_prop( 'dokan_store_time_enabled', wc_clean( $value ) );
    }

    /**
     * Set store times open notice
     *
     * @param string $value
     *
     * @since 2.9.13
     *
     * @return void
     */
    public function set_store_times_open_notice( $value ) {
        $this->set_prop( 'dokan_store_open_notice', wc_clean( $value ) );
    }

    /**
     * Set store times close notice
     *
     * @param string $value
     *
     * @since 2.9.13
     *
     * @return void
     */
    public function set_store_times_close_notice( $value ) {
        $this->set_prop( 'dokan_store_close_notice', wc_clean( $value ) );
    }

    /**
     * Merge changes with data and clear.
     *
     * @since 2.9.11
     */
    public function apply_changes() {
        $this->update_meta( 'dokan_profile_settings', array_replace_recursive( $this->shop_data, $this->changes ) );
        $this->update_meta_data();

        $this->changes = [];
    }

    /**
     * Save the object
     *
     * @since 2.9.11
     */
    public function save() {
        $this->apply_changes();
    }
}
