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
<?php if ( ! $has_woocommerce ): ?>
<div class="dokan-woocommerce-missing-notice dokan-alert notice">
    <div class="notice-content">
        <div class="logo-wrap">
            <div class="dokan-logo"></div>
            <span class="dokan-icon dokan-icon-alert"></span>
        </div>
        <div class="dokan-message">
            <h3><?php _e( 'WooCommerce Missing', 'dokan-lite' ); ?></h3>
            <?php
                $install_url  = wp_nonce_url( add_query_arg( array( 'action' => 'install-plugin', 'plugin' => 'woocommerce' ), admin_url( 'update.php' ) ), 'install-plugin_woocommerce' );
                // translators: 1$-2$: opening and closing <strong> tags, 3$-4$: link tags, takes to woocommerce plugin on wp.org, 5$-6$: opening and closing link tags, leads to plugins.php in admin
                $text         = sprintf( esc_html__( '%1$sDokan is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for Dokan to work. Please %5$sinstall WooCommerce &raquo;%6$s',  'dokan-lite' ), '<strong>', '</strong>', '<a href="https://wordpress.org/plugins/woocommerce/">', '</a>', '<a href="' .  esc_url( $install_url ) . '">', '</a>' );

                if ( $woocommerce_installed ) {
                    $install_url = wp_nonce_url( add_query_arg( array( 'action' => 'activate', 'plugin' => urlencode( 'woocommerce/woocommerce.php' ) ), admin_url( 'plugins.php' ) ), 'activate-plugin_woocommerce/woocommerce.php' );
                    $is_install  = false;
                    // translators: 1$-2$: opening and closing <strong> tags, 3$-4$: link tags, takes to woocommerce plugin on wp.org, 5$-6$: opening and closing link tags, leads to plugins.php in admin
                    $text        = sprintf( esc_html__( '%1$sDokan is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for Dokan to work. Please %5$sactivate WooCommerce &raquo;%6$s',  'dokan-lite' ), '<strong>', '</strong>', '<a href="https://wordpress.org/plugins/woocommerce/">', '</a>', '<a href="' .  esc_url( $install_url ) . '">', '</a>' );
                }
            ?>
            <div><?php echo $text; ?></div>
        </div>
    </div>
</div>
<style>
    .dokan-woocommerce-missing-notice.notice {
        border-width: 0;
        padding: 0;
        background: transparent;
    }

    .dokan-woocommerce-missing-notice.dokan-alert {
        border-left: 2px solid #b44445;
    }

    .dokan-woocommerce-missing-notice .notice-content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        border: 1px solid #dfe2e7;
        border-radius: 0 5px 5px 0;
        background: #fff;
    }

    .dokan-woocommerce-missing-notice .logo-wrap {
        position: relative;
    }

    .dokan-woocommerce-missing-notice .logo-wrap .dokan-logo {
        width: 60px;
        height: 60px;
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 62 62' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.90723' y='.79541' width='61' height='61' rx='30.5' fill='%23F16982'/%3E%3Cpath d='m19.688 25.014v-6.1614c1.4588-0.0303 7.7804 0.0301 13.407 3.6546-0.5844-0.2658-1.2264-0.4219-1.8846-0.4584-0.6581-0.0364-1.3177 0.0477-1.9361 0.2469-1.4936 0.5135-2.7441 1.8122-2.8483 3.2016-0.1737 2.3861 0 4.8627 0 7.2488v7.2186c-1.1115 0.0906-2.2577 0.1208-3.2649 0.1208-1.0768 0.0302-2.1188 0.0302-2.9524 0.1208l-0.521 0.0907v-15.283z' fill='%23fff'/%3E%3Cpath d='m17.848 43.77s-0.278-2.3257 2.5007-2.6579c2.7787-0.3323 8.0583 0.302 11.532-1.6008 0 0 2.0494-0.9363 2.4662-1.3893l-0.5558 1.6309s-1.6325 4.9534-6.5994 5.5876c-4.967 0.6041-5.9048-1.7517-9.3434-1.5705z' fill='%23fff'/%3E%3Cpath d='m28.546 45.824c3.9596-0.8457 8.4404-3.3828 8.4404-16.159 0-12.776-17.02-11.689-17.02-11.689 4.0639-2.084 25.008-4.6815 25.008 13.32 0 17.971-16.429 14.528-16.429 14.528z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-woocommerce-missing-notice .logo-wrap .dokan-icon {
        width: 20px;
        height: 20px;
        position: absolute;
        top: -2px;
        right: -8px;
        border: 2px solid #fff;
        border-radius: 55px;
        background: #ffffff;
    }

    .dokan-woocommerce-missing-notice .logo-wrap .dokan-icon-alert {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10.288' cy='10.885' r='10.09' fill='%23B44344'/%3E%3Cpath d='m15.457 13.46-4.11-6.5174c-0.2318-0.36758-0.6274-0.58705-1.0583-0.58705-0.43093 0-0.82657 0.21947-1.0583 0.58705l-4.11 6.5174c-0.24669 0.3913-0.26305 0.8872-0.04257 1.2943 0.22049 0.407 0.64232 0.6598 1.1009 0.6598h8.22c0.4585 0 0.8804-0.2528 1.1009-0.6599 0.2204-0.407 0.204-0.9029-0.0426-1.2942zm-5.1683 0.8571c-0.37797 0-0.68432-0.3101-0.68432-0.6926s0.30639-0.6926 0.68432-0.6926c0.3779 0 0.6843 0.3101 0.6843 0.6926s-0.3064 0.6926-0.6843 0.6926zm0.9485-4.8126-0.3371 2.2966c-0.0496 0.3381-0.3606 0.5714-0.6946 0.5212-0.26984-0.0405-0.47216-0.2547-0.51377-0.5133l-0.36601-2.2921c-0.08521-0.53366 0.27317-1.0362 0.80048-1.1224 0.5273-0.08624 1.0239 0.27646 1.1091 0.81011 0.016 0.1005 0.0155 0.20424 0.0019 0.29994z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-woocommerce-missing-notice .dokan-message {
        margin: 0 23px;
    }

    .dokan-woocommerce-missing-notice .dokan-message h3 {
        margin: 0 0 10px;
        font-weight: bold;
        font-size: 18px;
        font-family: "Segoe UI", sans-serif;
    }

    .dokan-woocommerce-missing-notice .dokan-message div {
        color: #4b4b4b;
        font-weight: 400;
        font-size: 13px;
        font-family: "Segoe UI", sans-serif;
    }

    .dokan-woocommerce-missing-notice .dokan-message a {
        text-decoration: none;
    }
</style>
<?php endif; ?>
