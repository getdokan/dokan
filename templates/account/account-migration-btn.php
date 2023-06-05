<?php
/**
 * Dokan Account Migration Button Template.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */

?>

<p>&nbsp;</p>

<ul class="dokan-account-migration-lists">
    <?php if ( ! dokan_is_user_seller( get_current_user_id() ) ) : ?>
        <li>
            <div class="dokan-w8 left-content">
                <p><strong><?php esc_html_e( 'Become a Vendor', 'dokan-lite' ); ?></strong></p>
                <p><?php esc_html_e( 'Vendors can sell products and manage a store with a vendor dashboard.', 'dokan-lite' ); ?></p>
            </div>
            <div class="dokan-w4 right-content">
                <a href="<?php echo esc_url( dokan_get_page_url( 'myaccount', 'woocommerce', 'account-migration' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Become a Vendor', 'dokan-lite' ); ?></a>
            </div>
            <div class="dokan-clearfix"></div>
        </li>
    <?php endif; ?>

    <?php do_action( 'dokan_customer_account_migration_list' ); ?>
</ul>
