<?php

/**
 * Dokan Vendor
 *
 * @since 2.6.10
 */
class Dokan_Vendor {

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
    }

    /**
     * Call undefined functions callback
     *
     * @param string $name
     * @param [type] $param [description]
     *
     * @return [type] [description]
     */
    public function __call( $name, $param ) {
        if ( strpos( $name, 'get_' ) === 0 ) {
            $function_name  = str_replace('get_', '', $name );
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

        $info = array(
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
            'gravatar'              => $this->get_avatar(),
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
        );

        return $info;
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
            'store_ppp'               => 10,
            'enable_tnc'              => 'off',
            'store_tnc'               => '',
            'show_min_order_discount' => 'no',
            'store_seo'               => array()
        );

        if ( ! $this->id ) {
            $this->shop_data = $defaults;
            return;
        }

        $shop_info = get_user_meta( $this->id, 'dokan_profile_settings', true );
        $shop_info = is_array( $shop_info ) ? $shop_info : array();
        $shop_info = wp_parse_args( $shop_info, $defaults );

        $this->shop_data = $shop_info;
    }

    /**
     * Get the store info by lazyloading
     *
     * @return array
     */
    public function get_shop_info() {

        // return if already populated
        if ( $this->shop_data ) {
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

        if ( array_key_exists( $item, $info ) ) {
            return $info[ $item ];
        }
    }

    /**
     * Get store ID
     *
     * @since 3.0.0
     *
     * @return void
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
            return $this->data->display_name;
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
            return $this->data->user_email;
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
            return $this->data->first_name;
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
            return $this->data->last_name;
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
            return $this->data->user_registered;
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
        $banner_id = (int) $this->get_info_part( 'banner' );

        if ( ! $banner_id ) {
            return false;
        }

        return wp_get_attachment_url( $banner_id );
    }

    /**
     * Get the shop profile icon
     *
     * @since 2.8
     *
     * @return string
     */
    public function get_avatar() {
        $avatar_id = (int) $this->get_info_part( 'gravatar' );

        if ( ! $avatar_id ) {
            return get_avatar_url( $this->data->user_email, 96 );
        }

        return wp_get_attachment_url( $avatar_id );
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
        return $this->get_info_part( 'store_toc' );
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
     * Get balance
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function get_balance( $formatted = true  ) {
        global $wpdb;

        $status        = dokan_withdraw_get_active_order_status_in_comma();
        $cache_group   = 'dokan_seller_data_'.$this->id;
        $cache_key     = 'dokan_seller_balance_' . $this->id;
        $earning       = wp_cache_get( $cache_key, $cache_group );
        $threshold_day = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', 0 );
        $date          = date( 'Y-m-d', strtotime( date('Y-m-d') . ' -'.$threshold_day.' days' ) );

        if ( false === $earning ) {
            $sql = "SELECT SUM(net_amount) as earnings,
                (SELECT SUM(amount) FROM {$wpdb->prefix}dokan_withdraw WHERE user_id = %d AND status = 1) as withdraw
                FROM {$wpdb->prefix}dokan_orders as do LEFT JOIN {$wpdb->prefix}posts as p ON do.order_id = p.ID
                WHERE seller_id = %d AND DATE(p.post_date) <= %s AND order_status IN({$status})";

            $result = $wpdb->get_row( $wpdb->prepare( $sql, $this->id, $this->id, $date ) );
            $earning = (float) $result->earnings - (float) round( $result->withdraw, wc_get_rounding_precision() );

            wp_cache_set( $cache_key, $earning, $cache_group );
            dokan_cache_update_group( $cache_key , $cache_group );
        }

        if ( $formatted ) {
            return apply_filters( 'dokan_get_formatted_seller_balance', wc_price( $earning ) );
        }

        return apply_filters( 'dokan_get_seller_balance', $earning );
    }

    /**
     * Get vendor rating
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function get_rating() {
        global $wpdb;

        $sql = "SELECT AVG(cm.meta_value) as average, COUNT(wc.comment_ID) as count FROM $wpdb->posts p
            INNER JOIN $wpdb->comments wc ON p.ID = wc.comment_post_ID
            LEFT JOIN $wpdb->commentmeta cm ON cm.comment_id = wc.comment_ID
            WHERE p.post_author = %d AND p.post_type = 'product' AND p.post_status = 'publish'
            AND ( cm.meta_key = 'rating' OR cm.meta_key IS NULL) AND wc.comment_approved = 1
            ORDER BY wc.comment_post_ID";

        $result = $wpdb->get_row( $wpdb->prepare( $sql, $this->id ) );

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
     * @return void
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
            $html = '<span class="seller-rating">
                        <span title=" '. esc_attr( $text ) . '" class="star-rating" itemtype="http://schema.org/Rating" itemscope="" itemprop="reviewRating">
                            <span class="width" style="width: ' . $width . '%"></span>
                            <span style=""><strong itemprop="ratingValue">' . $rating['rating'] . '</strong></span>
                        </span>
                    </span>
                    <span class="text">' . $review_text . '</span>';
        }

        if ( ! $display ) {
            return $html;
        }

        echo $html;
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
     * @return void
     */
    public function make_active() {
        update_user_meta( $this->get_id(), 'dokan_enable_selling', 'yes' );
        $this->change_product_status( 'publish' );

        do_action( 'dokan_vendor_enabled', $this->get_id() );

        return $this->to_array();
    }

    /**
     * Make vendor active
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function make_inactive() {
        update_user_meta( $this->get_id(), 'dokan_enable_selling', 'no' );
        $this->change_product_status( 'pending' );

        do_action( 'dokan_vendor_disabled', $this->get_id() );

        return $this->to_array();
    }

    /**
     * Delete vendor with reassign data
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function delete( $reassign = null ) {
        $user = $this->to_array();
        require_once ABSPATH . 'wp-admin/includes/user.php';;
        wp_delete_user( $this->get_id(), $reassign );
        return $user;
    }

    /**
     * Chnage product status when toggling seller active status
     *
     * @since 2.6.9
     *
     * @param int $seller_id
     * @param string $status
     *
     * @return void
     */
    function change_product_status( $status ) {
        $args = array(
            'post_type'      => 'product',
            'post_status'    => ( $status == 'pending' ) ? 'publish' : 'pending',
            'posts_per_page' => -1,
            'author'         => $this->get_id(),
            'orderby'        => 'post_date',
            'order'          => 'DESC'
        );

        $product_query = new WP_Query( $args );
        $products = $product_query->get_posts();

        if ( $products ) {
            foreach ( $products as $pro ) {
                if ( 'publish' != $status ) {
                    update_post_meta( $pro->ID, 'inactive_product_flag', 'yes' );
                }

                wp_update_post( array( 'ID' => $pro->ID, 'post_status' => $status ) );
            }
        }
    }

}
