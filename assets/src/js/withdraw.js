;(($) => {
    const Dokan_Withdraw = {
        init: () => {
            $('#dokan-request-withdraw-button').on( 'click', (e) => {
                e.preventDefault();
                Dokan_Withdraw.openRequestWithdrawWindow();
            } );

            $('.dokan-withdraw-make-default-button').on( 'click', (e) => {
                e.preventDefault();
                Dokan_Withdraw.makeDefault( e );
            } );

            $('#dokan-withdraw-display-schedule-popup').on( 'click', (e) => {
                Dokan_Withdraw.opensScheduleWindow( e );
            } );

            $('#dokan-withdraw-schedule-request-submit').on( 'click', (e) => {
                Dokan_Withdraw.handleScheduleChangeRequest( e );
            } );

            $("input[name='withdraw-schedule']").on( 'change', (e) => {
                Dokan_Withdraw.handleScheduleChange( e );
            });

            Dokan_Withdraw.initModal();
        },

        withdrawTemplate: '',
        withdrawModal: '',

        loadModalTemplate: function() {
            if ( ! Dokan_Withdraw.withdrawTemplate && $('#tmpl-withdraw-request-popup').length ) {
              const template = window.wp.template( 'withdraw-request-popup' );
              Dokan_Withdraw.withdrawTemplate = template();
            }
        },

        initModal: function() {
            Dokan_Withdraw.loadModalTemplate();
             const modal = $( '#dokan-withdraw-request-popup' ).iziModal(
                 {
                     width       : 690,
                     overlayColor: 'rgba(0, 0, 0, 0.8)',
                     headerColor : dokan.modal_header_color,
                     onOpening   : function ( modal ) {
                        Dokan_Withdraw.calculateWithdrawCharges();
                     },
                 }
            );

            modal.iziModal( 'setContent', Dokan_Withdraw.withdrawTemplate );
            $( "[name='withdraw_method'][id='withdraw-method']" ).on( 'change', ( e ) => {
              Dokan_Withdraw.calculateWithdrawCharges();
            } );

            $( 'input#withdraw-amount' ).on( 'keyup', Dokan_Withdraw.debounce( Dokan_Withdraw.calculateWithdrawCharges, 500 ) );
            $('#dokan-withdraw-request-submit').on( 'click', (e) => {
                Dokan_Withdraw.handleWithdrawRequest( e );
            } );

            Dokan_Withdraw.withdrawModal = modal;
        },

        debounce( func, wait, immediate ) {
            var timeout;
            return function () {
                var context = this,
                    args = arguments;
                var later = function () {
                    timeout = null;
                    if ( ! immediate ) func.apply( context, args );
                };
                var callNow = immediate && ! timeout;
                clearTimeout( timeout );
                timeout = setTimeout( later, wait );
                if ( callNow ) func.apply( context, args );
            };
        },
        openRequestWithdrawWindow: () => {
          Dokan_Withdraw.withdrawModal.iziModal( 'open' );
        },
        opensScheduleWindow: () => {
            const scheduleTemplate = wp.template( 'withdraw-schedule-popup' ),
                modal = $( '#dokan-withdraw-schedule-popup' ).iziModal( {
                    width       : 690,
                    overlayColor: 'rgba(0, 0, 0, 0.8)',
                    headerColor : dokan.modal_header_color,
                } );

            modal.iziModal( 'setContent', scheduleTemplate().trim() );
            modal.iziModal( 'open' );

            Dokan_Withdraw.init();
        },
        makeDefault: ( e ) => {
            const button      = $( e.target );
            const paymentArea = $( '#dokan-withdraw-payment-method-list' );

            paymentArea.block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });

            $.post(
                dokan.ajaxurl,
                {
                    action: 'dokan_withdraw_handle_make_default_method',
                    nonce: paymentArea.data( 'security' ),
                    method: button.data( 'method' ),
                },
                ( response ) => {
                    if ( response.success ) {
                        dokan_sweetalert( response.data, {
                            position: 'bottom-end',
                            toast: true,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        } );
                        paymentArea.unblock();
                        window.location.reload();
                    } else {
                        dokan_sweetalert( response.data, {
                            position: 'bottom-end',
                            toast: true,
                            icon: 'error',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        } );
                        paymentArea.unblock();
                    }
                }
            );
        },
        handleWithdrawRequest: ( e ) => {
            e.preventDefault();
            const amount = $( 'input#withdraw-amount').val();
            const nonce  = $( 'input#dokan_withdraw_nonce').val();
            const form   = $( '#withdraw-request-popup' );
            const method = $( '#withdraw-method' ).val();

            form.block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });

            $.post(
                dokan.ajaxurl,
                {
                    action: 'dokan_handle_withdraw_request',
                    _handle_withdraw_request: nonce,
                    amount: amount,
                    method: method,
                },
                async ( response ) => {
                    if ( response.success ) {
                        await dokan_sweetalert( response.data, {
                            position: 'bottom-end',
                            toast: true,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              setTimeout( function() {
                                form.unblock();
                                window.location.reload();
                              }, 2000);
                            }
                        } );
                    } else {
                        dokan_sweetalert( '', {
                            icon: 'error',
                            html: response.data,
                        } );
                        form.unblock();
                    }
                }
            );
        },
        handleScheduleChangeRequest: ( e ) => {
            e.preventDefault();
            const schedule = $( "input[name='withdraw-schedule']:checked").val();
            const nonce    = $( '#dokan-withdraw-schedule-request-submit').data('security');
            const form     = $( '#withdraw-schedule-popup' );
            const reserve  = $( '#withdraw-remaining-amount' ).val();
            const minimum  = $( '#minimum-withdraw-amount' ).val();
            const method   = $( '#preferred-payment-method' ).val();

            form.block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });

            $.post(
                dokan.ajaxurl,
                {
                    action: 'dokan_handle_withdraw_schedule_change_request',
                    nonce: nonce,
                    schedule: schedule,
                    reserve: reserve,
                    minimum: minimum,
                    method: method,
                },
                ( response ) => {
                    if ( response.success ) {
                        dokan_sweetalert( response.data, {
                            position: 'bottom-end',
                            toast: true,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        } );
                        form.unblock();
                        window.location.reload();
                    } else {
                        dokan_sweetalert( '', {
                            icon: 'error',
                            html: response.data,
                        } );
                        form.unblock();
                    }
                }
            );
        },
        handleScheduleChange: (e) => {
            const nextDate = $(e.target).data('next-schedule');
            $( '#dokan-withdraw-next-scheduled-date').html(nextDate);
        },
        calculateWithdrawCharges: () => {
            let charges = $( "select[name='withdraw_method'][id='withdraw-method'] option:selected" ).data();
            if (
                $( '#dokan-send-withdraw-request-popup-form > .dokan-alert-danger' ).length
                || ! charges
            ) {
                return;
            }

            let withdrawMethod = $( "[name='withdraw_method'][id='withdraw-method']" ).val();
            let withdrawAmount = $( "[name='withdraw_amount'][id='withdraw-amount']" ).val();

            let { chargePercentage, chargeFixed } = $(
                "select[name='withdraw_method'][id='withdraw-method'] option:selected"
            ).data();

            withdrawAmount = accounting.unformat(
                withdrawAmount,
                dokan.mon_decimal_point
            );

            chargeFixed = accounting.unformat(
                chargeFixed,
                dokan.mon_decimal_point
            );

            let chargeAmount = 0;
            let chargeText = '';

            if ( chargeFixed ) {
                chargeText += chargeFixed;
                chargeAmount += chargeFixed;
            }

            if ( chargePercentage ) {
                let percentageAmount = chargePercentage / 100 * withdrawAmount;
                chargeAmount += percentageAmount;
                chargeText += chargeText ? ' + ' : '';
                chargeText += parseFloat( accounting.formatNumber( chargePercentage, dokan.rounding_precision, '' ) )
                    .toString()
                    .replace('.', dokan.mon_decimal_point ) + '%';
                chargeText += ` = ${ Dokan_Withdraw.formatMoney( chargeAmount ) }`;
            }

            if ( ! chargeText ) {
              chargeText = Dokan_Withdraw.formatMoney( chargeAmount, dokan.currency );
            }

            Dokan_Withdraw.showWithdrawChargeHtml( chargeText, chargeAmount, withdrawAmount );
        },

        formatMoney( money ) {
            return accounting.formatMoney( money, {
                symbol:    dokan.currency_format_symbol,
                decimal:   dokan.currency_format_decimal_sep,
                thousand:  dokan.currency_format_thousand_sep,
                precision: dokan.currency_format_num_decimals,
                format:    dokan.currency_format
            } )
        },

        showWithdrawChargeHtml(chargeText, chargeAmount, withdrawAmount) {
            let chargeSection    = $('#dokan-withdraw-charge-section');
            let revivableSection = $('#dokan-withdraw-revivable-section');

            $('#dokan-withdraw-charge-section-text').html(Dokan_Withdraw.formatMoney(chargeText));
            $('#dokan-withdraw-revivable-section-text').html(Dokan_Withdraw.formatMoney(withdrawAmount - chargeAmount));

            chargeSection.show();
            revivableSection.show();
        }
    };

    $(document).ready(function() {
        Dokan_Withdraw.init();
    });
})(jQuery);
