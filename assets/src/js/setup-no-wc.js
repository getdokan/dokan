jQuery( document ).ready( function ( $ ) {
    'use strict';

    $( '#dokan-admin-setup-wizard' ).on( 'submit', function ( e ) {
        $( '.wc-setup-content' ).block( {
            message: null,
            overlayCSS: {
                background: '#fff',
                opacity: 0.6
            },
        } );
    } )
} );
