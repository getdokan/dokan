<?php

if ( ! class_exists( 'WeDevs_Promotion' ) ) {
    require_once DOKAN_LIB_DIR . '/promotions.php';
}

/**
* Promotion class
*
* For displaying AI base add on admin panel
*/
class Dokan_Promotion extends WeDevs_Promotion {

    /**
     * Time interval for displaying promo
     *
     * @var integer
     */
    public $time_interval = 60*60*24*7;

    /**
     * Promo option key
     *
     * @var string
     */
    public $promo_option_key = '_dokan_free_upgrade_promo';

    /**
     * Get prmotion data
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_promotion_data() {
        if ( ! dokan()->is_pro_exists() ) {
            return array(
                'product_subscription' => array(
                    'title'     => __( 'Create Customizable Paid Subscription Packs For Your Vendors', 'dokan-lite' ),
                    'content'   => __( 'By using this module, make it mandatory for your vendors to buy a subscription pack to sell products in your marketplace.', 'dokan-lite' ),
                    'thumbnail' => 'https://cdn.wedevs.com/uploads/2018/01/Subscriptions.jpg',
                    'link'      => 'https://wedevs.com/dokan/pricing/?utm_source=dokan-plugin&utm_medium=banner&utm_content=booking-integration&utm_campaign=upgrade-to-pro',
                    'priority'  => 10,
                ),

                'vendor_reviews' => array(
                    'title'     => __( 'Increase conversions 270% by displaying reviews', 'dokan-lite' ),
                    'content'   => __( 'This extension enables your customers to post a review for each store available on your site.', 'dokan-lite' ),
                    'thumbnail' => 'https://cdn.wedevs.com/uploads/2017/01/Vendor-Review-1.png',
                    'link'      => 'https://wedevs.com/dokan/pricing/?utm_source=dokan-plugin&utm_medium=banner&utm_content=booking-integration&utm_campaign=upgrade-to-pro',
                    'priority'  => 20,
                ),

                'vendor_verification' => array(
                    'title'     => __( 'Verify Your Sellers To Earn Customer Reliability', 'dokan-lite' ),
                    'content'   => __( 'Allow your vendors to verify their stores using social profiles, phone, photo ID etc. using this advanced and handy module.', 'dokan-lite' ),
                    'thumbnail' => 'https://cdn.wedevs.com/uploads/2018/01/Dokan-Seller-Verification.jpg',
                    'link'      => 'https://wedevs.com/dokan/pricing/?utm_source=dokan-plugin&utm_medium=banner&utm_content=booking-integration&utm_campaign=upgrade-to-pro',
                    'priority'  => 30,
                ),

                'multiple_commission' => array(
                    'title'     => __( 'Earn more from multiple commission type', 'dokan-lite' ),
                    'content'   => __( 'With this feature, you will be able to set different type of commission for each vendor according to the products they are selling. Meaning more earning for you.', 'dokan-lite' ),
                    'thumbnail' => 'https://wedevs.s3.amazonaws.com/uploads/2018/10/Earn-more-from-multiple-commission-type_Newsletter.png',
                    'link'      => 'https://wedevs.com/dokan/pricing/#dokan-compare-table-section/?utm_source=dokan-plugin&utm_medium=banner&utm_content=multiple-comission-type&utm_campaign=upgrade-to-pro',
                    'priority'  => 40,
                ),

                'ticket_priority_support' => array(
                    'title'     => __( 'Get priority support 24/7/365', 'dokan-lite' ),
                    'content'   => __( 'Need to solve a conflict with your plugins, have a theme layout issues with Dokan or any kind of problem you might face, we are here for you', 'dokan-lite' ),
                    'thumbnail' => 'https://wedevs.s3.amazonaws.com/uploads/2018/10/Get-priority-support-24_7_365_Newsletter.png',
                    'link'      => 'https://wedevs.com/dokan/pricing/?utm_source=dokan-plugin&utm_medium=banner&utm_content=customer-support&utm_campaign=upgrade-to-pro',
                    'priority'  => 50,
                ),

                'coupon_code' => array(
                    'title'     => __( '97% of consumers look for deals when they shop', 'dokan-lite' ),
                    'content'   => __( 'No matter what type of coupon you want to create you can do that easily using the pro version of Dokan. Set the coupon title, fix discount types, restrict email addresses and much more.', 'dokan-lite' ),
                    'thumbnail' => 'https://wedevs.s3.amazonaws.com/uploads/2018/10/97-of-consumers-look-for-deals-when-they-shop_Newsletter.png',
                    'link'      => 'https://wedevs.com/dokan/pricing/#dokan-compare-table-section/?utm_source=dokan-plugin&utm_medium=banner&utm_content=coupon-code-generation&utm_campaign=upgrade-to-pro',
                    'priority'  => 60,
                ),

                'premium_modules' => array(
                    'title'     => __( 'Exciting premium features to take your marketplace', 'dokan-lite' ),
                    'content'   => __( 'With the simplest configuration options available, only by enabling a single toggle button you will be able to do everything your competitors are doing and even more.', 'dokan-lite' ),
                    'thumbnail' => 'https://wedevs.s3.amazonaws.com/uploads/2018/10/Exciting-premium-features-to-take-your-marketplace-to-the-next-level.png',
                    'link'      => 'https://wedevs.com/dokan/pricing/#dokan-compare-table-section/?utm_source=dokan-plugin&utm_medium=banner&utm_content=exciting-premium-features&utm_campaign=upgrade-to-pro',
                    'priority'  => 70,
                ),
            );
        };
    }
}
