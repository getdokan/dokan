// Dokan Login Form Popup
(function($) {
    dokan.login_form_popup = {
        form_html: '',

        init: function () {
            $( 'body' ).on( 'dokan:login_form_popup:show', this.get_form );
            $( 'body' ).on( 'submit', '#dokan-login-form-popup-form', this.submit_form );
            $( 'body' ).on( 'dokan:login_form_popup:working', this.working );
            $( 'body' ).on( 'dokan:login_form_popup:done_working', this.done_working );
        },

        get_form: function (e, options) {
            if ( dokan.login_form_popup.form_html ) {
                dokan.login_form_popup.show_popup();
                return;
            }

            options = $.extend(true, {
                nonce: dokan.nonce,
                action: 'dokan_get_login_form'
            }, options );

            $( 'body' ).trigger( 'dokan:login_form_popup:fetching_form' );

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'get',
                dataType: 'json',
                data: {
                    _wpnonce: options.nonce,
                    action: options.action
                }
            } ).done( function ( response ) {
                dokan.login_form_popup.form_html = response.data;
                dokan.login_form_popup.show_popup();
                $( 'body' ).trigger( 'dokan:login_form_popup:fetched_form' );
            } );
        },

        show_popup: function () {
            $.magnificPopup.open({
                items: {
                    src: dokan.login_form_popup.form_html,
                    type: 'inline'
                },

                callbacks: {
                    open: function () {
                        $( 'body' ).trigger( 'dokan:login_form_popup:opened' );
                    }
                }
            });
        },

        submit_form: function ( e ) {
            e.preventDefault();

            var form_data = $( this ).serialize();
            var error_section = $( '.dokan-login-form-error', '#dokan-login-form-popup-form' );

            error_section.removeClass( 'has-error' ).text('');

            $( 'body' ).trigger( 'dokan:login_form_popup:working' );

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: {
                    _wpnonce: dokan.nonce,
                    action: 'dokan_login_user',
                    form_data: form_data
                }
            } ).done( function ( response ) {
                $( 'body' ).trigger( 'dokan:login_form_popup:logged_in', response );
                $.magnificPopup.close();
            } ).always( function () {
                $( 'body' ).trigger( 'dokan:login_form_popup:done_working' );
            } ).fail( function ( jqXHR ) {
                if ( jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message ) {
                    error_section.addClass( 'has-error' ).text( jqXHR.responseJSON.data.message );
                }
            } );
        },

        working: function () {
            $( 'fieldset', '#dokan-login-form-popup-form' ).prop( 'disabled', true );
            $( '#dokan-login-form-submit-btn' ).addClass( 'dokan-hide' );
            $( '#dokan-login-form-working-btn' ).removeClass( 'dokan-hide' );
        },

        done_working: function () {
            $( 'fieldset', '#dokan-login-form-popup-form' ).prop( 'disabled', false );
            $( '#dokan-login-form-submit-btn' ).removeClass( 'dokan-hide' );
            $( '#dokan-login-form-working-btn' ).addClass( 'dokan-hide' );
        }
    };

    dokan.login_form_popup.init();
})(jQuery);

//paypal smart checkout button
;(function ( $, window, document ) {
    'use strict';

    if ('undefined' === typeof dokan_paypal || ! dokan_paypal.is_checkout_page) {
        return;
    }

    if ( 'smart' !== dokan_paypal.payment_button_type ) {
        return;
    }

    var selected_payment_method;

    var payment_method = {
        toggle_buttons: function (payment_method) {
            var isPayPal = payment_method === 'dokan_paypal_marketplace';
            var togglePaypal = isPayPal ? 'show' : 'hide';
            var toggleSubmit = isPayPal ? 'hide' : 'show';

            $( '#paypal-button-container' ).animate( { opacity: togglePaypal, height: togglePaypal, padding: togglePaypal }, 230 );
            $( '#place_order' ).animate( { opacity: toggleSubmit, height: toggleSubmit, padding: toggleSubmit }, 230 );
        },
        on_change: function () {
            $( 'form.checkout' ).on( 'click', 'input[name="payment_method"]', function(e) {
                if ( 'smart' !== dokan_paypal.payment_button_type ) {
                    return;
                }

                if ( selected_payment_method === e.target.value ) {
                    return;
                }

                selected_payment_method = e.target.value;
                payment_method.toggle_buttons(e.target.value);
            } );
        },
        init: function () {
            if ( 'smart' !== dokan_paypal.payment_button_type ) {
                return;
            }

            let checked_payment_method = $('.woocommerce-checkout').find('input[name="payment_method"]:checked').val();
            payment_method.toggle_buttons(checked_payment_method);

            payment_method.on_change();
        }
    };

    setTimeout(() => {
        payment_method.init();
    }, 6000);

})( jQuery, window, document );

//paypal checkout process
;(function($, window, document) {

    if ('undefined' === typeof dokan_paypal || ! dokan_paypal.is_checkout_page) {
        return;
    }

    if ( 'smart' !== dokan_paypal.payment_button_type ) {
        return;
    }

    var dokan_paypal_marketplace = {
        checkout_form: $('form.checkout, form#order_review'),
        is_paypal_selected: function() {
            return (
                $('.woocommerce-checkout').find('input[name="payment_method"]:checked').val() ===
                'dokan_paypal_marketplace'
            );
        },
        set_loading_on: function() {
            dokan_paypal_marketplace.checkout_form.addClass('processing').block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });
        },
        set_loading_done: function() {
            dokan_paypal_marketplace.checkout_form.removeClass('processing').unblock();
        },
        submit_error: function(errorMessage) {
            dokan_paypal_marketplace.set_loading_done();
            $('.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message').remove();
            dokan_paypal_marketplace.checkout_form.prepend(
                '<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout">' + errorMessage + '</div>'
            );

            dokan_paypal_marketplace.checkout_form.removeClass('processing');
            dokan_paypal_marketplace.checkout_form
                .find('.input-text, select, input:checkbox')
                .trigger('validate')
                .blur();

            dokan_paypal_marketplace.scroll_to_notice();
            $(document.body).trigger('checkout_error');
        },
        scroll_to_notice: function () {
            $('html, body').animate(
                {
                    scrollTop: $('form.checkout, form#order_review').offset().top - 100
                },
                1000
            );
        },
        set_order: function() {
            return $.ajax({
                type: 'POST',
                url: wc_checkout_params.checkout_url,
                data: dokan_paypal_marketplace.checkout_form.serialize(),
                dataType: 'json',
            }).done(function(result) {
                try {
                    if (result.result === 'success') {
                        return result.paypal_order_id;
                    } else if (result.result === 'failure') {
                        throw new Error('Result failure');
                    } else {
                        throw new Error('Invalid response');
                    }
                } catch (err) {
                    // Reload page
                    if (result.reload === true) {
                        window.location.reload();
                        return;
                    }
                    // Trigger update in case we need a fresh nonce
                    if (result.refresh === true) {
                        jQuery(document.body).trigger('update_checkout');
                    }
                    // Add new errors
                    if (result.messages) {
                        dokan_paypal_marketplace.submit_error(result.messages);
                    } else {
                        dokan_paypal_marketplace.submit_error('<div class="woocommerce-error">' + wc_checkout_params.i18n_checkout_error + '</div>');
                    }
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                dokan_paypal_marketplace.submit_error('<div class="woocommerce-error">' + errorThrown + '</div>');
            });
        },
        do_submit: function() {
            dokan_paypal_marketplace.set_loading_on();

            return dokan_paypal_marketplace.set_order();
        },
        init_paypal: function () {
            var order_redirect_url;
            window.paypal.Buttons({
                createOrder: function(data, actions) {
                    if ( dokan_paypal_marketplace.is_paypal_selected() ) {
                        let submit = dokan_paypal_marketplace.do_submit();

                        return submit.then(res => {
                            dokan_paypal_marketplace.set_loading_done();
                            order_redirect_url = res.success_redirect;
                            return res.paypal_order_id;
                        });
                    }
                    return false;
                },
                onApprove: function(data, actions) {
                    window.location.href = order_redirect_url;
                },
                onCancel: function() {
                    window.location.href = order_redirect_url;
                },
                onError: function (err) {
                    window.location.href = order_redirect_url;
                }
            }).render('#paypal-button-container');

            if (window.paypal.HostedFields.isEligible()) {
                window.paypal.HostedFields.render({
                    createOrder: function () {
                        if ( dokan_paypal_marketplace.is_paypal_selected() ) {
                            let submit = dokan_paypal_marketplace.do_submit();

                            return submit.then(res => {
                                dokan_paypal_marketplace.set_loading_done();
                                order_redirect_url = res.success_redirect;
                                console.log(res.paypal_order_id);
                                return res.paypal_order_id;
                            });
                        }
                        return false;
                    },
                    styles: {
                        'input': {
                            'font-size': '17px',
                            'font-family': 'helvetica, tahoma, calibri, sans-serif',
                            'color': '#3a3a3a'
                        },
                        ':focus': {
                            'color': 'black'
                        }
                    },
                    fields: {
                        number: {
                            selector: '#dpm_card_number',
                            placeholder: 'card number',
                            prefill: "4493573935388639"
                        },
                        cvv: {
                            selector: '#dpm_cvv',
                            placeholder: 'card security number',
                            prefill:'742'
                        },
                        expirationDate: {
                            selector: '#dpm_card_expiry',
                            placeholder: 'mm/yy',
                            prefill:'11/22'
                        }
                    }
                }).then(function (hf) {
                    $('#pay_unbranded_order').on('click', function (e) {
                        e.preventDefault();

                        hf.submit({
                            cardholderName: document.getElementById('dpm_name_on_card').value,
                            billingAddress: {
                                streetAddress: document.getElementById('dpm_billing_address').value,
                                extendedAddress: document.getElementById('dpm_card_billing_address_unit').value,
                                region: document.getElementById('dpm_card_billing_address_state').value,
                                locality: document.getElementById('dpm_card_billing_address_city').value,
                                postalCode: document.getElementById('dpm_card_billing_address_post_code').value,
                                countryCodeAlpha2: document.getElementById('dpm_card_billing_address_country').value
                            }
                        }).then(function (res) {
                            console.log('res', res);
//                            window.location.replace('http://www.somesite.com/review');
                        }).catch(function (err) {
                            console.log('error: ', JSON.stringify(err));
                        });
                    });
                });
            }
        }
    };

    setTimeout(() => {
        console.log('paypal init');
        dokan_paypal_marketplace.init_paypal();
    }, 5000);

})(jQuery, window, document);
