;(function($) {
    var DokanDateRangePicker = {
        init : function () {
            // Set date range data.
            let localeData = {
                format      : dokan_get_daterange_picker_format(),
                ...dokan_helper.daterange_picker_local
            };

            // Date range picker handler.
            $(".dokan-daterangepicker").daterangepicker({
                autoUpdateInput : false,
                showDropdowns   : true,
                locale          : localeData,
            });

            // Set the value for date range field to show frontend.
            $( '.dokan-daterangepicker' ).on( 'apply.daterangepicker', function( ev, picker ) {
                $( this ).val( picker.startDate.format( localeData.format ) + ' - ' + picker.endDate.format( localeData.format ) );
                $(this).siblings('input.dokan-daterangepicker-start-date').val(picker.startDate.format( 'YYYY-MM-DD' ));
                $(this).siblings('input.dokan-daterangepicker-end-date').val(picker.endDate.format( 'YYYY-MM-DD' ));
            });

            // Date range picker clear button handler
            $('.dokan-daterangepicker').on('cancel.daterangepicker', function(ev, picker) {
                // Clear date range input fields value on clicking clear button
                if ( ! $(this).data('clear') ) {
                    return;
                }

                $(this).val('');
                $(this).siblings('input.dokan-daterangepicker-start-date').val('');
                $(this).siblings('input.dokan-daterangepicker-end-date').val('');
            });
        },
    }

    // Let's invoke the init method
    DokanDateRangePicker.init();

})(jQuery);
