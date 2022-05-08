<template>
    <div>
        <div class="dokan-settings">
            <h2 style="margin-bottom: 15px;">{{ __( 'Settings', 'dokan-lite' ) }}</h2>
            <AdminNotice></AdminNotice>
            <UpgradeBanner v-if="! hasPro"></UpgradeBanner>

            <div id="setting-message_updated" class="settings-error notice is-dismissible" :class="{ 'updated' : isUpdated, 'error' : !isUpdated }" v-if="isSaved">
                <p><strong v-html="message"></strong></p>
                <button type="button" class="notice-dismiss" @click.prevent="isSaved = false">
                    <span class="screen-reader-text">{{ __( 'Dismiss this notice.', 'dokan-lite' ) }}</span>
                </button>
            </div>

            <div class="dokan-settings-wrap">
                <div class="nav-tab-wrapper">
                    <div class="search-box">
                        <input type="text" class="dokan-admin-search-settings" placeholder="Search e.g. vendor" @input="searchInSettings" ref="searchInSettings" v-model="searchText">

                        <span class="dashicons dashicons-no-alt" @click.prevent="clearSearch" v-if="'' !== searchText"></span>
                    </div>

                    <template v-for="section in settingSections">
                        <a
                            href="#"
                            :class="['nav-tab', currentTab === section.id ? 'nav-tab-active' : '']"
                            @click.prevent="changeTab(section)"
                        >
                            <span class="dashicons" :class="section.icon"></span> {{ section.title }}
                        </a>
                    </template>
                </div>

                <div class="metabox-holder">
                    <template v-for="(fields, index) in settingFields" v-if="isLoaded">
                        <div :id="index" class="group" v-if="currentTab === index">
                            <form method="post" action="options.php">
                                <input type="hidden" name="option_page" :value="index">
                                <input type="hidden" name="action" value="update">
                                <table class="form-table">
                                    <thead v-if="showSectionTitle(fields)">
                                    <tr class="dokan-settings-field-type-sub_section">
                                        <th colspan="3" class="dokan-settings-sub-section-title">
                                            <label>{{ sectionTitle( index ) }}</label>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <Fields
                                        v-for="(field, fieldId) in fields"
                                        :section-id="index"
                                        :id="fieldId"
                                        :field-data="field"
                                        :field-value="settingValues[index]"
                                        :all-settings-values="settingValues"
                                        @openMedia="showMedia"
                                        :key="fieldId"
                                        :errors="errors"
                                        :validationErrors="validationErrors"
                                        :toggle-loading-state="toggleLoadingState"
                                    />
                                    </tbody>
                                </table>
                                <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes" @click.prevent="saveSettings( settingValues[index], index )"></p>
                            </form>
                        </div>
                    </template>
                </div>

                <div class="loading" v-if="showLoading">
                    <loading></loading>
                </div>
            </div>
        </div>

        <SettingsBanner v-if="! hasPro"></SettingsBanner>
    </div>

</template>

<script>
    let Loading     = dokan_get_lib('Loading');
    let AdminNotice = dokan_get_lib('AdminNotice');

    import Fields from "admin/components/Fields.vue"
    import SettingsBanner from "admin/components/SettingsBanner.vue";
    import UpgradeBanner from "admin/components/UpgradeBanner.vue";
    import $ from 'jquery';

    export default {

        name: 'Settings',

        components: {
            Fields,
            Loading,
            SettingsBanner,
            UpgradeBanner,
            AdminNotice,
        },

        data () {
            return {
                isSaved: false,
                showLoading: false,
                isUpdated: false,
                isLoaded: false,
                message: '',
                currentTab: null,
                settingSections: [],
                settingFields: {},
                settingValues: {},
                requiredFields: [],
                errors: [],
                validationErrors: [],
                hasPro: dokan.hasPro ? true : false,
                searchText: '',
                awaitingSearch: false,
                withdrawMethods: {},
                isSaveConfirm: false,
            }
        },

        computed: {
            refreshable_props() {
                const props = {};
                let sectionId;

                for ( sectionId in this.settingFields ) {
                    let sectionFields = this.settingFields[ sectionId ];
                    let optionId;

                    for ( optionId in sectionFields ) {
                        if ( sectionFields[ optionId ].refresh_after_save ) {
                            props[ `${sectionId}.${optionId}` ] = true;
                        }
                    }
                }

                return props;
            }
        },

        methods: {
            changeTab( section ) {
                var activetab = '';
                this.currentTab = section.id;
                this.requiredFields = [];

                if ( typeof( localStorage ) != 'undefined' ) {
                    localStorage.setItem( "activetab", this.currentTab );
                }
            },

            showSectionTitle(fields) {
                return ! _.findWhere(fields, {type: 'sub_section'});
            },

            sectionTitle( index ) {
                return _.findWhere( this.settingSections, { id:index} ).title;
            },

            fetchSettingValues() {
                var self = this,
                    data = {
                        action: 'dokan_get_setting_values',
                        nonce: dokan.nonce
                    };

                self.showLoading = true;

                jQuery.post( dokan.ajaxurl, data, function(resp) {
                    if ( resp.success ) {

                        Object.keys( self.settingFields ).forEach( function( section, index ) {
                            Object.keys( self.settingFields[section] ).forEach( function( field, i ) {

                                if (!self.settingValues[section]) {
                                    self.settingValues[section] = {};
                                }

                                if ( typeof( resp.data[section][field] ) === 'undefined' ) {
                                    if ( typeof( self.settingFields[section][field].default ) === 'undefined' ) {
                                        self.settingValues[section][field] = '';
                                    } else {
                                        self.settingValues[section][field] = self.settingFields[section][field].default;
                                    }
                                } else {
                                    self.settingValues[section][field] = resp.data[section][field];
                                }
                            });
                        });

                        self.settingValues = jQuery.extend( {}, self.settingValues );

                        self.showLoading = false;
                        self.isLoaded = true;
                        self.setWithdrawMethods();
                    }
                });
            },

            showMedia( data, $event ) {
                var self = this;

                var file_frame = wp.media.frames.file_frame = wp.media({
                    title: this.__( 'Choose your file', 'dokan-lite' ),
                    button: {
                        text: this.__( 'Select', 'dokan-lite' ),
                    },
                    multiple: false
                });

                file_frame.on( 'select', function () {
                    var attachment = file_frame.state().get('selection').first().toJSON();
                    self.settingValues[data.sectionId][data.name] = attachment.url;
                });

                file_frame.open();
            },

            async saveSettings(fieldData, section) {
                if (!this.formIsValid(section)) {
                    return;
                }

                if ('dokan_withdraw' === section) {
                    const consent = await this.setPaymentChangeAnnouncementAction(fieldData, section);
                    fieldData.send_announcement_for_payment_change = false;

                    if ('value' in consent && consent.value === true) {
                        fieldData.send_announcement_for_payment_change = this.getDifference( this.withdrawMethods, fieldData.withdraw_methods );
                    }
                    this.withdrawMethods = fieldData.withdraw_methods;
                }

                var self = this,
                    data = {
                        action: 'dokan_save_settings',
                        nonce: dokan.nonce,
                        settingsData: fieldData,
                        section: section
                    };
                self.showLoading = true;

                jQuery.post(dokan.ajaxurl, data)
                    .done(function (response) {
                        var settings = response.data.settings;

                        self.isSaved = true;
                        self.isUpdated = true;

                        self.message = response.data.message;

                        self.settingValues[settings.name] = settings.value;

                        let option;

                        for (option in fieldData) {
                            const fieldName = `${section}.${option}`;

                            if (self.refreshable_props[fieldName]) {
                                window.location.reload();
                                break;
                            }
                        }

                        self.validationErrors = [];
                    })
                    .fail(function (jqXHR) {
                        self.validationErrors = jqXHR.responseJSON.data.errors;
                    })
                    .always(function () {
                        self.showLoading = false;
                    });
            },
            setWithdrawMethods() {
                if ( 'withdraw_methods' in this.settingValues.dokan_withdraw ) {
                    this.withdrawMethods = this.settingValues.dokan_withdraw.withdraw_methods;
                }
            },

            async setPaymentChangeAnnouncementAction( fieldData, section ) {
                if ( ! ( 'withdraw_methods' in fieldData ) || 'dokan_withdraw' !== section ) {
                    return Promise.resolve( {value: false} );
                }

                const diff = this.getDifference( this.withdrawMethods, fieldData.withdraw_methods );

                if ( Object.keys( diff ).length === 0 ) {
                    return Promise.resolve({value: false});
                }

                return this.$swal({
                    title: this.__('Withdraw Method Changed'),
                    text: this.__('Do you want to send an announcement to vendors about the removal of currently active payment method?'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: this.__('Yes, send announcement!')
                });
            },

            getDifference(objA, objB) {
                const keys = Object.keys(objB);
                let difference = {};

                keys.forEach( (key) => {
                    if ( '' !== objA[key] && '' === objB[key] ) {
                        difference[key] = key;
                    }
                });
                return difference;
            },

            formIsValid( section ) {
                let allFields = Object.keys( this.settingFields );
                let requiredFields = this.requiredFields;

                if ( ! allFields ) {
                    return false;
                }

                allFields.forEach( ( fields, index ) => {
                    if ( section === fields ) {
                        let sectionFields = this.settingFields[fields];

                        Object.values(sectionFields).forEach( ( field ) => {
                            let subFields = field.fields;

                            if ( subFields ) {
                                Object.values( subFields ).forEach( ( subField ) => {
                                    if (
                                        subField
                                        && subField.required
                                        && subField.required === 'yes'
                                        && !requiredFields.includes( subField.name ) ) {
                                        requiredFields.push(subField.name);
                                    }
                                } );
                            }

                            if ( field && field.required && field.required === 'yes' ) {
                                if ( ! requiredFields.includes( field.name ) ) {
                                    requiredFields.push(field.name);
                                }
                            }
                        } );
                    }
                });

                // empty the errors array on new form submit
                this.errors = [];
                requiredFields.forEach( ( field ) => {
                    Object.values( this.settingValues ).forEach( ( value ) => {
                        if ( field in value && value[field].length < 1 ) {
                            if ( ! this.errors.includes( field ) ) {
                                this.errors.push( field );

                                // If flat or percentage commission is set. Remove the required field.
                                if ( 'flat' === value['commission_type'] || 'percentage' === value['commission_type'] ) {
                                    this.errors = this.arrayRemove( this.errors, 'admin_percentage' );
                                    this.errors = this.arrayRemove( this.errors, 'additional_fee' );
                                }
                            }
                        }
                    } );
                } );

                if ( this.errors.length < 1 ) {
                    return true;
                }

                return false;
            },

            arrayRemove( array, value ) {
               return array.filter( ( element ) => {
                   return element !== value;
               });
            },

            toggleLoadingState() {
                this.showLoading = ! this.showLoading;
            },

            clearSearch() {
                this.searchText = '';

                this.validateBlankSearch();
            },

            validateBlankSearch() {
                let searchText = this.searchText.toLowerCase();

                if ( '' === searchText ) {
                    this.settingSections = dokan.settings_sections;
                    this.settingFields   = dokan.settings_fields;
                    return false;
                }

                return true;
            },

            searchInSettings(input) {
                if ( ! this.validateBlankSearch() ) {
                    return;
                }

                if (!this.awaitingSearch) {
                    setTimeout(() => {
                        let searchText = this.$refs.searchInSettings.value.toLowerCase();
                        this.doSearch(searchText);
                        this.awaitingSearch = false;
                    }, 1000);
                }

                this.awaitingSearch = true;
            },

            doSearch(searchText) {
                var self = this;
                let settingFields = {};
                let filteredSettingSections = [];
                let settingSections = [];
                let dokan_setting_fields = dokan.settings_fields;

                Object.keys( dokan_setting_fields ).forEach( function( section, index ) {
                    Object.keys( dokan_setting_fields[section] ).forEach( function( field, i ) {
                        if (dokan_setting_fields[section][field].type === "sub_section") {
                            return;
                        }

                        let label = dokan_setting_fields[section][field]['label'].toLowerCase();

                        if ( label && label.includes(searchText) ) {
                            if (!settingFields[section]) {
                                settingFields[section] = {};
                            }

                            settingFields[section][field] = dokan_setting_fields[section][field];

                            if ( filteredSettingSections.indexOf(section) === -1 ) {
                                filteredSettingSections.push(section);
                            }
                        }
                    } );
                } );

                let currentTab = 0;
                Object.keys(dokan.settings_sections).forEach((section, index) => {
                    if (filteredSettingSections.indexOf(dokan.settings_sections[section].id) !== -1) {
                        if (!currentTab) {
                            this.changeTab(dokan.settings_sections[section]);
                            currentTab = 1;
                        }
                        settingSections.push(dokan.settings_sections[section]);
                    }
                });

                self.settingFields = settingFields;
                self.settingSections = settingSections;
            },

            handleDataClearCheckboxEvent() {
                let self = this;
                $('.data_clear_on_uninstall').on('change', "#dokan_general\\[data_clear_on_uninstall\\]", function (e) {
                    if( $(this).is(':checked') ) {
                        self.$swal({
                            title: self.__( 'Are you sure?', 'dokan-lite' ),
                            type: 'warning',
                            html: self.__( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently after deleting the Dokan plugin. You will not be able to recover your lost data unless you keep a backup. Do you want to continue?', 'dokan-lite' ),
                            showCancelButton: true,
                            confirmButtonText: self.__( 'Okay', 'dokan-lite' ),
                            cancelButtonText: self.__( 'Cancel', 'dokan-lite' ),
                        }).then( (response) => {
                            if ( response.dismiss ) {
                                self.settingValues.dokan_general.data_clear_on_uninstall = 'off';
                            }
                        });
                    }
                });
            }
        },

        created() {
            this.fetchSettingValues();

            this.currentTab = 'dokan_general';
            if ( typeof(localStorage) != 'undefined' ) {
                this.currentTab = localStorage.getItem("activetab") ? localStorage.getItem("activetab") : 'dokan_general';
            }

            this.settingSections = dokan.settings_sections;
            this.settingFields = dokan.settings_fields;
        },

        updated() {
            this.handleDataClearCheckboxEvent();
        }
    };

</script>

<style lang="less">
    .dokan-settings-wrap {
        position: relative;
        display: flex;
        border: 1px solid #c8d7e1;

        .loading{
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba( 255,255,255, 0.6);

            .dokan-loader {
                top: 40%;
                left: 45%;
            }
        }

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

        div.nav-tab-wrapper {
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

                &:focus,
                &:active {
                    box-shadow: none;
                    outline: 0;
                }

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

        .radio-image-container {
            .radio-image {
                display: block;
                width: 50%;
                background: #fff;
                -webkit-box-shadow: 0 1px 1px 0 rgba( 0, 0, 0, 0.1 );
                box-shadow: 0 1px 1px 0 rgba( 0, 0, 0, 0.1 );
                margin: 0 0 15px;
                position: relative;
                line-height: 0;
                border: 1px solid #ededed;
                padding: 4px;

                img {
                    max-width: 100%;
                    z-index: 1;
                }

                .current-option-indicator {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: #4CAF50;
                    color: #fff;
                    padding: 4px;
                    z-index: 2;
                    line-height: 1.4;
                }

                .active-option {
                    opacity: 0;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 3;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.45);
                    transition: opacity 0.4s ease;

                    button {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        margin-top: -23px;
                        margin-left: -58px;
                    }
                }

                &:hover {
                    .active-option {
                        opacity: 1;
                    }
                }

                &.active {
                    .active-option {
                        display: none;
                    }
                }

                &.not-active {
                    .current-option-indicator {
                        display: none;
                    }
                }
            }
            label {
                display:block;
                margin-bottom:5px;
            }
            label > input[type='radio'] {
                visibility: hidden; /* Makes input not-clickable */
                position: absolute; /* Remove input from document flow */
            }
            label > img {
                max-width:100%;
            }
        }

        .color-option-settings {
            display: flex;
            margin-top: 30px;

            .color_option {
                width: 325px;
                cursor: pointer;
                border: 1px solid #E2E2E2;
                padding: 15px;
                display: flex;
                text-align: left;
                box-sizing: border-box;
                border-radius: 3px;

                .color-option-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-right: 10px;
                    border-radius: 20px;
                    justify-content: center;
                    background-color: #D7DADD;

                    .dashicons-yes {
                        color: #fff;
                        display: block;
                        margin-top: 0;
                        margin-left: 2px;
                        background-color: transparent;
                    }
                }

                .color-option-content {
                    .color-option-title {
                        margin: 0;
                        font-size: 15px;
                        margin-top: 1.5px;
                        font-style: normal;
                        font-family: 'SF Pro Text';
                        font-weight: 700;
                        line-height: 18px;
                    }

                    .color-option-desc {
                        color: #788383;
                        margin: 0;
                        font-size: 12px;
                        margin-top: 5px;
                        font-style: normal;
                        font-family: 'Helvetica';
                        font-weight: 400;
                        line-height: 19px;
                        letter-spacing: 0.109091px;
                    }
                }

                &:first-child {
                    margin-right: 20px;
                }
            }

            .active-pallete {
                border: 1px solid #1ABC9C;
                background: #EFFAF8;

                .color-option-icon {
                    background-color: #1ABC9C;
                }

                .color-option-content {
                    color: #788383
                }
            }
        }

        .color-pallete-container {
            display: flex;
            margin-top: 50px;
            justify-content: space-between;

            .pallete_settings {
                width: 278px;
                display: grid;
                grid-row-gap: 10px;

                .custom-pallete-header {
                    display: flex;
                    justify-content: space-between;

                    h3 {
                        color: #000;
                        margin: 0;
                        font-size: 15px;
                        font-style: normal;
                        font-family: 'SF Pro Text';
                        font-weight: 600;
                        line-height: 18px;
                    }

                    .btnReset {
                        color: #1A9ED4;
                        cursor: pointer;
                        font-size: 13px;
                        font-style: normal;
                        text-align: right;
                        margin-top: 3px;
                        line-height: 16px;
                        font-weight: 600;
                        font-family: 'SF Pro Text';
                    }
                }

                .custom-pallete {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    h4 {
                        color: #000000;
                        margin: 0;
                        font-size: 13px;
                        text-align: left;
                        font-style: normal;
                        font-family: 'SF Pro Text';
                        font-weight: 400;
                        line-height: 16px;
                        padding-right: 15px;
                    }
                }

                .color-pallete-contents {
                    cursor: pointer;
                    border: 1px solid #E2E2E2;
                    padding: 15px;
                    box-sizing: border-box;
                    border-radius: 3px;
                }
            }

            .pallete-btn {
                text-align: left;
                margin-bottom: 8px;

                input[type='radio'] {
                    border: 1px solid #D4D5D6;
                    display: inline-block;
                    margin-top: 0;

                    &:checked {
                        border: 1px solid #1A9ED4;

                        &:before {
                            background-color: #1A9ED4;
                        }
                    }
                }

                label {
                    text-transform: capitalize;
                    font-family: 'SF Pro Text';
                    font-style: normal;
                    font-weight: 400;
                    font-size: 13px;
                    line-height: 16px;
                    color: #000000;
                }
            }

            .colors {
                height: 15px;
                display: grid;
                overflow: hidden;
                grid-column-gap: 4px;
                grid-template-columns: repeat(4,1fr);

                .color-1 {
                    width: 117px;
                }

                .color-2 {
                    width: 38px;
                }

                .color-3 {
                    width: 36px;
                }

                .color-4 {
                    width: 45px;
                }

                div {
                    border-radius: 3px;
                }
            }

            .pallete_preview {
                width: 400px;

                .preview-title {
                    margin: 0;
                    text-align: left;
                    margin-bottom: 25px;
                }

                .preview {
                    width: 100%;
                    border: 0.52px solid #EAEAEA;
                    height: 505px;
                    overflow: hidden;
                    border-radius: 8.97px;

                    .preview-header {
                        height: 30px;
                        border: 0.52px solid #EAEAEA;
                        display: flex;
                        align-items: center;
                        border-radius: 8.97px 8.97px 0px 0px;

                        .ellipsis {
                            width: 100px;
                            height: 15px;
                            display: flex;
                            margin-left: 18px;
                            align-items: center;

                            .ellipsis-1 {
                                background-color: #D2D2E1;
                            }

                            .ellipsis-2 {
                                background-color: #C2C2D7;
                            }

                            .ellipsis-3 {
                                background-color: #A2A2C1;
                            }

                            div {
                                width: 6px;
                                height: 6px;
                                margin-right: 5px;
                                border-radius: 6px;

                                &:last-child {
                                    margin-right: 0;
                                }
                            }
                        }
                    }

                    .preview-body {
                        width: 100%;
                        height: 100%;
                        display: flex;

                        .preview-sidebar {
                            width: 75px;
                            height: 100%;

                            .dokan-logo {
                                text-align: center;
                                margin: 5px 0;
                            }

                            .placeholder-menu {
                                width: 100%;

                                .active-menu {
                                    position: relative;
                                    background-color: #C61740;

                                    .menu-icon,
                                    .menu-content {
                                        background-color: #FFF;
                                    }

                                    .menu-content {
                                        width: 22px;
                                    }

                                    &:after {
                                        top: 6px;
                                        right: -7px;
                                        content: "";
                                        position: absolute;
                                        transform: rotateZ(-90deg);
                                        border-left: 10px solid transparent;
                                        border-right: 10px solid transparent;
                                        border-bottom: 6px solid #fff;
                                    }
                                }

                                div {
                                    height: 22px;
                                    display: flex;
                                    align-items: center;

                                    .menu-icon {
                                        width: 6px;
                                        height: 6px;
                                        margin: 0 6px 0 23px;
                                        border-radius: 6px;
                                    }

                                    .menu-content {
                                        width: 15px;
                                        height: 3px;
                                        border-radius: 1.5px;
                                    }

                                    &:nth-child(2) {
                                        .menu-content {
                                            width: 26px;
                                        }
                                    }
                                }
                            }
                        }

                        .preview-content {
                            width: 325px;
                            height: 100%;
                            display: block;
                            padding: 15px 20px;
                            box-sizing: border-box;
                            background-color: #F8F9FC;

                            .report-section {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;

                                .reports {
                                    display: grid;
                                    grid-column-gap: 7px;
                                    grid-template-columns: repeat(4, 1fr);

                                    .report {
                                        width: 37px;
                                        height: 37px;
                                        background: #efeff6;
                                        border-radius: 3.30042px;

                                        .report-content {
                                            width: 16px;
                                            height: 3px;
                                            background: #CBCBDC;
                                            border-radius: 3.30042px;
                                            display: block;
                                            margin: auto;
                                            opacity: 0.8;
                                            margin-top: 10px;

                                            &:last-child {
                                                margin-top: 8px;
                                                width: 10px;
                                            }
                                        }
                                    }
                                }

                                .button-preview {
                                    color: #FFF;
                                    width: 65px;
                                    height: 33px;
                                    display: flex;
                                    font-size: 11px;
                                    font-style: normal;
                                    font-weight: 600;
                                    line-height: 13px;
                                    font-family: 'SF Pro Text';
                                    align-items: center;
                                    border-radius: 1.8262px;
                                    justify-content: center;
                                }
                            }

                            .chart-section {
                                border: 0.5px solid #EAEAEA;
                                background: #FFF;
                                box-shadow: 0px 4.89199px 8.15331px rgba(0, 0, 0, 0.02);
                                border-radius: 8.97px;

                                .chart-header {
                                    width: 100%;
                                    padding: 15px;
                                    display: grid;
                                    box-sizing: border-box;
                                    grid-column-gap: 16px;
                                    grid-template-columns: repeat(2, 1fr);

                                    .contents {
                                        display: grid;
                                        grid-template-columns: repeat(4, 1fr);
                                        grid-column-gap: 8px;

                                        .content {
                                            width: 20px;
                                            height: 3px;
                                            background-color: #E0E1ED;
                                            border-radius: 3.3px;
                                        }
                                    }

                                    .btn-hover-preview {
                                        color: #FFF;
                                        width: 92px;
                                        height: 32px;
                                        display: flex;
                                        font-size: 10.72px;
                                        font-style: normal;
                                        font-family: 'SF Pro Text';
                                        font-weight: 600;
                                        line-height: 13px;
                                        align-items: center;
                                        border-radius: 1.8262px;
                                        justify-content: center;
                                    }
                                }

                                .chart-preview {
                                    img {
                                        width: 100%;
                                    }
                                }
                            }

                            .content-section,
                            .profile-section {
                                display: grid;
                                grid-column-gap: 10px;
                                grid-template-columns: repeat(2, 1fr);

                                .content-half {
                                    border: 0.330118px solid hsla(0,0%,59.2%,.13);
                                    padding: 24px 12px;
                                    display: grid;
                                    background: #fff;
                                    box-shadow: 0px 4.89199px 8.15331px rgba(0, 0, 0, 0.02);
                                    box-sizing: border-box;
                                    border-radius: 8.96864px;
                                    grid-template-columns: repeat(3, 1fr);
                                    grid-column-gap: 12px;

                                    .content {
                                        height: 3px;
                                        border-radius: 3.3px;
                                        background-color: #EFEFF6;
                                    }

                                    .content-left {
                                        .content {
                                            width: 28px;
                                            background-color: #E0E1ED;

                                            &:nth-child(1) {
                                                width: 16px;
                                            }

                                            &:nth-child(2) {
                                                width: 22px;
                                            }
                                        }
                                    }

                                    .content-center {
                                        .content {
                                            width: 48px;
                                        }
                                    }

                                    .content-right {
                                        .content {
                                            width: 10px;
                                            background-color: #E0E1ED;
                                        }
                                    }

                                    div {
                                        display: grid;
                                        grid-row-gap: 13px;
                                    }
                                }
                            }

                            .content-section {
                                .content-half {
                                    .border-preview {
                                        color: #1B233B;
                                        width: 98px;
                                        border: 0.61px solid;
                                        padding: 4px;
                                        font-size: 10px;
                                        background: #FFFFFF;
                                        box-sizing: border-box;
                                        font-style: normal;
                                        text-align: left;
                                        font-family: 'SF Pro Text';
                                        align-items: center;
                                        font-weight: 600;
                                        border-radius: 1.8px;
                                        justify-content: center;
                                    }

                                    &:last-child {
                                        display: block;
                                        padding-top: 18px;
                                        padding-bottom: 12px;

                                        .content {
                                            width: 42px;
                                            margin-bottom: 6px;

                                            &:nth-child(2) {
                                                width: 75px;
                                                margin-bottom: 12px;
                                            }
                                        }
                                    }
                                }
                            }

                            .profile-section {
                                .content-half {
                                    .content {
                                        width: 60px;
                                    }

                                    .profiles {
                                        grid-row-gap: 10px;

                                        .profile {
                                            display: flex;
                                            align-items: center;

                                            .profile-pic {
                                                width: 15px;
                                                height: 15px;
                                                display: flex;
                                                align-items: center;
                                                margin-right: 7px;
                                                border-radius: 15px;
                                                background-color: #EFEFF6;
                                                justify-content: center;
                                            }

                                            .content {
                                                margin-bottom: 0;
                                            }
                                        }
                                    }

                                    &:first-child {
                                        display: block;

                                        .content {
                                            margin-bottom: 10px;
                                        }
                                    }

                                    &:last-child {
                                        display: flex;
                                        align-items: center;

                                        div {
                                            display: block;

                                            .content {
                                                margin-bottom: 15px;

                                                &:last-child {
                                                    margin-bottom: 0;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            & > div {
                                margin-bottom: 25px;

                                &:last-child {
                                    margin-bottom: 0;
                                }
                            }
                        }
                    }
                }
            }
        }

        .search-box {
            position: relative;

            span.dashicons.dashicons-no-alt {
                position: absolute;
                top: 13px;
                right: 0;
                color: #ff0000;
                z-index: 999;
                cursor: pointer;
            }

            .dokan-admin-search-settings {
                border: 1px solid #ddd;
                border-radius: 0px;
                height: 48px;
                display: block;
                width: 100%;
                border-left: 0;
                border-top: 0;
                padding: 0 15px;
                background: #eee;
                font-weight: 400;
            }

            input[type="text"]:focus {
                border-color: transparent;
            }
        }
    }

    .form-table th.dokan-settings-sub-section-title {
        border-bottom: 1px solid #cccccc;
        padding: 0 0 10px;

        label {
            display: block;
            margin-top: 20px;
            color: #0073aa;
            font-weight: 500;
            font-size: 1.3em;
        }
    }

    .form-table .dokan-settings-field-type-sub_section:first-child th.dokan-settings-sub-section-title {
        label {
            margin-top: 0;
        }
    }

    tr.data_clear_on_uninstall {
        td fieldset label {
            background: #e00;
            padding: 5px;
            color: white;
            border-radius: 3px;
        }
    }
</style>
