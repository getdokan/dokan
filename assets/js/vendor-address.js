( function($, window) {
    const dokan_address_wrapper = $( '.dokan-address-fields' );
    const dokan_address_select = {
        init: function () {
            dokan_address_wrapper.on( 'change', 'select.country_to_state', this.state_select );
        },
        state_select: function () {
            let states_json = wc_country_select_params.countries.replace( /&quot;/g, '"' ),
                states = $.parseJSON( states_json ),
                $statebox = $( '#dokan_address_state' ),
                input_name = $statebox.attr( 'name' ),
                input_id = $statebox.attr( 'id' ),
                input_class = $statebox.attr( 'class' ),
                value = $statebox.val(),
                selected_state = $( '#dokan_selected_state' ).val(),
                input_selected_state = $( '#dokan_selected_state' ).val(),
                country = $( this ).val();

            if ( states[ country ] ) {
                if ( $.isEmptyObject( states[ country ] ) ) {

                    $( 'div#dokan-states-box' ).slideUp( 2 );
                    if ( $statebox.is( 'select' ) ) {
                        $( 'select#dokan_address_state' ).replaceWith( '<input type="text" class="' + input_class + '" name="' + input_name + '" id="' + input_id + '" required />' );
                    }

                    $( '#dokan_address_state' ).val( 'N/A' );

                } else {
                    input_selected_state = '';

                    let options = '',
                        state = states[ country ],
                        selected_value = '';

                    for ( let index in state ) {
                        if ( state.hasOwnProperty( index ) ) {
                            if ( selected_state ) {
                                if ( selected_state == index ) {
                                    selected_value = 'selected="selected"';
                                } else {
                                    selected_value = '';
                                }
                            }
                            options = options + '<option value="' + index + '"' + selected_value + '>' + state[ index ] + '</option>';
                        }
                    }

                    if ( $statebox.is( 'select' ) ) {
                        $( 'select#dokan_address_state' ).html( '<option value="">' + wc_country_select_params.i18n_select_state_text + '</option>' + options );
                    }
                    if ( $statebox.is( 'input' ) ) {
                        $( 'input#dokan_address_state' ).replaceWith( '<select type="text" class="' + input_class + '" name="' + input_name + '" id="' + input_id + '" required ></select>' );
                        $( 'select#dokan_address_state' ).html( '<option value="">' + wc_country_select_params.i18n_select_state_text + '</option>' + options );
                    }
                    $( '#dokan_address_state' ).removeClass( 'dokan-hide' );
                    $( 'div#dokan-states-box' ).slideDown();

                }
            } else {
                if ( $statebox.is( 'select' ) ) {
                    input_selected_state = '';
                    $( 'select#dokan_address_state' ).replaceWith( '<input type="text" class="' + input_class + '" name="' + input_name + '" id="' + input_id + '" required="required"/>' );
                }
                $( '#dokan_address_state' ).val(input_selected_state);

                if ( $( '#dokan_address_state' ).val() == 'N/A' ){
                    $( '#dokan_address_state' ).val('');
                }
                $( '#dokan_address_state' ).removeClass( 'dokan-hide' );
                $( 'div#dokan-states-box' ).slideDown();
            }

            $( document.body ).trigger( 'dokan_vendor_country_to_state_changing', [country] );
        }
    }
    window.dokan_address_select = dokan_address_select;
    window.dokan_address_select.init();

    $( document.body )
		.on( 'dokan_vendor_country_to_state_changing', function( event, country ) {
            // wc_address_i18n_params is required to continue, ensure the object exists
            if ( typeof wc_address_i18n_params === 'undefined' ) {
                return false;
            }

            var locale_json = wc_address_i18n_params.locale.replace( /&quot;/g, '"' ), locale = JSON.parse( locale_json ),thislocale;

			if ( typeof locale[ country ] !== 'undefined' ) {
				thislocale = locale[ country ];
			} else {
				thislocale = locale['default'];
			}

            let required = thislocale?.state?.required || undefined === thislocale?.state?.required;

            if (thislocale?.state?.label) {
                let labelElement = `${thislocale?.state?.label} ${required ? '<span class="required"> *</span>' : ''}`;

                $('.dokan-address-fields #dokan-states-box label').html(labelElement);
                $('.dokan-address-fields #dokan-states-box #dokan_address_state').attr('data-state', thislocale?.state?.label);
            }


            $('.dokan-address-fields #dokan-states-box #dokan_address_state').attr('required', required);
        })

} )(jQuery, window)