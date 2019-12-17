<?php
namespace WeDevs\Dokan\Admin;

/**
* Admin Hooks
*
* @package dokan
*
* @since DOKAN_LITE_SINCE
*/
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        // Load all actions
        add_action( 'pre_get_posts', 'dokan_admin_shop_order_remove_parents' );
        add_action( 'manage_shop_order_posts_custom_column', 'dokan_shop_order_custom_columns', 11 );
        add_action( 'admin_footer-edit.php', 'dokan_admin_shop_order_scripts' );
        add_action( 'wp_trash_post', 'dokan_admin_on_trash_order' );
        add_action( 'untrash_post', 'dokan_admin_on_untrash_order' );
        add_action( 'delete_post', 'dokan_admin_on_delete_order' );
        add_action( 'restrict_manage_posts', 'dokan_admin_shop_order_toggle_sub_orders');
        add_action( 'pending_to_publish', 'dokan_send_notification_on_product_publish' );
        add_action( 'add_meta_boxes', 'dokan_add_seller_meta_box' );
        add_action( 'woocommerce_process_product_meta', 'dokan_override_product_author_by_admin', 12, 2 );

        // Load all filters
        add_filter( 'woocommerce_reports_get_order_report_query', 'dokan_admin_order_reports_remove_parents' );
        add_filter( 'manage_edit-shop_order_columns', 'dokan_admin_shop_order_edit_columns', 11 );
        add_filter( 'post_class', 'dokan_admin_shop_order_row_classes', 10, 2);
        add_filter( 'post_types_to_delete_with_user', 'dokan_add_wc_post_types_to_delete_user', 10, 2 );
        add_filter( 'dokan_save_settings_value', 'dokan_update_pages', 10, 2 );
    }
}
