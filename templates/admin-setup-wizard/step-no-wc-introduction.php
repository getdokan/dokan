<form method="post" id="dokan-admin-setup-wizard">
    <h1><?php esc_html_e( 'Welcome to the world of Dokan!', 'dokan-lite' ); ?></h1>
    <p><?php echo wp_kses( __( 'Thanks for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings.
        <strong>This setup wizard is completely optional and shouldn\'t take longer than three minutes.</strong>', 'dokan-lite' ), [ 'strong' => [] ] ); ?></p>
    <p>
        <?php
            printf(
                esc_html__( 'Should you choose to skip the setup wizard, you can always setup Dokan manually or come back here and complete the setup via the Wizard.', 'dokan-lite' )
            );
        ?>
    </p>

    <?php
        if ( ! dokan_met_minimum_php_version_for_wc() ) {
            $wc_link = '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">WooCommerce</a>';
            $message = '<p class="dokan-no-wc-warning">';
            $message .= sprintf( __( 'Please note that %1$s is necessary for Dokan to work but the current PHP version does not meet minimum requirements for WooCommerce. ', 'dokan-lite' ), $wc_link );
            $message .= sprintf( '<a href="https://wordpress.org/support/update-php/" target="_blank" rel="noopener">' . __( 'Please learn more about updating PHP', 'dokan-lite' ) . '.</a>' );
            $message .= '</p>';

            echo wp_kses(
                $message,
                [
                    'p' => [
                        'class' => []
                    ],
                    'a' => [
                        'href'   => [],
                        'target' => [],
                        'rel'    => []
                    ]
                ]
            );
        } else {
            $message = sprintf(
                __( '<p>Please note that %1$s is necessary for Dokan to work and it will be automatically installed if you haven\'t already done so.</p>', 'dokan-lite' ),
                '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">WooCommerce</a>'
            );

            echo wp_kses(
                $message,
                [
                    'p' => [],
                    'a' => [
                        'href'   => [],
                        'target' => [],
                        'rel'    => []
                    ]
                ]
            ); ?>

            <p class="wc-setup-actions step">
                <button type="submit" class="button-primary button button-large">
                    <?php esc_html_e( "Let's Go!", 'dokan-lite' ); ?>
                </button>
                <input type="hidden" name="save_step" value="true">
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        <?php }
    ?>
</form>
