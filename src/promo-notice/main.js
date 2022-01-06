import App from './App.vue';
import $ from 'jquery';

const Vue = dokan_get_lib( 'Vue' );

if( $('#dokan-promo-notices').length ) {
    new Vue({
        el: '#dokan-promo-notices',
        render: h => h(App),
        created() {
            this.setLocaleData(dokan.i18n['dokan-lite'])
        }
    });
}
