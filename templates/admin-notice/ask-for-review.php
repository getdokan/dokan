<?php
/**
 * Ask for review notice template
 *
 * @since 3.2.16
 */
?>
<div class="notice notice-warning dokan-notice dokan-review-notice">
    <?php do_action( 'dokan_ask_for_review_admin_notice_content_before' ); ?>

    <div class="dokan-review-notice-logo">
        <img src="http://dokan-dev.test/wp-content/plugins/dokan-lite/assets/images/dokan-logo-small.svg" alt="Dokan Logo">
    </div>
    <p class="dokan-notice-text"><?php echo wp_kses_post( _( 'Enjoying <strong><a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan multivendor</a></strong>? If our plugin is performing well for you, it would be great if you could kindly write a review about <strong><a href="https://wordpress.org/plugins/dokan-lite/" target="_blank">Dokan on WordPress.org</a></strong>. It would give us insights to grow and improve this plugin.', 'dokan-lite' ) ); ?></p>
    <div class="dokan-notice-buttons" data-nonce="<?php echo wp_create_nonce( 'dokan_admin' ); ?>">
        <a class="button dokan-notice-btn dokan-notice-btn-primary dokan-notice-action" href="https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post" target="_blank"data-key="dokan-notice-postpond" data-nonce="<?php echo wp_create_nonce( 'dokan_admin' ); ?>"><?php esc_html_e( 'Yes, You Deserve It', 'dokan-lite' ); ?></a>
        <button class="button dokan-notice-btn dokan-notice-action" href="#" data-key="dokan-notice-postpond" data-nonce="<?php echo wp_create_nonce( 'dokan_admin' ); ?>"><?php esc_html_e( 'Maybe Later', 'dokan-lite' ); ?></button>
        <button class="button dokan-notice-btn dokan-notice-close dokan-notice-action" href="#" data-key="dokan-notice-dismiss" data-nonce="<?php echo wp_create_nonce( 'dokan_admin' ); ?>"><?php esc_html_e( 'I’ve Added My Review', 'dokan-lite' ); ?></button>
    </div>
    <span class="dokan-notice-close dokan-notice-action dashicons dashicons-no-alt" data-key="dokan-notice-dismiss" data-nonce="<?php echo wp_create_nonce( 'dokan_admin' ); ?>"></span>
    <div class="clear"></div>

    <?php do_action( 'dokan_ask_for_review_admin_notice_content_after' ); ?>
</div>
