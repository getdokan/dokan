;(function($) {
    /**
     * Filter Reverse withdrawal transactions
     */
    const Dokan_Reverse_Withdrawal = {
        init : function () {
            // Set date range data.
            let localeData = {
                format      : dokan_get_daterange_picker_format(),
                ...dokan_helper.daterange_picker_local
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
        }
    };

    $(function(){
      // DOM Ready - Let's invoke the init method
      Dokan_Reverse_Withdrawal.init();
    });

})(jQuery);
