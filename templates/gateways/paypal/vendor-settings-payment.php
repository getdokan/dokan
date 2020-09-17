<div class="dokan-stripe-connect-container">

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input
                name="settings[paypal][email]"
                value="<?php echo esc_attr( $email ); ?>"
                class="dokan-form-control"
                id="vendor_paypal_email_address"
                placeholder="<?php esc_html_e( 'Your PayPal email address', 'dokan-lite' ); ?>"
                type="email"
            >
        </div>
    </div>

    <p class="dokan-text-left">
        <a href="#" class="button button-primary vendor_paypal_connect">
            <?php esc_html_e( 'Connect', 'dokan-lite' ); ?>
        </a>
    </p>
</div>

<script type="text/javascript">
    <?php
    $url = add_query_arg( [
        'action'   => 'paypal-marketplace-connect',
        '_wpnonce' => wp_create_nonce( 'paypal-marketplace-connect' ),
    ] );
    ?>

    ;(function($) {
        $('.vendor_paypal_connect').on('click', function(e) {
            e.preventDefault();

            var vendor_email = $('#vendor_paypal_email_address').val();
            var connect_url = '<?php echo $url; ?>&vendor_paypal_email_address=' + vendor_email;

            if (! vendor_email) {
                return;
            }

            window.location.href = connect_url;
        });
    })(jQuery);
</script>
