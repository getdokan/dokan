<?php echo wc_print_notices(); ?>

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

        <?php if ( $merchant_id && ! $primary_email ) : ?>
        <div class="dokan-w12">
            <div class="dokan-alert dokan-alert-warning dokan-text-left" style="margin-top: 15px">
                <?php esc_html_e('Your primary email is not confirmed yet. To receive payment you must need to confirm your paypal primary email.', 'dokan-lite');?>
            </div>
        </div>
        <?php endif;?>
    </div>

    <p class="dokan-text-left">
        <a
            href="javascript:void(0)"
            class="button button-primary vendor_paypal_connect <?php echo $button_class; ?>"
        >
            <?php echo esc_html( $button_text ); ?>
        </a>

        <?php if ( $merchant_id && ! $primary_email ) : ?>
            <?php $url = add_query_arg( [
                'action'   => 'merchant-status-update',
                '_wpnonce' => wp_create_nonce( 'paypal-marketplace-connect' ),
            ] );
            ?>
            <a
                href="<?php echo $url;?>"
                class="button button-primary"
            >
                <?php echo esc_html_e( 'Update', 'dokan-lite' ); ?>
            </a>
        <?php endif;?>
    </p>

    <div id="paypal_connect_button"></div>
</div>

<?php
if ( ! $button_disabled ) :
?>
<script type="text/javascript">
    ;(function($, document) {
        var paypal_connect = {
            clicked: false,
            load_partner_js: function () {
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
            },
            render_button: function (connect_url) {
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
            },
            init: function () {
                $('.vendor_paypal_connect').on('click', function(e) {
                    if (paypal_connect.clicked) {
                        return;
                    }

                    e.preventDefault();

                    var vendor_email = $('#vendor_paypal_email_address').val();

                    if (! vendor_email) {
                        return;
                    }

                    $(this).addClass('disabled');

                    let connect_data = {
                        action: "dokan_paypal_marketplace_connect",
                        vendor_paypal_email_address: vendor_email,
                        nonce: '<?php echo $nonce;?>'
                    };

                    $.ajax({
                        type: 'POST',
                        url: '<?php echo $ajax_url; ?>',
                        data: connect_data,
                        dataType: 'json',
                    }).done(function(result) {
                        try {
                            if (result.success) {
                                paypal_connect.load_partner_js();
                                paypal_connect.render_button(result.data.url);

                                paypal_connect.clicked = true;

                                setTimeout(function () {
                                    document.getElementById('vendor_paypal_connect').click();
                                }, 3000);
                            } else {
                                throw new Error(result.data.message);
                            }
                        } catch (err) {
                            // Reload page
                            if (result.data.reload === true) {
                                window.location.href = result.data.url;
                                return;
                            }
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                    });
                });
            }

        };

        paypal_connect.init();
    })(jQuery, document);
</script>
<?php endif; ?>
