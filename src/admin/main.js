import App from './App.vue';
import router from './router';
import menuFix from './utils/admin-menu-fix';

/* eslint-disable no-new */
const Vue = dokan_get_lib( 'Vue' );

new Vue( {
    el: '#dokan-vue-admin',
    router,
    render: ( h ) => h( App ),
    methods: {
        listTableTexts() {
            return {
                loading: this.__( 'Loading', 'dokan-lite' ),
                select_bulk_action: this.__(
                    'Select bulk action',
                    'dokan-lite'
                ),
                bulk_actions: this.__( 'Bulk Actions', 'dokan-lite' ),
                items: this.__( 'items', 'dokan-lite' ),
                apply: this.__( 'Apply', 'dokan-lite' ),
            };
        },
    },
} );

// fix the admin menu for the slug "vue-app"
menuFix( 'dokan' );
