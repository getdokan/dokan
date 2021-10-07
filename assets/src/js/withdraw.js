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
                Dokan_Withdraw.handleWithdrawRequest( e )
            } );
        },
        openRequestWithdrawWindow: () => {
            let self = $(this),
                withdrawTemplate = wp.template( 'withdraw-request-popup' );

            $.magnificPopup.open({
                fixedContentPos: true,
                items: {
                    src: withdrawTemplate().trim(),
                    type: 'inline'
                },
                callbacks: {
                    open: () => Dokan_Withdraw.init(), // to initiate event listeners.
                }
            });
        },
        opensScheduleWindow: () => {
            let self = $(this),
                scheduleTemplate = wp.template( 'withdraw-schedule-popup' );

            $.magnificPopup.open({
                fixedContentPos: true,
                items: {
                    src: scheduleTemplate().trim(),
                    type: 'inline'
                },
                callbacks: {
                }
            });
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
                        paymentArea.unblock();
                        window.location.reload();
                    } else {
                        console.error( response.data );
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
                    nonce: nonce,
                    amount: amount
                },
                ( response ) => {
                    if ( response.success ) {
                        alert( response.data );
                        form.unblock();
                        window.location.reload();
                    } else {
                        alert( response.data );
                        form.unblock();
                    }
                }
            );
        }
    };

    $(document).ready(function() {
        Dokan_Withdraw.init();
    });
})(jQuery);
