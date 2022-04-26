(function($){
    $(document).ready(function(){
        $('.dokan-my-order-select2').select2();

        let localeData = {
            format : dokan_get_daterange_picker_format(),
            ...dokan_daterange_i18n.locale
        };

        const my_order_date_range = $('#my_order_date_range');
        my_order_date_range.daterangepicker({
            autoUpdateInput: false,
            locale         : localeData,
        });

        my_order_date_range.on( 'apply.daterangepicker', function( ev, picker ) {
            $( this ).val( picker.startDate.format( localeData.format ) + ' - ' + picker.endDate.format( localeData.format ) );

            $('input[name="start_date"]').val(picker.startDate.format('YYYY-MM-DD'));
            $('input[name="end_date"]').val(picker.endDate.format('YYYY-MM-DD'));
        });

        my_order_date_range.on( 'cancel.daterangepicker', function() {
            $( this ).val('');

            $('input[name="start_date"]').val('');
            $('input[name="end_date"]').val('');
        });

        $('a#dokan-my-order-filter-reset').click(function (){
            window.location = window.location.href.split('?')[0];
        });

        $("div.entry-content > table").on('click', 'thead th.order-number', function () {
            const head      = $(this);
            const content   = head.find('span');
            const sortOrder = $('#dokan-my-orders-filter input[name="sort_order"]');
            const url       = new URL(window.location.href);

            if (sortOrder.val() === 'DESC') {
                sortOrder.val('ASC');
            } else {
                sortOrder.val('DESC');
            }

            url.searchParams.set('sort_order', sortOrder.val());

            $("div.entry-content > table").block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });

            $('div.entry-content > div > ul.pagination').load(url.toString() + ' div.entry-content > div > ul.pagination');
            $('div.entry-content > table > tbody').load(url.toString() + ' div.entry-content > table > tbody > tr', null, function () {
                content.toggleClass('rotated');
                window.history.pushState(null, null, url.toString());
                $("div.entry-content > table").unblock();
            });
        });
    });
})(jQuery);
