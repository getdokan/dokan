import App from './App.vue';

const Vue = dokan_get_lib( 'Vue' );

new Vue( {
    el: '#dokan-admin-notices',
    render: h => h(App),
    created() {
        this.setLocaleData( dokan.i18n['dokan-lite'] )
    }
} );
