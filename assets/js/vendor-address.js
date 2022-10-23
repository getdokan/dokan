( function($){
    var dokan_address_wrapper = $( '.dokan-address-fields' );
    var dokan_address_select = {
        init: function () {
            dokan_address_wrapper.on( 'change', 'select.country_to_state', this.state_select );
        },
        state_select: function () {
            var states_json = wc_country_select_params.countries.replace( /&quot;/g, '"' ),
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

                    var options = '',
                        state = states[ country ];

                    for ( var index in state ) {
                        if ( state.hasOwnProperty( index ) ) {
                            if ( selected_state ) {
                                if ( selected_state == index ) {
                                    var selected_value = 'selected="selected"';
                                } else {
                                    var selected_value = '';
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
        }
    }

    dokan_address_select.init();

} )(jQuery)