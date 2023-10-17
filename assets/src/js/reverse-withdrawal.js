;(function($, document, window) {
    /**
     * Filter Reverse withdrawal transactions
     */
    const Dokan_Reverse_Withdrawal = {
        init() {
            $('.reverse-balance-section').on('click', '#reverse_pay', Dokan_Reverse_Withdrawal.add_to_cart);
        },

        add_to_cart() {
            let th = $(this);
            let payment_el = $('#reverse_pay_balance');

            Dokan_Reverse_Withdrawal.disableProps();

            let data = {
                price: payment_el.val(),
                _reverse_withdrawal_nonce: dokan.reverse_withdrawal.nonce
            };

            // call ajax
            wp.ajax.post( 'dokan_reverse_withdrawal_payment_to_cart', data ).then( async ( response ) => {
                let alert_data = {
                    action: 'confirm',
                    title: dokan.reverse_withdrawal.on_success_title,
                    icon: 'success',
                    showCloseButton: false,
                    showCancelButton: false,
                    focusConfirm: true,
                };
                await dokan_sweetalert( response.message, alert_data ).then( () => {
                    window.location.replace( dokan.reverse_withdrawal.checkout_url );
                });
            }).fail( ( jqXHR ) => {
                  Dokan_Reverse_Withdrawal.disableProps(false);
                  let error_message = dokan_handle_ajax_error( jqXHR );
                  if ( error_message ) {
                    dokan_sweetalert( error_message, { 'action': 'error', 'title': dokan.reverse_withdrawal.on_error_title, 'icon': 'error' } );
                  }
            });
        },

        disableProps( args = true ) {
            $('#reverse_pay_balance').prop('disabled', args);
            $('#reverse_pay').prop('disabled', args);
        },
    };

    $(function(){
      // DOM Ready - Let's invoke the init method
      Dokan_Reverse_Withdrawal.init();
    });

})(jQuery, document, window);
