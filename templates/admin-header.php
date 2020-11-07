<div class="dokan-admin-header">
    <div class="dokan-admin-header__logo">
        <img src="<?php echo DOKAN_PLUGIN_ASSEST . '/images/dokan-logo.png'; ?>" alt="Dokan Logo" />
        <span class="dokan-admin-header__version">v<?php echo DOKAN_PLUGIN_VERSION ?></span>
    </div>

    <div class="dokan-admin-header__menu">
        <a
            href="https://www.facebook.com/groups/dokanMultivendor"
            class="header-link"
            target="_blank"
            rel="noopener"
            title="<?php esc_attr_e( 'Join our Facebook community group', 'dokan-lite' ); ?>"
        >
            <div class="dashicons dashicons-facebook"></div>
            <span class="title"><?php echo esc_html_e( 'Community', 'dokan-lite' ); ?></span>
        </a>

        <a
            href="https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
            class="header-link"
            target="_blank"
            rel="noopener"
            title="<?php esc_attr_e( 'View the plugin documentation', 'dokan-lite' ); ?>"
        >
            <span class="dashicons dashicons-welcome-learn-more"></span>
            <span class="title"><?php echo esc_html_e( 'Docs', 'dokan-lite' ); ?></span>
        </a>

        <a
            href="https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
            class="header-link"
            rel="noopener"
            target="_blank"
            title="<?php esc_attr_e( 'Connect with your support team', 'dokan-lite' ); ?>"
        >
            <span class="dashicons dashicons-sos"></span>
            <span class="title"><?php echo esc_html_e( 'Support', 'dokan-lite' ); ?></span>
        </a>

        <?php if ( ! dokan()->is_pro_exists() ) { ?>
            <a
                href="https://wedevs.com/dokan-lite-upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
                class="header-link header-link--cta"
                rel="noopener"
                target="_blank"
                title="<?php esc_attr_e( 'Upgrade to Dokan Pro', 'dokan-lite' ); ?>"
            >
                <?php echo esc_html_e( 'Upgrade to Pro', 'dokan-lite' ); ?>
            </a>
        <?php } ?>
    </div>
</div>
