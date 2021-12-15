/**
 * Admin helper functions
 *
 * @package WeDevs Framework
 */
jQuery(function($) {

    $('.tips').tooltip();

    // settings api - radio_image
    $('.dokan-settings-radio-image button').on('click', function (e) {
        e.preventDefault();

        var btn = $(this),
            template = btn.data('template'),
            input = btn.data('input'),
            container = btn.parents('.dokan-settings-radio-image-container');

        $('#' + input).val(template);

        container.find('.active').removeClass('active').addClass('not-active');

        btn.parents('.dokan-settings-radio-image').addClass('active').removeClass('not-active');
    });

    // Field validation error tips
    $( document.body )

        .on( 'wc_add_error_tip', function( e, element, error_type ) {
            var offset = element.position();

            if ( element.parent().find( '.wc_error_tip' ).length === 0 ) {
                element.after( '<div class="wc_error_tip ' + error_type + '">' + dokan[error_type] + '</div>' );
                element.parent().find( '.wc_error_tip' )
                    .css( 'left', offset.left + element.width() - ( element.width() / 2 ) - ( $( '.wc_error_tip' ).width() / 2 ) )
                    .css( 'top', offset.top + element.height() )
                    .fadeIn( '100' );
            }
        })

        .on( 'wc_remove_error_tip', function( e, element, error_type ) {
            element.parent().find( '.wc_error_tip.' + error_type ).fadeOut( '100', function() { $( this ).remove(); } );
        })

        .on( 'click', function() {
            $( '.wc_error_tip' ).fadeOut( '100', function() { $( this ).remove(); } );
        })

        .on( 'blur', '.wc_input_decimal[type=text], .wc_input_price[type=text], .wc_input_country_iso[type=text]', function() {
            $( '.wc_error_tip' ).fadeOut( '100', function() { $( this ).remove(); } );
        })

        .on(
            'change',
            '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc-order-totals #refund_amount[type=text]',
            function() {
                var regex, decimalRegex,
                    decimailPoint = dokan.decimal_point;

                if ( $( this ).is( '.wc_input_price' ) || $( this ).is( '#refund_amount' ) ) {
                    decimailPoint = dokan.mon_decimal_point;
                }

                regex        = new RegExp( '[^\-0-9\%\\' + decimailPoint + ']+', 'gi' );
                decimalRegex = new RegExp( '\\' + decimailPoint + '+', 'gi' );

                var value    = $( this ).val();
                var newvalue = value.replace( regex, '' ).replace( decimalRegex, decimailPoint );

                if ( value !== newvalue ) {
                    $( this ).val( newvalue );
                }
            }
        )

        .on(
            'keyup',
            // eslint-disable-next-line max-len
            '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc_input_country_iso[type=text], .wc-order-totals #refund_amount[type=text]',
            function() {
                var regex, error, decimalRegex;
                var checkDecimalNumbers = false;

                if ( $( this ).is( '.wc_input_price' ) || $( this ).is( '#refund_amount' ) ) {
                    checkDecimalNumbers = true;
                    regex = new RegExp( '[^\-0-9\%\\' + dokan.mon_decimal_point + ']+', 'gi' );
                    decimalRegex = new RegExp( '[^\\' + dokan.mon_decimal_point + ']', 'gi' );
                    error = 'i18n_mon_decimal_error';
                } else if ( $( this ).is( '.wc_input_country_iso' ) ) {
                    regex = new RegExp( '([^A-Z])+|(.){3,}', 'im' );
                    error = 'i18n_country_iso_error';
                } else {
                    checkDecimalNumbers = true;
                    regex = new RegExp( '[^\-0-9\%\\' + dokan.decimal_point + ']+', 'gi' );
                    decimalRegex = new RegExp( '[^\\' + dokan.decimal_point + ']', 'gi' );
                    error = 'i18n_decimal_error';
                }

                var value    = $( this ).val();
                var newvalue = value.replace( regex, '' );

                // Check if newvalue have more than one decimal point.
                if ( checkDecimalNumbers && 1 < newvalue.replace( decimalRegex, '' ).length ) {
                    newvalue = newvalue.replace( decimalRegex, '' );
                }

                if ( value !== newvalue ) {
                    $( document.body ).triggerHandler( 'wc_add_error_tip', [ $( this ), error ] );
                } else {
                    $( document.body ).triggerHandler( 'wc_remove_error_tip', [ $( this ), error ] );
                }
            }
        )

        .on( 'change', '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price]', function() {
            var sale_price_field = $( this ), regular_price_field;

            if ( sale_price_field.attr( 'name' ).indexOf( 'variable' ) !== -1 ) {
                regular_price_field = sale_price_field
                    .parents( '.variable_pricing' )
                    .find( '.wc_input_price[name^=variable_regular_price]' );
            } else {
                regular_price_field = $( '#_regular_price' );
            }

            var sale_price    = parseFloat(
                window.accounting.unformat( sale_price_field.val(), dokan.mon_decimal_point )
            );
            var regular_price = parseFloat(
                window.accounting.unformat( regular_price_field.val(), dokan.mon_decimal_point )
            );

            if ( sale_price >= regular_price ) {
                $( this ).val( '' );
            }
        })

        .on( 'keyup', '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price]', function() {
            var sale_price_field = $( this ), regular_price_field;

            if ( sale_price_field.attr( 'name' ).indexOf( 'variable' ) !== -1 ) {
                regular_price_field = sale_price_field
                    .parents( '.variable_pricing' )
                    .find( '.wc_input_price[name^=variable_regular_price]' );
            } else {
                regular_price_field = $( '#_regular_price' );
            }

            var sale_price    = parseFloat(
                window.accounting.unformat( sale_price_field.val(), dokan.mon_decimal_point )
            );
            var regular_price = parseFloat(
                window.accounting.unformat( regular_price_field.val(), dokan.mon_decimal_point )
            );

            if ( sale_price >= regular_price ) {
                $( document.body ).triggerHandler( 'wc_add_error_tip', [ $(this), 'i18n_sale_less_than_regular_error' ] );
            } else {
                $( document.body ).triggerHandler( 'wc_remove_error_tip', [ $(this), 'i18n_sale_less_than_regular_error' ] );
            }
        })

        .on( 'init_tooltips', function() {

            $( '.tips, .help_tip, .woocommerce-help-tip' ).tipTip( {
                'attribute': 'data-tip',
                'fadeIn': 50,
                'fadeOut': 50,
                'delay': 200
            } );

            $( '.column-wc_actions .wc-action-button' ).tipTip( {
                'fadeIn': 50,
                'fadeOut': 50,
                'delay': 200
            } );

            // Add tiptip to parent element for widefat tables
            $( '.parent-tips' ).each( function() {
                $( this ).closest( 'a, th' ).attr( 'data-tip', $( this ).data( 'tip' ) ).tipTip( {
                    'attribute': 'data-tip',
                    'fadeIn': 50,
                    'fadeOut': 50,
                    'delay': 200
                } ).css( 'cursor', 'help' );
            });
        });

});

