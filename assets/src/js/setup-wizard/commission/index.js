import AdminCommission from './AdminCommission.vue';

const Vue = dokan_get_lib('Vue');

document.addEventListener("DOMContentLoaded", function() {
    let element = document.getElementById( 'dokan-setup-wizard-commission-wrapper' );

    if ( ! element ) {
        return;
    }

    new Vue({
        el: '#dokan-setup-wizard-commission-wrapper',
        render: h => h(AdminCommission),
    });
});
