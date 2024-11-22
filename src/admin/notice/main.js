import App from './App.vue';
const { jQuery: $ } = window;
import Vue from 'vue';

if ( $( '#dokan-admin-notices' ).length ) {
    new Vue( {
        el: '#dokan-admin-notices',
        render: ( h ) => h( App ),
    } );
}
