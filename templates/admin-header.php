<div class="dokan-admin-header">
    <div class="dokan-admin-header-logo">
        <img src="<?php echo DOKAN_PLUGIN_ASSEST . '/images/dokan-logo.png'; ?>" alt="Dokan Logo" />
        <span class="dokan-admin-header-version">v<?php echo DOKAN_PLUGIN_VERSION ?></span>
    </div>

    <div class="dokan-admin-header-menu">
        <div class="menu-item">
            <div class="item">
                <div class="dokan-icon icon-question-mark">
                    <?php if ( $has_new_version ) : ?>
                        <span class="whats-new-pointer"></span>
                    <?php endif; ?>
                </div>
                <div class="dropdown">
                    <h3><?php esc_html_e( 'Get Help', 'dokan-lite' ); ?></h3>
                    <div class="list-item">
                        <a href="<?php echo esc_url( add_query_arg( array( 'page' => 'dokan#/changelog' ), admin_url( 'admin.php' ) ) ); ?>" class="<?php echo $has_new_version ? 'active' : ''; ?>">
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
                        <a href="<?php echo esc_url( add_query_arg( array( 'page' => 'dokan#/help' ), admin_url( 'admin.php' ) ) ); ?>">
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
                        <a href="<?php echo esc_url( add_query_arg( array( 'page' => 'dokan-setup' ), admin_url( 'admin.php' ) ) ); ?>">
                            <div class="dokan-icon">
                                <div class="icon-setup-wizard"></div>
                            </div>
                            <?php esc_html_e( 'Run Setup Wizard', 'dokan-lite' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
