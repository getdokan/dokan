<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class InstallerHelper
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class InstallerHelper {
    /**
     * Create Reverse Withdrawal Table
     *
     * @since 3.5.1
     *
     * @return void
     */
    public static function create_reverse_withdrawal_table() {
        global $wpdb;

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_reverse_withdrawal` (
                    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                    `trn_id` bigint(20) UNSIGNED NOT NULL,
                    `trn_type` varchar(200) NOT NULL DEFAULT 'order_commission',
                    `vendor_id` bigint(20) UNSIGNED NOT NULL,
                    `note` mediumtext DEFAULT NULL,
                    `debit` decimal(19,4) NOT NULL DEFAULT '0.0000',
                    `credit` decimal(19,4) NOT NULL DEFAULT '0.0000',
                    `trn_date` int(11) UNSIGNED NOT NULL DEFAULT '0',
                    PRIMARY KEY (`id`),
                    KEY `trn_date` (`trn_date`),
                    KEY `vendor_id_trn_date` (`vendor_id`,`trn_date`),
                    KEY `vendor_id` (`vendor_id`),
                    KEY `trn_id_type` (`trn_id`,`trn_type`(191)),
                    KEY `vendor_id_trn_date_type` (`vendor_id`,`trn_date`,`trn_type`(191))
                ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * This method will create reverse withdrawal base product
     *
     * @since 3.5.1
     *
     * @return void
     */
    public static function create_reverse_withdrawal_base_product() {
        // ! Check if WooCommerce is active, we need to check this because dokan can be enabled without wooCommerce
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // get advertisement product id from option table
        $product_id = (int) get_option( Helper::get_base_product_option_key(), 0 );
        $product = wc_get_product( $product_id );
        if ( $product ) {
            return;
        }

        // create a new post
        $post = [
            'post_content' => 'This is Dokan reverse withdrawal payment product, do not delete.',
            'post_status'  => 'publish',
            'post_title'   => 'Reverse Withdrawal Payment',
            'post_parent'  => '',
            'post_type'    => 'product',
        ];

        /* Create post */
        $post_id = wp_insert_post( $post );

        if ( is_wp_error( $post_id ) ) {
            return;
        }

        // try catch block used here just to get rid of phpcs errors
        try {
            // convert post into product
            $product = new \WC_Product_Simple();
            $product->set_id( $post_id );
            $product->set_catalog_visibility( 'hidden' );
            $product->set_virtual( true );
            $product->set_price( 0 );
            $product->set_regular_price( 0 );
            $product->set_sale_price( 0 );
            $product->set_manage_stock( false );
            $product->set_tax_status( 'none' );
            $product->set_sold_individually( true );
            $product->save();

            update_option( Helper::get_base_product_option_key(), $product->get_id() );
        } catch ( \Exception $exception ) {
            return;
        }
    }
}
