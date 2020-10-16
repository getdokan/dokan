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
        <a
            href="javascript:void(0)"
            class="button button-primary vendor_paypal_connect <?php echo $button_class; ?>"
        >
            <?php echo esc_html( $button_text ); ?>
        </a>
    </p>

    <div id="paypal_connect_button"></div>
</div>

<?php
if ( ! $button_disabled ) :
?>
<script type="text/javascript">
    <?php
    $url = site_url() . add_query_arg( [
        'action'   => 'paypal-marketplace-connect',
        '_wpnonce' => wp_create_nonce( 'paypal-marketplace-connect' ),
    ] );
    ?>

    ;(function($, document) {
        var clicked = false;

        $('.vendor_paypal_connect').on('click', function(e) {
            if (clicked) {
                return;
            }

            e.preventDefault();
            $(this).addClass('disabled');
            var vendor_email = $('#vendor_paypal_email_address').val();
            var connect_url = '<?php echo $url; ?>&vendor_paypal_email_address=' + vendor_email + '&displayMode=minibrowser';

            if (! vendor_email) {
                return;
            }

            (function(d, s, id) {
                var js, ref = d.getElementsByTagName(s)[0];
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.async = true;
                    js.src = "https://www.paypal.com/webapps/merchantboarding/js/lib/lightbox/partner.js";
                    ref.parentNode.insertBefore(js, ref);
                }
            }(document, "script", "paypal-js"));

            $('#paypal_connect_button').append('<div dir="ltr" style="text-align: left;" trbidi="on">\n' +
                '        <p class="dokan-text-left">\n' +
                '            <a\n' +
                '                data-paypal-button="true"\n' +
                '                target="PPFrame"\n' +
                '                href="'+ connect_url +'"\n' +
                '                id="vendor_paypal_connect"\n' +
                '                class="button button-primary <?php echo $button_class; ?>"\n' +
                '            >Connect To Paypal</a>\n' +
                '        </p>\n' +
                '    </div>');

            $('#paypal_connect_button').hide();

            clicked = true;

            setTimeout(function() {
                document.getElementById("vendor_paypal_connect").click();
            }, 3000);
        });
    })(jQuery, document);
</script>
<?php endif; ?>
