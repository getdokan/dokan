jQuery( function( $ ) {
   
    setTimeout( init_wc_pointers, 800 );
    
    function init_wc_pointers() {
            $.each( Dokan_Pointers.pointers, function( i ) {
                    show_wc_pointer( i );
                    return false;
            });
    }

    function show_wc_pointer( id ) {
            var pointer = Dokan_Pointers.pointers[ id ];
            var options = $.extend( pointer.options, {
                    close: function() {
                            $.post( dokan_pointer_data.ajaxurl, {
                                screen : dokan_pointer_data.screen,
                                action: 'dokan-dismiss-wp-pointer'
                            } );
                    }
            } );
            var this_pointer = $( pointer.target ).pointer( options );

            this_pointer.pointer( 'open' );
            if ( 'next_button' in pointer ) {
                $( '.wp-pointer-buttons' ).append( pointer.next_button );
            }
           $( '.wp-pointer-buttons' ).find( 'a.close' ).addClass( 'dokan button button-secondary' );

            if ( pointer.next_trigger ) {
                    $( pointer.next_trigger.target ).on( pointer.next_trigger.event, function() {
                            setTimeout( function() { 
                                this_pointer.pointer( 'close' );
                                show_wc_pointer( pointer.next );
                            }, 200 );
                    });
            }
    }
});

