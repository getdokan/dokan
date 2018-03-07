import Vue from 'vue'
import Router from 'vue-router'
import Notifications from 'vue-notification'
import ListTable from 'vue-wp-list-table';
import API_Helper from '@/utils/Api'

Vue.use(Notifications)

window.dokan.api = new API_Helper();
window.dokan.libs['Vue'] = Vue;
window.dokan.libs['Router'] = Router;
window.dokan.libs['ListTable'] = ListTable;

window.dokan_get_lib = function(lib) {
    return window.dokan.libs[lib];
}

window.dokan_add_route = function(component) {
    window.dokan.routeComponents[component.name] = component;
}
