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
    <p>
        <?php
            printf(
                esc_html__( 'Please note that %s is necessary for Dokan to work and it will be automatically installed if you haven\'t already done so.', 'dokan-lite' ),
                '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">WooCommerce</a>'
            );
        ?>
    </p>
    <p class="wc-setup-actions step">
        <button type="submit" class="button-primary button button-large">
            <?php esc_html_e( "Let's Go!", 'dokan-lite' ); ?>
        </button>
        <input type="hidden" name="save_step" value="true">
        <?php wp_nonce_field( 'dokan-setup' ); ?>
    </p>
</form>
