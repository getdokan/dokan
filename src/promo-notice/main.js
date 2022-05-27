import App from './App.vue';
import $ from 'jquery';
import Vue from 'vue';

if( $('#dokan-promo-notices').length ) {
    new Vue({
        el: '#dokan-promo-notices',
        render: h => h(App),
    });
}
