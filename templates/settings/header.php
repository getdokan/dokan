<?php
/**
 * Dokan Settings Header Template
 *
 * @since   2.4
 *
 * @package dokan
 */
?>
<header class="dokan-dashboard-header">
    <div class="dokan-store-settign-header-wrap">
        <h1 class="entry-title">
            <?php echo wp_kses_post( $heading ); ?>
            <small>&rarr; <a href="<?php echo esc_url( dokan_get_store_url( dokan_get_current_user_id() ) ); ?>"><?php esc_html_e( 'Visit Store', 'dokan-lite' ); ?></a></small>
        </h1>
    </div>

    <?php if ( isset( $is_store_setting ) && $is_store_setting ) : ?>
        <span class="dokan-update-setting-top">
	        <button class="dokan-update-setting-top-button dokan-btn dokan-btn-theme dokan-right"><?php esc_html_e( 'Update Settings', 'dokan-lite' ); ?></button>
	    </span>
    <?php endif ?>
</header><!-- .dokan-dashboard-header -->
