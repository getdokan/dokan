import Vue from 'vue'
import Router from 'vue-router'
import Moment from 'moment'
import Notifications from 'vue-notification'
import ListTable from 'vue-wp-list-table';
import Multiselect from 'vue-multiselect'
import API_Helper from '@dokan/utils/Api'
import ChartJS from 'vue-chartjs'
import Mixin from './Mixin'
import Debounce from 'debounce'
import VersionCompare from '@dokan/utils/VersionCompare'
import { parse } from 'papaparse'

window.__ = function( text, domain ) {
  return __( text, domain );
}

import {
  VclCode,
  VclList,
  VclTwitch,
  VclFacebook,
  VclInstagram,
  VclBulletList,
  VueContentLoading,
} from 'vue-content-loading';

// core components
import Postbox from "admin/components/Postbox.vue"
import Loading from "admin/components/Loading.vue"
import Chart from "admin/components/Chart.vue"
import Modal from "admin/components/Modal.vue"
import Switches from "admin/components/Switches.vue"
import TextEditor from "admin/components/TextEditor.vue"
import Currency from "admin/components/Currency.vue"
import LazyInput from "admin/components/LazyInput.vue"
import Progressbar from "admin/components/Progressbar.vue"
import Search from "admin/components/Search.vue"
import Datepicker from "admin/components/Datepicker.vue";
import DateRangePicker from 'vue2-daterange-picker';
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';
import ColorPicker from "admin/components/ColorPicker.vue"
import GoogleMaps from "admin/components/GoogleMaps.vue"
import Mapbox from "admin/components/Mapbox.vue"
import UploadImage from "admin/components/UploadImage.vue"
import PasswordGenerator from "admin/components/PasswordGenerator.vue"
import RefreshSettingOptions from "admin/components/RefreshSettingOptions.vue"
import VendorAccountFields from "admin/pages/VendorAccountFields.vue";
import VendorAddressFields from "admin/pages/VendorAddressFields.vue";
import VendorSocialFields from "admin/pages/VendorSocialFields.vue";
import VendorPaymentFields from "admin/pages/VendorPaymentFields.vue";
import AdminNotice from "../admin/components/AdminNotice.vue";
import CardFunFact from "../admin/components/CardFunFact.vue";
import CombineInput  from 'admin/components/CombineInput.vue';
import CategoryBasedCommission from "admin/components/Commission/CategoryBasedCommission.vue";
import StoreCategory from 'admin/components/StoreCategory.vue';

import "vue-multiselect/dist/vue-multiselect.min.css"
import Vuedraggable from "vuedraggable/src/vuedraggable";

Vue.use(Notifications)

Vue.mixin( Mixin );

Vue.filter('currency', function (value) {
    return accounting.formatMoney(value, dokan.currency);
})

Vue.filter('capitalize', function (value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
})

// Tooltip directive
Vue.directive('tooltip', {
    bind: function( el, binding, vnode ) {
        jQuery(el).tooltip('show');
    },
    unbind: function( el, binding, vnode ) {
        jQuery(el).tooltip('destroy');
    }
});

window.dokan_get_lib = function(lib) {
    return window.dokan.libs[lib];
}

window.dokan_add_route = function(component) {
    window.dokan.routeComponents[component.name] = component;
}

// setup global Dokan libraries
window.dokan.api                         = new API_Helper();
window.dokan.libs['Vue']                 = Vue;
window.dokan.libs['Router']              = Router;
window.dokan.libs['moment']              = Moment;
window.dokan.libs['ListTable']           = ListTable;
window.dokan.libs['Currency']            = Currency;
window.dokan.libs['Postbox']             = Postbox;
window.dokan.libs['Loading']             = Loading;
window.dokan.libs['ChartJS']             = ChartJS;
window.dokan.libs['Chart']               = Chart;
window.dokan.libs['Modal']               = Modal;
window.dokan.libs['Switches']            = Switches;
window.dokan.libs['TextEditor']          = TextEditor;
window.dokan.libs['LazyInput']           = LazyInput;
window.dokan.libs['Progressbar']         = Progressbar;
window.dokan.libs['Search']              = Search;
window.dokan.libs['Datepicker']          = Datepicker;
window.dokan.libs['DateRangePicker']     = DateRangePicker;
window.dokan.libs['Multiselect']         = Multiselect;
window.dokan.libs['ColorPicker']         = ColorPicker;
window.dokan.libs['debounce']            = Debounce;
window.dokan.libs['VersionCompare']      = VersionCompare;
window.dokan.libs['GoogleMaps']          = GoogleMaps;
window.dokan.libs['Mapbox']              = Mapbox;
window.dokan.libs['UploadImage']         = UploadImage;
window.dokan.libs['PasswordGenerator']   = PasswordGenerator;
window.dokan.libs['VendorAccountFields'] = VendorAccountFields;
window.dokan.libs['VendorAddressFields'] = VendorAddressFields;
window.dokan.libs['VendorSocialFields']  = VendorSocialFields;
window.dokan.libs['VendorPaymentFields'] = VendorPaymentFields;
window.dokan.libs['RefreshSettingOptions'] = RefreshSettingOptions;
window.dokan.libs['AdminNotice']         = AdminNotice;
window.dokan.libs['CardFunFact']         = CardFunFact;
window.dokan.libs['StoreCategory']       = StoreCategory;
window.dokan.libs['papaparse']           = parse;
window.dokan.libs['CombineInput']        = CombineInput;
window.dokan.libs['CategoryBasedCommission'] = CategoryBasedCommission;
window.dokan.libs['Vuedraggable']        = Vuedraggable;

window.dokan.libs['ContentLoading']  = {
  VclCode,
  VclList,
  VclTwitch,
  VclFacebook,
  VclInstagram,
  VclBulletList,
  VueContentLoading,
};

// wp npm packages with backward compatibility
dokan.hooks = window.wp.hooks;

if ( dokan.hooks ) {
    dokan.addFilterComponent = (hookName, namespace, component, priority = 10) => {
        dokan.hooks.addFilter(hookName, namespace, (components) => {
            components.push(component);
            return components;
        }, priority );
    };
}
