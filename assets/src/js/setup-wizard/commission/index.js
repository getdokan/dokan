import AdminCommission from './AdminCommission.vue'

const Vue = dokan_get_lib('Vue');
import './style.css';

jQuery( document ).ready(function() {
    if ( ! jQuery('#dokan-setup-wizard-commission-wrapper').length ) {
        return;
    }

    new Vue({
        el: '#dokan-setup-wizard-commission-wrapper',
        render: h => h(AdminCommission),

        created() {
            // if ( dokan.dokan_pro_i18n ) {
            //     this.setLocaleData( dokan.dokan_pro_i18n['dokan'] );
            // }
        }
    });
});

