<form method="post" id="dokan-admin-setup-wizard">
    <h1><?php esc_html_e( 'Welcome to the world of Dokan!', 'dokan-lite' ); ?></h1>
    <p><?php echo wp_kses( __( 'Thank you for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than three minutes.</strong>', 'dokan-lite' ), [ 'strong' => [] ] ); ?></p>
    <p>
        <?php
            printf(
                esc_html__( 'In order to use Dokan you need to install %s. THIS TEXT SHOULD BE UPDATED', 'dokan-lite' ),
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
