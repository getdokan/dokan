<div class="notice notice-warning is-dismissible">
    <h4>
        <?php _e( 'PayPal Webhook', 'dokan-lite' ); ?>
    </h4>

    <p>
        <?php
        echo wp_kses(
            sprintf(
                __( 'Set your webhook <code>%s</code> in your PayPal <a href="%s" target="_blank">application settings</a> for payment process.', 'dokan-lite' ),
                home_url( 'wc-api/dokan-paypal' ),
                'https://developer.paypal.com/developer/applications/'
            ),
            [
                'a'    => [
                    'href'   => true,
                    'target' => true,
                ],
                'code' => [],
            ]
        )
        ?>
    </p>
</div>
