import App from './App.vue';
import $ from 'jquery';

const Vue = dokan_get_lib( 'Vue' );

if( $('#dokan-admin-notices').length ) {
    new Vue({
        el: '#dokan-admin-notices',
        render: h => h(App),
        created() {
            this.setLocaleData(dokan.i18n['dokan-lite'])
        }
    });
}
