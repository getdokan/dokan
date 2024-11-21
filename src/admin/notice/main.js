import App from './App.vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import $ from 'jquery';
import Vue from 'vue';

if ( $( '#dokan-admin-notices' ).length ) {
    new Vue( {
        el: '#dokan-admin-notices',
        render: ( h ) => h( App ),
    } );
}
