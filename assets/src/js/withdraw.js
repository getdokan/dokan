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

            $('#dokan-withdraw-request-submit').on( 'click', (e) => {
                Dokan_Withdraw.handleWithdrawRequest( e );
            } );

            $('#dokan-withdraw-display-schedule-popup').on( 'click', (e) => {
                Dokan_Withdraw.opensScheduleWindow( e );
            } );

            $('#dokan-withdraw-schedule-request-submit').on( 'click', ( e ) => {
                Dokan_Withdraw.handleScheduleChangeRequest( e );
            } );

            $("input[name='withdraw-schedule']").on( 'change', (e) => {
                Dokan_Withdraw.handleScheduleChange( e );
            });

            $( "[name='withdraw_method'][id='withdraw-method']" ).on( 'change', ( e ) => {
                Dokan_Withdraw.calculateWithdrawCharges();
            } );

            $( 'input#withdraw-amount' ).on( 'keyup', Dokan_Withdraw.debounce( Dokan_Withdraw.calculateWithdrawCharges, 500 ) );
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
            const withdrawTemplate = wp.template( 'withdraw-request-popup' ),
                modal = $( '#dokan-withdraw-request-popup' ).iziModal( {
                    width       : 690,
                    overlayColor: 'rgba(0, 0, 0, 0.8)',
                    headerColor : dokan.modal_header_color,
                    onOpening   : function ( modal ) {
                        Dokan_Withdraw.calculateWithdrawCharges();
                    },
                } );

            modal.iziModal( 'setContent', withdrawTemplate().trim() );
            modal.iziModal( 'open' );

            Dokan_Withdraw.init();
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
            const amount = $( 'input#withdraw-amount' ).val();
            const nonce  = $( 'input#dokan_withdraw_nonce' ).val();
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
                            didOpen: ( toast ) => {
                                setTimeout( function () {
                                    form.unblock();
                                    window.location.reload();
                                }, 2000 );
                            },
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
            const schedule = $(
                "input[name='withdraw-schedule']:checked"
            ).val();
            const nonce = $( '#dokan-withdraw-schedule-request-submit' ).data(
                'security'
            );
            const form = $( '#withdraw-schedule-popup' );
            const reserve = $( '#withdraw-remaining-amount' ).val();
            const minimum = $( '#minimum-withdraw-amount' ).val();
            const method = $( '#preferred-payment-method' ).val();

            form.block( {
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6,
                },
            } );

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
        handleScheduleChange: ( e ) => {
            const nextDate = $( e.target ).data( 'next-schedule' );
            $( '#dokan-withdraw-next-scheduled-date' ).html( nextDate );
        },
        calculateWithdrawCharges: () => {
            if (
                $(
                    '#dokan-send-withdraw-request-popup-form > .dokan-alert-danger'
                ).length
            ) {
                return;
            }

            let withdrawMethod = $(
                "[name='withdraw_method'][id='withdraw-method']"
            ).val();
            let withdrawAmount = $(
                "[name='withdraw_amount'][id='withdraw-amount']"
            ).val();
            withdrawAmount = accounting.unformat(
                withdrawAmount,
                dokan_refund.mon_decimal_point
            );
            let { chargePercentage, chargeFixed } = $(
                "select[name='withdraw_method'][id='withdraw-method'] option:selected"
            ).data();
            let chargeAmount = 0;
            let nonce = $( '#dokan_withdraw_charge_nonce' ).val();

            $.post(
                dokan.ajaxurl,
                {
                    action: 'dokan_handle_get_withdraw_method_charge',
                    dokan_withdraw_charge_nonce: nonce,
                    method: withdrawMethod,
                    amount: withdrawAmount,
                },
                ( response ) => {
                    let data = response.data ? response.data : {};
                    Dokan_Withdraw.showWithdrawChargeHtml( data );

                    $( '#dokan-withdraw-request-submit' ).attr(
                        'disabled',
                        ! response.success
                    );
                }
            );
        },

        showWithdrawChargeHtml( chargeData ) {
            let chargeSection = $( '#dokan-withdraw-charge-section' );
            let revivableSection = $( '#dokan-withdraw-revivable-section' );

            if ( ! chargeData.plain || ! chargeData.plain.charge ) {
                chargeSection.hide();
                revivableSection.hide();

                return;
            }

            let chargeText = '';

            if (
                chargeData.plain.charge_data &&
                chargeData.plain.charge_data.fixed
            ) {
                chargeText += `${ chargeData.html.charge_data.fixed }`;
            }

            if (
                chargeData.plain.charge_data &&
                chargeData.plain.charge_data.percentage
            ) {
                chargeText += chargeText ? ' + ' : '';
                chargeText += `${ chargeData.html.charge_data.percentage }`;
                chargeText += ` = ${ chargeData.html.charge }`;
            }

            $( '#dokan-withdraw-charge-section-text' ).html( chargeText );

            $( '#dokan-withdraw-revivable-section-text' ).html(
                chargeData.plain.receivable ? chargeData.html.receivable : ''
            );

            chargeSection.show();
            revivableSection.show();
        },
    };

    $( document ).ready( function () {
        Dokan_Withdraw.init();
    } );
})(jQuery);
