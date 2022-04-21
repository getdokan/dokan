;(function($, document, window) {
    /**
     * Filter Reverse withdrawal transactions
     */
    const Dokan_Reverse_Withdrawal = {
        init() {
            this.init_datepicker();
            $('.reverse-balance-section').on('click', '#reverse_pay', Dokan_Reverse_Withdrawal.add_to_cart);
        },

        init_datepicker() {
            // Set date range data.
            let localeData = {
                format : dokan_get_daterange_picker_format(),
                ...dokan_helper.daterange_picker_local,
            };

            // date range picker handler.
            $("#trn_date_filter").daterangepicker({
                autoUpdateInput : false,
                locale          : localeData,
            }, function(start, end, label) {
                // Set the value for date range field to show frontend.
                $( '#trn_date_filter' ).on( 'apply.daterangepicker', function( ev, picker ) {
                    $( this ).val( picker.startDate.format( localeData.format ) + ' - ' + picker.endDate.format( localeData.format ) );
                });

                // Set the value for date range fields to send backend
                $("#trn_date_form_filter_alt").val(start.format('YYYY-MM-DD'));
                $("#trn_date_to_filter_alt").val(end.format('YYYY-MM-DD'));
            });

            // date range picker clear button handler
            $('#trn_date_filter').on('cancel.daterangepicker', function(ev, picker) {
                // Clear date range input fields value on clicking clear button
                $(this).val('');
                $("#trn_date_form_filter_alt").val('');
                $("#trn_date_to_filter_alt").val('');
            });
        },

        add_to_cart() {
            let th = $(this);
            let payment_el = $('#reverse_pay_balance');

            Dokan_Reverse_Withdrawal.disableProps();

            dokan_sweetalert( dokan.reverse_withdrawal.reverse_pay_msg, {
                action  : 'confirm',
                icon    : 'warning',
            }).then( ( res ) => {
                if ( ! res.isConfirmed ) {
                  Dokan_Reverse_Withdrawal.disableProps(false);
                    return;
                }

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
