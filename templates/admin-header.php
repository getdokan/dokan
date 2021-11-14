<div class="dokan-admin-header">
    <div class="dokan-admin-header__logo">
        <img src="<?php echo DOKAN_PLUGIN_ASSEST . '/images/dokan-logo.png'; ?>" alt="Dokan Logo" />
        <span class="dokan-admin-header__version">v<?php echo DOKAN_PLUGIN_VERSION ?></span>
    </div>

    <div class="dokan-admin-header__menu">
        <div class="menu-item">
            <div class="item">
                <div class="icon-question-mark"></div>
                <div class="dropdown">
                    <h3><?php esc_html_e( 'Get Help', 'dokan-lite' ); ?></h3>
                    <div class="list-item">
                        <a href="#">
                            <div class="icon">
                                <div class="icon-whats-new"></div>
                            </div>
                             <?php esc_html_e( 'What’s New', 'dokan-lite' ); ?>
                        </a>
                        <a
                            href="https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
                            title="<?php esc_attr_e( 'Connect with your support team', 'dokan-lite' ); ?>"
                            target="_blank"
                        >
                            <div class="icon">
                                <div class="icon-get-support"></div>
                            </div>
                            <?php esc_html_e( 'Get Support', 'dokan-lite' ); ?>
                        </a>
                        <a
                            href="https://www.facebook.com/groups/dokanMultivendor"
                            title="<?php esc_attr_e( 'Join our Facebook community group', 'dokan-lite' ); ?>"
                            target="_blank"
                        >
                            <div class="icon">
                                <div class="icon-community"></div>
                            </div>
                            <?php esc_html_e( 'Community', 'dokan-lite' ); ?>
                        </a>
                        <a
                            href="https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
                            title="<?php esc_attr_e( 'View the plugin documentation', 'dokan-lite' ); ?>"
                            target="_blank"
                        >
                            <div class="icon">
                                <div class="icon-documentation"></div>
                            </div>
                            <?php esc_html_e( 'Documentation', 'dokan-lite' ); ?>
                        </a>
                        <a href="#">
                            <div class="icon">
                                <div class="icon-faq"></div>
                            </div>
                            <?php esc_html_e( 'FAQ', 'dokan-lite' ); ?>
                        </a>
                        <a href="#">
                            <div class="icon">
                                <div class="icon-basic"></div>
                            </div>
                            <?php esc_html_e( 'Basic & Fundamental', 'dokan-lite' ); ?>
                        </a>
                        <a href="#">
                            <div class="icon">
                                <div class="icon-request-feature"></div>
                            </div>
                            <?php esc_html_e( 'Request a Feature', 'dokan-lite' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!--<div class="menu-item">
            <div class="item">
                <span class="notification-count">4</span>
                <div class="icon-notification-bell"></div>
            </div>
        </div>-->
    </div>
</div>
