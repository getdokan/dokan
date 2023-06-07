<?php
/**
 * Admin View: Dep notice
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * @var bool $has_woocommerce
 * @var bool $woocommerce_installed
 */
?>
<?php if ( ! $has_woocommerce ) : ?>
    <div class="notice dokan-admin-notices-wrap">
        <div class="dokan-admin-notice dokan-alert">
            <div class="notice-content">
                <div class="logo-wrap">
                    <div class="dokan-logo"></div>
                    <span class="dokan-icon dokan-icon-alert"></span>
                </div>
                <div class="dokan-message">
                    <h3><?php esc_html_e( 'WooCommerce Missing', 'dokan-lite' ); ?></h3>
                    <?php
                    $install_url = wp_nonce_url(
                        add_query_arg(
                            [
                                'action' => 'install-plugin',
                                'plugin' => 'woocommerce',
                            ], admin_url( 'update.php' )
                        ), 'install-plugin_woocommerce'
                    );
                    // translators: 1$-2$: opening and closing <strong> tags, 3$-4$: link tags, takes to woocommerce plugin on wp.org, 5$-6$: opening and closing link tags, leads to plugins.php in admin
                    $text = sprintf( esc_html__( '%1$sDokan is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for Dokan to work. Please %5$s install WooCommerce &raquo;%6$s', 'dokan-lite' ), '<strong>', '</strong>', '<a href="https://wordpress.org/plugins/woocommerce/">', '</a>', '<a href="' . esc_url( $install_url ) . '">', '</a>' );

                    if ( $woocommerce_installed ) {
                        $install_url = wp_nonce_url(
                            add_query_arg(
                                [
                                    'action' => 'activate',
                                    'plugin' => rawurlencode( 'woocommerce/woocommerce.php' ),
                                ], admin_url( 'plugins.php' )
                            ), 'activate-plugin_woocommerce/woocommerce.php'
                        );
                        // translators: 1$-2$: opening and closing <strong> tags, 3$-4$: link tags, takes to woocommerce plugin on wp.org, 5$-6$: opening and closing link tags, leads to plugins.php in admin
                        $text = sprintf( esc_html__( '%1$sDokan is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for Dokan to work. Please %5$s activate WooCommerce &raquo;%6$s', 'dokan-lite' ), '<strong>', '</strong>', '<a href="https://wordpress.org/plugins/woocommerce/">', '</a>', '<a href="' . esc_url( $install_url ) . '">', '</a>' );
                    }
                    ?>
                    <div><?php echo wp_kses_post( $text ); ?></div>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>
