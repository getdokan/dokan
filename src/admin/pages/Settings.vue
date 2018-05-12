<template>
    <div class="dokan-settings">
        <h2 style="margin-bottom: 15px;">Settings</h2>

        <div class="dokan-settings-wrap">
            <h2 class="nav-tab-wrapper">
                <template v-for="section in settingSections">
                    <a href="#" class="nav-tab" :class="{ 'nav-tab-active': currentTab === section.id }" id="dokan_general-tab" @click.prevent="currentTab = section.id"><span class="dashicons" :class="section.icon"></span> {{ section.title }}</a>
                </template>
            </h2>

            <div class="metabox-holder">
                <div id="dokan_general" class="group" v-show="currentTab==='dokan_general'">
                    <form method="post" action="options.php">
                        <input type="hidden" name="option_page" value="dokan_general">
                        <input type="hidden" name="action" value="update">
                        <h2>General</h2>
                        <table class="form-table"><tbody><tr class="admin_access"><th scope="row"><label for="dokan_general[admin_access]">Admin area access</label></th><td><fieldset><label for="wpuf-dokan_general[admin_access]"><input type="hidden" name="dokan_general[admin_access]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[admin_access]" name="dokan_general[admin_access]" value="on">Disable Vendors and Customers from accessing the wp-admin dashboard area</label></fieldset></td></tr><tr class="custom_store_url"><th scope="row"><label for="dokan_general[custom_store_url]">Vendor Store URL</label></th><td><input type="text" class="regular-text" id="dokan_general[custom_store_url]" name="dokan_general[custom_store_url]" value="store"><p class="description">Define the seller store URL (http://newdokan.test/<strong>[this-text]</strong>/[seller-name])</p></td></tr><tr class="seller_enable_terms_and_conditions"><th scope="row"><label for="dokan_general[seller_enable_terms_and_conditions]">Terms and Conditions</label></th><td><fieldset><label for="wpuf-dokan_general[seller_enable_terms_and_conditions]"><input type="hidden" name="dokan_general[seller_enable_terms_and_conditions]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_enable_terms_and_conditions]" name="dokan_general[seller_enable_terms_and_conditions]" value="on">Enable Terms and Conditions for vendor stores</label></fieldset></td></tr><tr class="extra_fee_recipient"><th scope="row"><label for="dokan_general[extra_fee_recipient]">Extra Fee Recipient</label></th><td><select class="regular" name="dokan_general[extra_fee_recipient]" id="dokan_general[extra_fee_recipient]"><option value="seller" selected="selected">Vendor</option><option value="admin">Admin</option></select><p class="description">Should extra fees, such as Shipping and Tax, go to the Vendor or the Admin?</p></td></tr><tr class="store_map"><th scope="row"><label for="dokan_general[store_map]">Show Map on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[store_map]"><input type="hidden" name="dokan_general[store_map]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[store_map]" name="dokan_general[store_map]" value="on" checked="checked">Enable a Google Map of the Store Location in the store sidebar</label></fieldset></td></tr><tr class="gmap_api_key"><th scope="row"><label for="dokan_general[gmap_api_key]">Google Map API Key</label></th><td><input type="text" class="regular-text" id="dokan_general[gmap_api_key]" name="dokan_general[gmap_api_key]" value=""><p class="description"><a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page</p></td></tr><tr class="contact_seller"><th scope="row"><label for="dokan_general[contact_seller]">Show Contact Form on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[contact_seller]"><input type="hidden" name="dokan_general[contact_seller]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[contact_seller]" name="dokan_general[contact_seller]" value="on" checked="checked">Enable Vendor Contact Form in the store sidebar</label></fieldset></td></tr><tr class="enable_theme_store_sidebar"><th scope="row"><label for="dokan_general[enable_theme_store_sidebar]">Enable Store Sidebar From Theme</label></th><td><fieldset><label for="wpuf-dokan_general[enable_theme_store_sidebar]"><input type="hidden" name="dokan_general[enable_theme_store_sidebar]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_theme_store_sidebar]" name="dokan_general[enable_theme_store_sidebar]" value="on">Enable showing Store Sidebar From Your Theme.</label></fieldset></td></tr><tr class="product_add_mail"><th scope="row"><label for="dokan_general[product_add_mail]">Product Mail Notification</label></th><td><fieldset><label for="wpuf-dokan_general[product_add_mail]"><input type="hidden" name="dokan_general[product_add_mail]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[product_add_mail]" name="dokan_general[product_add_mail]" value="on" checked="checked">Email notification on new product submission</label></fieldset></td></tr><tr class="seller_review_manage"><th scope="row"><label for="dokan_general[seller_review_manage]">Vendor Product Review</label></th><td><fieldset><label for="wpuf-dokan_general[seller_review_manage]"><input type="hidden" name="dokan_general[seller_review_manage]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_review_manage]" name="dokan_general[seller_review_manage]" value="on" checked="checked">Vendor can change product review status from vendor dashboard</label></fieldset></td></tr><tr class="enable_tc_on_reg"><th scope="row"><label for="dokan_general[enable_tc_on_reg]">Enable Terms and Condition</label></th><td><fieldset><label for="wpuf-dokan_general[enable_tc_on_reg]"><input type="hidden" name="dokan_general[enable_tc_on_reg]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_tc_on_reg]" name="dokan_general[enable_tc_on_reg]" value="on" checked="checked">Enable Terms and Condition check on registration form</label></fieldset></td></tr><tr class="store_banner_width"><th scope="row"><label for="dokan_general[store_banner_width]">Store Banner width</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_width]" name="dokan_general[store_banner_width]" value="625"></td></tr><tr class="store_banner_height"><th scope="row"><label for="dokan_general[store_banner_height]">Store Banner height</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_height]" name="dokan_general[store_banner_height]" value="300"></td></tr></tbody></table>                        <div style="padding-left: 10px">
                        <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>                        </div>
                    </form>
                </div>
                <div id="dokan_selling" class="group" v-show="currentTab==='dokan_selling'">
                    <form method="post" action="options.php">
                        <input type="hidden" name="option_page" value="dokan_general">
                        <input type="hidden" name="action" value="update">
                        <h2>Selling</h2>
                        <table class="form-table"><tbody><tr class="admin_access"><th scope="row"><label for="dokan_general[admin_access]">Admin area access</label></th><td><fieldset><label for="wpuf-dokan_general[admin_access]"><input type="hidden" name="dokan_general[admin_access]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[admin_access]" name="dokan_general[admin_access]" value="on">Disable Vendors and Customers from accessing the wp-admin dashboard area</label></fieldset></td></tr><tr class="custom_store_url"><th scope="row"><label for="dokan_general[custom_store_url]">Vendor Store URL</label></th><td><input type="text" class="regular-text" id="dokan_general[custom_store_url]" name="dokan_general[custom_store_url]" value="store"><p class="description">Define the seller store URL (http://newdokan.test/<strong>[this-text]</strong>/[seller-name])</p></td></tr><tr class="seller_enable_terms_and_conditions"><th scope="row"><label for="dokan_general[seller_enable_terms_and_conditions]">Terms and Conditions</label></th><td><fieldset><label for="wpuf-dokan_general[seller_enable_terms_and_conditions]"><input type="hidden" name="dokan_general[seller_enable_terms_and_conditions]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_enable_terms_and_conditions]" name="dokan_general[seller_enable_terms_and_conditions]" value="on">Enable Terms and Conditions for vendor stores</label></fieldset></td></tr><tr class="extra_fee_recipient"><th scope="row"><label for="dokan_general[extra_fee_recipient]">Extra Fee Recipient</label></th><td><select class="regular" name="dokan_general[extra_fee_recipient]" id="dokan_general[extra_fee_recipient]"><option value="seller" selected="selected">Vendor</option><option value="admin">Admin</option></select><p class="description">Should extra fees, such as Shipping and Tax, go to the Vendor or the Admin?</p></td></tr><tr class="store_map"><th scope="row"><label for="dokan_general[store_map]">Show Map on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[store_map]"><input type="hidden" name="dokan_general[store_map]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[store_map]" name="dokan_general[store_map]" value="on" checked="checked">Enable a Google Map of the Store Location in the store sidebar</label></fieldset></td></tr><tr class="gmap_api_key"><th scope="row"><label for="dokan_general[gmap_api_key]">Google Map API Key</label></th><td><input type="text" class="regular-text" id="dokan_general[gmap_api_key]" name="dokan_general[gmap_api_key]" value=""><p class="description"><a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page</p></td></tr><tr class="contact_seller"><th scope="row"><label for="dokan_general[contact_seller]">Show Contact Form on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[contact_seller]"><input type="hidden" name="dokan_general[contact_seller]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[contact_seller]" name="dokan_general[contact_seller]" value="on" checked="checked">Enable Vendor Contact Form in the store sidebar</label></fieldset></td></tr><tr class="enable_theme_store_sidebar"><th scope="row"><label for="dokan_general[enable_theme_store_sidebar]">Enable Store Sidebar From Theme</label></th><td><fieldset><label for="wpuf-dokan_general[enable_theme_store_sidebar]"><input type="hidden" name="dokan_general[enable_theme_store_sidebar]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_theme_store_sidebar]" name="dokan_general[enable_theme_store_sidebar]" value="on">Enable showing Store Sidebar From Your Theme.</label></fieldset></td></tr><tr class="product_add_mail"><th scope="row"><label for="dokan_general[product_add_mail]">Product Mail Notification</label></th><td><fieldset><label for="wpuf-dokan_general[product_add_mail]"><input type="hidden" name="dokan_general[product_add_mail]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[product_add_mail]" name="dokan_general[product_add_mail]" value="on" checked="checked">Email notification on new product submission</label></fieldset></td></tr><tr class="seller_review_manage"><th scope="row"><label for="dokan_general[seller_review_manage]">Vendor Product Review</label></th><td><fieldset><label for="wpuf-dokan_general[seller_review_manage]"><input type="hidden" name="dokan_general[seller_review_manage]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_review_manage]" name="dokan_general[seller_review_manage]" value="on" checked="checked">Vendor can change product review status from vendor dashboard</label></fieldset></td></tr><tr class="enable_tc_on_reg"><th scope="row"><label for="dokan_general[enable_tc_on_reg]">Enable Terms and Condition</label></th><td><fieldset><label for="wpuf-dokan_general[enable_tc_on_reg]"><input type="hidden" name="dokan_general[enable_tc_on_reg]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_tc_on_reg]" name="dokan_general[enable_tc_on_reg]" value="on" checked="checked">Enable Terms and Condition check on registration form</label></fieldset></td></tr><tr class="store_banner_width"><th scope="row"><label for="dokan_general[store_banner_width]">Store Banner width</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_width]" name="dokan_general[store_banner_width]" value="625"></td></tr><tr class="store_banner_height"><th scope="row"><label for="dokan_general[store_banner_height]">Store Banner height</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_height]" name="dokan_general[store_banner_height]" value="300"></td></tr></tbody></table>                        <div style="padding-left: 10px">
                        <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>                        </div>
                    </form>
                </div>
                <div id="dokan_withdraw" class="group" v-show="currentTab==='dokan_withdraw'">
                    <form method="post" action="options.php">
                        <input type="hidden" name="option_page" value="dokan_general">
                        <input type="hidden" name="action" value="update">
                        <h2>Withdraw</h2>
                        <table class="form-table"><tbody><tr class="admin_access"><th scope="row"><label for="dokan_general[admin_access]">Admin area access</label></th><td><fieldset><label for="wpuf-dokan_general[admin_access]"><input type="hidden" name="dokan_general[admin_access]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[admin_access]" name="dokan_general[admin_access]" value="on">Disable Vendors and Customers from accessing the wp-admin dashboard area</label></fieldset></td></tr><tr class="custom_store_url"><th scope="row"><label for="dokan_general[custom_store_url]">Vendor Store URL</label></th><td><input type="text" class="regular-text" id="dokan_general[custom_store_url]" name="dokan_general[custom_store_url]" value="store"><p class="description">Define the seller store URL (http://newdokan.test/<strong>[this-text]</strong>/[seller-name])</p></td></tr><tr class="seller_enable_terms_and_conditions"><th scope="row"><label for="dokan_general[seller_enable_terms_and_conditions]">Terms and Conditions</label></th><td><fieldset><label for="wpuf-dokan_general[seller_enable_terms_and_conditions]"><input type="hidden" name="dokan_general[seller_enable_terms_and_conditions]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_enable_terms_and_conditions]" name="dokan_general[seller_enable_terms_and_conditions]" value="on">Enable Terms and Conditions for vendor stores</label></fieldset></td></tr><tr class="extra_fee_recipient"><th scope="row"><label for="dokan_general[extra_fee_recipient]">Extra Fee Recipient</label></th><td><select class="regular" name="dokan_general[extra_fee_recipient]" id="dokan_general[extra_fee_recipient]"><option value="seller" selected="selected">Vendor</option><option value="admin">Admin</option></select><p class="description">Should extra fees, such as Shipping and Tax, go to the Vendor or the Admin?</p></td></tr><tr class="store_map"><th scope="row"><label for="dokan_general[store_map]">Show Map on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[store_map]"><input type="hidden" name="dokan_general[store_map]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[store_map]" name="dokan_general[store_map]" value="on" checked="checked">Enable a Google Map of the Store Location in the store sidebar</label></fieldset></td></tr><tr class="gmap_api_key"><th scope="row"><label for="dokan_general[gmap_api_key]">Google Map API Key</label></th><td><input type="text" class="regular-text" id="dokan_general[gmap_api_key]" name="dokan_general[gmap_api_key]" value=""><p class="description"><a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page</p></td></tr><tr class="contact_seller"><th scope="row"><label for="dokan_general[contact_seller]">Show Contact Form on Store Page</label></th><td><fieldset><label for="wpuf-dokan_general[contact_seller]"><input type="hidden" name="dokan_general[contact_seller]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[contact_seller]" name="dokan_general[contact_seller]" value="on" checked="checked">Enable Vendor Contact Form in the store sidebar</label></fieldset></td></tr><tr class="enable_theme_store_sidebar"><th scope="row"><label for="dokan_general[enable_theme_store_sidebar]">Enable Store Sidebar From Theme</label></th><td><fieldset><label for="wpuf-dokan_general[enable_theme_store_sidebar]"><input type="hidden" name="dokan_general[enable_theme_store_sidebar]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_theme_store_sidebar]" name="dokan_general[enable_theme_store_sidebar]" value="on">Enable showing Store Sidebar From Your Theme.</label></fieldset></td></tr><tr class="product_add_mail"><th scope="row"><label for="dokan_general[product_add_mail]">Product Mail Notification</label></th><td><fieldset><label for="wpuf-dokan_general[product_add_mail]"><input type="hidden" name="dokan_general[product_add_mail]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[product_add_mail]" name="dokan_general[product_add_mail]" value="on" checked="checked">Email notification on new product submission</label></fieldset></td></tr><tr class="seller_review_manage"><th scope="row"><label for="dokan_general[seller_review_manage]">Vendor Product Review</label></th><td><fieldset><label for="wpuf-dokan_general[seller_review_manage]"><input type="hidden" name="dokan_general[seller_review_manage]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[seller_review_manage]" name="dokan_general[seller_review_manage]" value="on" checked="checked">Vendor can change product review status from vendor dashboard</label></fieldset></td></tr><tr class="enable_tc_on_reg"><th scope="row"><label for="dokan_general[enable_tc_on_reg]">Enable Terms and Condition</label></th><td><fieldset><label for="wpuf-dokan_general[enable_tc_on_reg]"><input type="hidden" name="dokan_general[enable_tc_on_reg]" value="off"><input type="checkbox" class="checkbox" id="wpuf-dokan_general[enable_tc_on_reg]" name="dokan_general[enable_tc_on_reg]" value="on" checked="checked">Enable Terms and Condition check on registration form</label></fieldset></td></tr><tr class="store_banner_width"><th scope="row"><label for="dokan_general[store_banner_width]">Store Banner width</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_width]" name="dokan_general[store_banner_width]" value="625"></td></tr><tr class="store_banner_height"><th scope="row"><label for="dokan_general[store_banner_height]">Store Banner height</label></th><td><input type="text" class="regular-text" id="dokan_general[store_banner_height]" name="dokan_general[store_banner_height]" value="300"></td></tr></tbody></table>                        <div style="padding-left: 10px">
                        <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>                        </div>
                    </form>
                </div>
            </div>

        </div>
    </div>

</template>

<script>

    export default {

        name: 'Settings',

        data () {
            return {
                currentTab: null,
                settingSections: [],
                settingFields: {}
            }
        },

        computed: {

        },

        methods: {

        },

        created() {
            this.currentTab = 'dokan_general';

            this.settingSections = dokan.settings_sections;
            this.settingFields = dokan.settings_fields;
        },
    }

</script>

<style lang="less">
    .dokan-settings-wrap {
        display: flex;
        border: 1px solid #c8d7e1;

        .dashicons {
            padding-top: 2px;
            margin-right: 5px;

            &.dashicons-admin-generic {
                color: #6c75ff;
            }

            &.dashicons-cart {
                color: #00aeff;
            }

            &.dashicons-money {
                color: #d35400;
            }

            &.dashicons-admin-page {
                color: #8e44ad;
            }

            &.dashicons-admin-appearance {
                color: #3498db;
            }

            &.dashicons-networking {
                color: #1abc9c;
            }
        }

        h2.nav-tab-wrapper {
            flex: 1;
            border-bottom: none;
            padding: 0;
            background: #f1f1f1;
            border-right: 1px solid #c8d7e1;

            a {
                float: none;
                display: block;
                margin: 0;
                border: none;
                padding: 13px 13px;
                background: #f1f1f1;
                font-weight: 500;
                border-bottom: 1px solid #c8d7e1;
                transition-property: none;
                transition:none;

                &.nav-tab-active {
                    background: #fff !important;
                    border-right: 1px solid #c8d7e1;
                    width: 99%;
                    color: #2e4453;
                    transition:none;
                    transition-property: none;
                }
            }
        }

        .metabox-holder {
            flex: 3;
            padding-left: 3%;
            padding-right: 10px;
            background: #fff;
        }
    }

</style>