<form method="post" id="dokan-admin-setup-wizard">
    <h1><?php esc_html_e( 'Welcome to the world of Dokan!', 'dokan-lite' ); ?></h1>
    <p>
        <?php
        echo wp_kses(
            sprintf(
                /* translators: %1$s: line break and opening strong tag, %2$s: closing strong tag */
                __(
                    'Thanks for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings. %1$sThis setup wizard is completely optional and shouldn\'t take longer than three minutes.%2$s',
                    'dokan-lite'
                ),
                '<br><strong>',
                '</strong>'
            ),
            [
                'strong' => [],
                'br'     => [],
            ]
        );
        ?>
    </p>
    <p>
        <?php
        esc_html_e(
            'Should you choose to skip the setup wizard, you can always setup Dokan manually or come back here and complete the setup via the Wizard.',
            'dokan-lite'
        );
        ?>
    </p>

    <?php if ( ! dokan_met_minimum_php_version_for_wc() ) : ?>
    <p class="dokan-no-wc-warning">
        <?php
        echo wp_kses(
            sprintf(
                /* translators: %1$s: opening anchor tag with WooCommerce plugin link, %2$s: closing anchor tag, %3$s: opening anchor tag with php update link */
                __( 'Please note that %1$sWooCommerce%2$s is necessary for Dokan to work but the current PHP version does not meet minimum requirements for WooCommerce. %3$sPlease learn more about updating PHP%2$s', 'dokan-lite' ),
                '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">',
                '</a>',
                '<a href="https://wordpress.org/support/update-php/" target="_blank" rel="noopener">'
            ),
            [
                'a' => [
                    'href'   => [],
                    'target' => [],
                    'rel'    => [],
                ],
            ]
        );
        ?>
    </p>
    <?php else : ?>
    <p>
        <?php
        echo wp_kses(
            sprintf(
                /* translators: %1$s: opening anchor tag with WooCommerce plugin link, %2$s: closing anchor tag */
                __( 'Please note that %1$sWooCommerce%2$s is necessary for Dokan to work and it will be automatically installed if you haven\'t already done so.', 'dokan-lite' ),
                '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">',
                '</a>'
            ),
            [
                'a' => [
                    'href'   => [],
                    'target' => [],
                    'rel'    => [],
                ],
            ]
        );
        ?>

        <p class="wc-setup-actions step">
            <button type="submit" class="button-primary button button-large">
                <?php esc_html_e( "Let's Go!", 'dokan-lite' ); ?>
            </button>
            <input type="hidden" name="save_step" value="true">
            <?php wp_nonce_field( 'dokan-setup' ); ?>
        </p>
    </p>
    <?php endif; ?>
</form>
