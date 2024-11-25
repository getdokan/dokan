import Vue from 'vue';
import App from './App.vue';
import Mixin from '../../utils/Mixin';

const { jQuery: $ } = window;

if ( $( '#dokan-admin-notices' ).length ) {
    Vue.mixin( Mixin );

    new Vue( {
        el: '#dokan-admin-notices',
        render: ( h ) => h( App ),
    } );
}
