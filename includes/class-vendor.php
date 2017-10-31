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
            'store_name' => '',
            'social'     => array(),
            'payment'    => array( 'paypal' => array( 'email' ), 'bank' => array() ),
            'phone'      => '',
            'show_email' => 'off',
            'address'    => '',
            'location'   => '',
            'banner'     => 0
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
     * @return string
     */
    public function get_location() {
        return $this->get_info_part( 'location' );
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
     * If should show the email
     *
     * @return boolean
     */
    public function show_email() {
        return 'on' == $this->get_info_part( 'address' );
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
        return dokan_author_pageviews( $this->id );
    }
}
