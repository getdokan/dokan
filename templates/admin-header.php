<div class="dokan-admin-header">
    <div class="dokan-admin-header-logo">
        <img src="<?php echo DOKAN_PLUGIN_ASSEST . '/images/dokan-logo.png'; ?>" alt="Dokan Logo" />
        <span class="dokan-admin-header__version">v<?php echo DOKAN_PLUGIN_VERSION ?></span>
    </div>

    <div class="dokan-admin-header-menu">
        <div class="menu-item">
            <div class="item">
                <div class="dokan-icon icon-question-mark">
                    <span class="whats-new-pointer"></span>
                </div>
                <div class="dropdown">
                    <h3><?php esc_html_e( 'Get Help', 'dokan-lite' ); ?></h3>
                    <div class="list-item">
                        <a href="<?php echo esc_url( admin_url( 'admin.php?page=dokan#/changelog' ) ); ?>" class="active">
                            <div class="dokan-icon">
                                <div class="icon-whats-new"></div>
                            </div>
                             <?php esc_html_e( 'What’s New', 'dokan-lite' ); ?>
                        </a>
                        <a href="https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite" target="_blank">
                            <div class="dokan-icon">
                                <div class="icon-get-support"></div>
                            </div>
                            <?php esc_html_e( 'Get Support', 'dokan-lite' ); ?>
                        </a>
                        <a href="https://www.facebook.com/groups/dokanMultivendor" target="_blank">
                            <div class="dokan-icon">
                                <div class="icon-community"></div>
                            </div>
                            <?php esc_html_e( 'Community', 'dokan-lite' ); ?>
                        </a>
                        <a href="https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite" target="_blank">
                            <div class="dokan-icon">
                                <div class="icon-documentation"></div>
                            </div>
                            <?php esc_html_e( 'Documentation', 'dokan-lite' ); ?>
                        </a>
                        <a href="https://wedevs.com/dokan/faq" target="_blank">
                            <div class="dokan-icon">
                                <div class="icon-faq"></div>
                            </div>
                            <?php esc_html_e( 'FAQ', 'dokan-lite' ); ?>
                        </a>
                        <a href="<?php echo esc_url( admin_url( 'admin.php?page=dokan#/help' ) ); ?>">
                            <div class="dokan-icon">
                                <div class="icon-basic"></div>
                            </div>
                            <?php esc_html_e( 'Basic & Fundamental', 'dokan-lite' ); ?>
                        </a>
                        <a href="https://wedevs.com/account/dokan-feature-requests/" target="_blank">
                            <div class="dokan-icon">
                                <div class="icon-request-feature"></div>
                            </div>
                            <?php esc_html_e( 'Request a Feature', 'dokan-lite' ); ?>
                        </a>
                        <a href="<?php echo esc_url( admin_url( 'admin.php?page=dokan-setup' ) ); ?>">
                            <div class="dokan-icon">
                                <div class="icon-setup-wizard"></div>
                            </div>
                            <?php esc_html_e( 'Run Setup Wizard', 'dokan-lite' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!--<div class="menu-item">
            <div class="item">
                <div class="dokan-icon icon-notification-bell">
                    <span class="notification-count">4</span>
                </div>
            </div>
        </div>-->
    </div>
</div>
