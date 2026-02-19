<template>
    <div>
        <div class="dokan-settings">
            <h1 style="margin-bottom: 15px;">{{ __( 'Settings', 'dokan-lite' ) }}</h1>
            <AdminNotice></AdminNotice>
<!--            <UpgradeBanner v-if="! hasPro"></UpgradeBanner>-->

            <div id="setting-message_updated" class="settings-error notice is-dismissible" :class="{ 'updated' : isUpdated, 'error' : !isUpdated }" v-if="isSaved">
                <p><strong v-html="message"></strong></p>
                <button type="button" class="notice-dismiss" @click.prevent="isSaved = false">
                    <span class="screen-reader-text">{{ __( 'Dismiss this notice.', 'dokan-lite' ) }}</span>
                </button>
            </div>

            <div class="dokan-settings-wrap " ref='settingsWrapper'>
                <div class='flex d-xs:flex-col lg:flex-row w-full'>
                    <div class="nav-tab-wrapper d-xs:!pb-5 d-xs:!pt-5 px-4 py-2 z-[1] lg:overflow-hidden d-xs:w-full  w-[250px] flex-1 lg:w-[340px]">
                        <div class="nab-section block">
                            <div class="flex gap-4 items-center">
                                <!-- Mobile menu toggle button -->
                                <button
                                    class="d-xs:flex lg:hidden p-2.5 bg-white  dokan-settings-menu-toggle-btn
                                     rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 ease-in-out group outline-none "
                                    @click="openMobileDrawer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        class="group-hover:scale-110 transition-transform duration-200"
                                    >
                                        <path
                                            stroke="#246EFE"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                            class="group-hover:stroke-[#1b4fd1]"
                                        />
                                    </svg>
                                    <span class="sr-only">{{ __('Toggle Settings Menu', 'dokan-lite') }}</span>
                                </button>
                                <template>
                                    <div class="relative flex-1">
                                        <!-- Search Box -->
                                        <div class="search-section relative w-full mb-4">
                                            <div class="search-box w-full bg-white rounded-lg border border-gray-200 flex items-center">
                                                <label for="dokan-admin-search" class="dashicons dashicons-search "></label>
                                                <input
                                                    type="text"
                                                    autocomplete="off"
                                                    id="dokan-admin-search"
                                                    class="w-full px-3 py-2 border-none focus:outline-none focus:ring-0 bg-transparent "
                                                    :placeholder="__('Search e.g. vendor', 'dokan-lite')"
                                                    v-model="searchText"
                                                    @input="searchInSettings"
                                                    ref="searchInSettings"
                                                />
                                                <span
                                                    v-if="searchText !== ''"
                                                    class="dashicons dashicons-no-alt mr-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                                    @click.prevent="clearSearch"
                                                ></span>
                                            </div>

                                            <!-- Search Suggestions Dropdown -->
                                            <div
                                                v-if="searchText && settingSections.length > 0"
                                                class="d-xs:absolute lg:hidden left-0 right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-100 max-h-[280px] overflow-y-auto z-50"
                                            >
                                                <div
                                                    v-for="section in settingSections"
                                                    :key="section.id"
                                                    class="hover:bg-gray-50 transition-colors cursor-pointer"
                                                    @click="handleSectionClick(section)"
                                                >
                                                    <div class="p-3">
                                                        <div class="flex items-center gap-3">
                                                            <img
                                                                :src="section.icon_url"
                                                                :alt="section.title"
                                                                class="w-5 h-5"
                                                            />
                                                            <div class="flex-1 min-w-0">
                                                                <div class="text-sm font-medium text-gray-900 truncate">
                                                                    {{ section.title }}
                                                                </div>
                                                                <div class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                                    {{ section.description }}
                                                                </div>
                                                            </div>
                                                            <svg
                                                                class="w-4 h-4 text-gray-400 flex-shrink-0"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <!-- Mobile Settings List -->
                            <transition name="slide">
                                <MobileSettingsDrawer
                                    :is-open="showMobileDrawer"
                                    :sections="settingSections"
                                    :current-tab="currentTab"
                                    @close="closeMobileDrawer"
                                    @change-tab="changeTab"
                                />
                            </transition>

                           <div class="d-xs:hidden lg:block">
                               <template  v-for="section in settingSections">
                                   <div :class="['nav-tab', currentTab === section.id ? 'nav-tab-active' : '']"
                                        @click.prevent="changeTab(section)" :key="section.id">
                                       <img :src="section.icon_url" :alt="section.settings_title"/>
                                       <div class="nav-content">
                                           <div class="nav-title">{{ section.title }}</div>
                                           <div class="nav-description">{{ section.description }}</div>
                                       </div>
                                   </div>
                               </template>
                           </div>
                        </div>
                    </div>


                <div class="metabox-holder">
                    <fieldset class="settings-header" v-for="section in settingSections" v-if="currentTab === section.id">
                        <div class="settings-content">
                            <h2 class="settings-title font-bold">{{ section.settings_title }}</h2>
                            <p class="settings-description">{{ section.settings_description }}</p>
                        </div>
                        <div v-if="section.document_link" class="settings-document-button">
                            <a :href="section.document_link" target="_blank" class="doc-link">{{ __( 'Documentation', 'dokan-lite' ) }}</a>
                        </div>
                    </fieldset>
                    <template v-for="(fields, index) in settingFields" v-if="isLoaded">
                        <div :id="index" class="group" v-if="currentTab === index" :key="index">
                            <form method="post" action="options.php">
                                <input type="hidden" name="option_page" :value="index">
                                <input type="hidden" name="action" value="update">
                                <div class="form-table">
                                    <div class="dokan-settings-fields">
                                        <Fields
                                            :ref="fieldId"
                                            v-for="(field, fieldId) in fields"
                                            :section-id="index"
                                            :id="fieldId"
                                            :field-data="field"
                                            :field-value="settingValues[index]"
                                            :all-settings-values="settingValues"
                                            @openMedia="showMedia"
                                            @addValidationError="addValidationError"
                                            @removeValidationError="removeValidationError"
                                            :key="fieldId"
                                            :errors="errors"
                                            :validationErrors="validationErrors"
                                            :toggle-loading-state="toggleLoadingState"
                                            :dokanAssetsUrl="dokanAssetsUrl" />
                                    </div>
                                </div>
                                <p class="submit">
                                    <input
                                        type="submit"
                                        name="submit"
                                        id="submit"
                                        class="button button-primary"
                                        :value="__( 'Save Changes', 'dokan-lite' )"
                                        @click.prevent="saveSettings( settingValues[index], index )"
                                        :disabled="disableSubmit"
                                    >
                                </p>
                            </form>
                        </div>
                    </template>

                        <div ref='backToTop' @click="scrollToTop" class='back-to-top tips' :title="__( 'Back to top', 'dokan-lite' )" v-tooltip="__( 'Back to top', 'dokan-lite' )">
                            <img :src="dokanAssetsUrl + '/images/up-arrow.svg'" :alt="__( 'Dokan Back to Top Button', 'dokan-lite' )" />
                        </div>
                    </div>
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
    import MobileSettingsList from "admin/components/Settings/MobileSettingsList.vue";

    let Loading     = dokan_get_lib('Loading');
    let AdminNotice = dokan_get_lib('AdminNotice');

    import Fields from "admin/components/Fields.vue"
    import SettingsBanner from "admin/components/SettingsBanner.vue";
    // import UpgradeBanner from "admin/components/UpgradeBanner.vue";
    import MobileSettingsDrawer from "admin/components/Settings/MobileSettingsList.vue";

    export default {

        name: 'Settings',

        components: {
            MobileSettingsDrawer,
            MobileSettingsList,
            Fields,
            Loading,
            SettingsBanner,
            // UpgradeBanner,
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
                disbursementSchedule: {},
                isSaveConfirm: false,
                dokanAssetsUrl: dokan.urls.assetsUrl,
                disableSubmit: false,
                showMenu: false,
                screenWidth: window.document.documentElement.clientWidth,
                showMobileDrawer: false,
                showSuggestions :false

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
                this.currentTab = section.id;

                this.$refs.settingsWrapper.scrollIntoView({ behavior: 'smooth' });
                if ( typeof( localStorage ) != 'undefined' ) {
                    localStorage.setItem( "activetab", this.currentTab );
                }

                if (  this.screenWidth >= 753 ) {
                    this.showMenu = true;
                    return;
                }

                this.showMenu = false;
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
                                    self.settingValues[section] = resp.data[section];
                                }
                            });
                        });

                        self.settingValues = jQuery.extend( {}, self.settingValues );

                        self.showLoading = false;
                        self.isLoaded = true;
                        self.setWithdrawMethods();
                        self.setWithdrawDisbursementSchedule();
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

                    // Disbursement Schedule Option Change.
                    const consentOfScheduleChange = await this.setDisbursementScheduleChangeAnnouncementAction(fieldData, section);
                    fieldData.send_announcement_for_disbursement_schedule_change = false;

                    if ('value' in consentOfScheduleChange && consentOfScheduleChange.value === true) {
                        fieldData.send_announcement_for_disbursement_schedule_change = this.getDifference( this.disbursementSchedule, fieldData.disbursement_schedule );
                    }
                    this.disbursementSchedule = fieldData.disbursement_schedule;
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

                this.$refs.settingsWrapper.scrollIntoView({ behavior: 'smooth' });
            },
            setWithdrawMethods() {
                if ( 'withdraw_methods' in this.settingValues.dokan_withdraw ) {
                    this.withdrawMethods = {...this.settingValues.dokan_withdraw.withdraw_methods};
                }
            },
            setWithdrawDisbursementSchedule() {
                if ( 'disbursement_schedule' in this.settingValues.dokan_withdraw ) {
                    this.disbursementSchedule = {...this.settingValues.dokan_withdraw.disbursement_schedule};
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

                return Swal.fire({
                    title: this.__( 'Withdraw Method Changed', 'dokan-lite' ),
                    text: this.__( 'Do you want to send an announcement to vendors about the removal of currently active payment method?', 'dokan-lite' ),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: this.__('Save & send announcement', 'dokan-lite'),
                    cancelButtonText: this.__( 'Save only', 'dokan-lite' ),
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });
            },

            async setDisbursementScheduleChangeAnnouncementAction( fieldData, section ) {
                if ( ! ( 'disbursement_schedule' in fieldData ) || 'dokan_withdraw' !== section ) {
                    return Promise.resolve( {value: false} );
                }

                const diff = this.getDifference( this.disbursementSchedule, fieldData.disbursement_schedule );

                if ( Object.keys( diff ).length === 0 ) {
                    return Promise.resolve({value: false});
                }

                return Swal.fire({
                    title: this.__( 'Disbursement Schedule Updated', 'dokan-lite' ),
                    text: this.__( 'Do you want to inform your vendors about the removal of the previous disbursement schedule by sending them an announcement?', 'dokan-lite' ),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: this.__('Save and Send Announcement', 'dokan-lite'),
                    cancelButtonText: this.__( 'Save Only', 'dokan-lite' ),
                    allowOutsideClick: false,
                    allowEscapeKey: false,
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

                // Check for custom validation errors first
                if ( this.validationErrors && this.validationErrors.length > 0 ) {
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

                                if ( 'flat' === value['commission_type'] || 'percentage' === value['commission_type'] || 'combine' === value['commission_type'] || 'fixed' === value['commission_type'] ) {
                                    this.errors = this.arrayRemove( this.errors, 'commission_category_based_values' );
                                }

                                if ( 'category_based' === value['commission_type'] ) {
                                    this.errors = this.arrayRemove( this.errors, 'admin_percentage' );
                                    this.errors = this.arrayRemove( this.errors, 'additional_fee' );
                                }
                            }
                        }

                        if ( field in value && 'category_based' === value['commission_type'] ) {
                            let alreadyAdded = ! this.errors.includes( field );

                            // Validate the commission_category_based_values
                            if (
                                'commission_category_based_values' in value &&
                                typeof value['commission_category_based_values'] === 'object' &&
                                value?.commission_category_based_values?.all &&
                                value?.commission_category_based_values?.all?.flat &&
                                String( value?.commission_category_based_values?.all?.flat ).length > 0 &&
                                value?.commission_category_based_values?.all?.percentage &&
                                String( value?.commission_category_based_values?.all?.percentage ).length > 0 &&
                                alreadyAdded
                            ) {
                                this.errors = this.arrayRemove( this.errors, 'commission_category_based_values' );
                            } else {
                                this.errors.push( 'commission_category_based_values' );
                            }
                        }
                    } );
                } );

                // Check both required field errors and validation errors
                if ( this.errors.length < 1 && this.validationErrors.length < 1 ) {
                    return true;
                }

                return false;
            },

            arrayRemove( array, value ) {
               return array.filter( ( element ) => {
                   return element !== value;
               });
            },

            addValidationError( error ) {
                // Remove any existing error for the same field first
                this.validationErrors = this.validationErrors.filter( e => e.name !== error.name );
                // Add the new validation error
                this.validationErrors.push( error );
            },

            removeValidationError( fieldName ) {
                // Remove validation error for the specified field
                this.validationErrors = this.validationErrors.filter( e => e.name !== fieldName );
            },

            toggleLoadingState() {
                this.showLoading = ! this.showLoading;
            },

            clearSearch() {
                this.searchText = '';
                this.showSuggestions = false;
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

                if ( ! this.awaitingSearch ) {
                    setTimeout( () => {
                        let searchText = this.$refs.searchInSettings.value;

                        // If more than two (space/tab) found, replace with space > trim > lowercase.
                        searchText = searchText.replace( /\s\s+/g,' ' ).trim().toLowerCase();

                        // Create an empty string search first to resolve all previous-state issues.
                        this.doSearch( '' );

                        // Search now with searchText.
                        this.doSearch( searchText );
                        this.awaitingSearch = false;
                        this.showSuggestions= true;
                    }, 1000 );
                }

                this.awaitingSearch = true;
            },

            doSearch(searchText) {
                const self = this;
                const settingFields = {};
                const filteredSettingSections = [];
                const settingSections = [];
                const dokanSettingFields = dokan.settings_fields;
                const dokanSettingSections = dokan.settings_sections;

                Object.keys( dokanSettingFields ).forEach( function( section, index ) {
                    Object.keys( dokanSettingFields[section] ).forEach( function( field ) {
                        let label = '';

                        // Append section field label and description.
                        if ( 'sub_section' !== dokanSettingFields[section][field].type ) {
                            label += ` ${dokanSettingFields[section][field]['label']} ${dokanSettingFields[section][field]['desc']}`;
                        }

                        // Append section label and description.
                        Object.keys( dokanSettingSections ).forEach( function ( foundSectionIndex ) {
                            const foundSection = dokanSettingSections[ foundSectionIndex ];
                            if ( foundSection?.id === section ) {
                                label += ` ${foundSection.title} ${foundSection.description} ${foundSection.settings_description}`;
                            }
                        } );

                        // Make the label lowercase, as `searchText` is also like that.
                        label = label.toLocaleLowerCase();

                        if ( label && label.includes(searchText) ) {
                            if (!settingFields[section]) {
                                settingFields[section] = {};
                            }

                            settingFields[section][field] = dokanSettingFields[section][field];

                            if ( filteredSettingSections.indexOf(section) === -1 ) {
                                filteredSettingSections.push(section);
                            }
                        }
                    } );
                } );

                let currentTab = 0;
                Object.keys(dokan.settings_sections).forEach((section) => {
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
                this.$root.$emit('reinitWpTextEditor');
            },

            scrollToTop() {
                this.$refs.settingsWrapper.scrollIntoView({ behavior: 'smooth' });
            },

            handleScroll() {
                if ( this.$route.name === 'Settings' && this.$refs.backToTop ) {
                    this.$refs.backToTop.style.transform = window.scrollY > ( document.body.scrollHeight - 800 ) ? 'scale(1)' : 'scale(0)';
                }
            },

            updateDocumentWidth() {
                this.screenWidth = window.document.documentElement.clientWidth;
            },
            openMobileDrawer() {
                this.showMobileDrawer = true;
                // Clear search text when opening drawer
                this.searchText = '';
                const settingsWrap = document.querySelector('.dokan-settings-wrap');
                settingsWrap.style.zIndex = 9999;
                this.validateBlankSearch();
            },

            closeMobileDrawer() {
                this.showMobileDrawer = false;
                const settingsWrap = document.querySelector('.dokan-settings-wrap');
                settingsWrap.style.zIndex = 1;
            },
            handleSectionClick(section) {
                this.changeTab(section);
                this.searchText = '';
            }

        },

        created() {
            this.fetchSettingValues();

            this.currentTab = 'dokan_general';
            if ( typeof(localStorage) !== 'undefined' ) {
                this.currentTab = localStorage.getItem("activetab") ? localStorage.getItem("activetab") : 'dokan_general';
            }

            this.$root.$on( 'onFieldSwitched', ( value, fieldName ) => {
                if ( 'on' === value && ( 'dokan_general' in this.settingValues ) && 'data_clear_on_uninstall' === fieldName ) {
                    Swal.fire({
                        icon              : 'warning',
                        html              : this.__( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently after deleting the Dokan plugin. You will not be able to recover your lost data unless you keep a backup. Do you want to continue?', 'dokan-lite' ),
                        title             : this.__( 'Are you sure?', 'dokan-lite' ),
                        showCancelButton  : true,
                        cancelButtonText  : this.__( 'Cancel', 'dokan-lite' ),
                        confirmButtonText : this.__( 'Okay', 'dokan-lite' ),
                    }).then( ( response ) => {
                        if ( response.dismiss ) {
                            this.settingValues.dokan_general.data_clear_on_uninstall = 'off';
                            this.$emit( 'switcHandler', 'data_clear_on_uninstall', this.settingValues.dokan_general.data_clear_on_uninstall );
                        }
                    });
                }

                if ( ( 'dokan_selling' in this.settingValues ) && 'reset_sub_category_when_edit_all_category' === fieldName ) {
                    const confirmTitle = 'on' === value ? this.__( 'Enable Commission Inheritance Setting?', 'dokan-lite' ) : this.__( 'Disable Commission Inheritance Setting?', 'dokan-lite' );
                    const htmlText = 'on' === value ? this.__( 'Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.', 'dokan-lite' ) : this.__( 'Subcategories will maintain their independent commission rates when parent category rates are changed.', 'dokan-lite' );
                    const confirmBtnText = 'on' === value ? this.__( 'Enable', 'dokan-lite' ) : this.__( 'Disable', 'dokan-lite' );
                    const updatableValue = 'on' === value ? 'off' : 'on';

                    Swal.fire({
                        icon              : 'warning',
                        html              : htmlText,
                        title             : confirmTitle,
                        showCancelButton  : true,
                        cancelButtonText  : this.__( 'Cancel', 'dokan-lite' ),
                        confirmButtonText : confirmBtnText,
                    }).then( ( response ) => {
                        if ( response.dismiss ) {
                            this.settingValues.dokan_selling.reset_sub_category_when_edit_all_category = updatableValue;
                            this.$emit( 'switcHandler', 'reset_sub_category_when_edit_all_category', this.settingValues.dokan_selling.reset_sub_category_when_edit_all_category );
                        }
                    });
                }
            });

            // Scroll into specific setting field.
            this.$root.$on( 'scrollToSettingField', ( fieldId = '', sectionId = '' ) => {
                if ( sectionId ) {
                    let section = dokan.settings_sections.find( item => item.id === sectionId );

                    if ( section ) {
                        this.changeTab( section );
                    }
                }

                this.$nextTick( () => {
                    if ( this.$refs[fieldId] && Array.isArray( this.$refs[fieldId] ) ) {
                        this.$refs[fieldId].forEach( item => {
                            item.$el && item.$el.scrollIntoView( { behavior: 'smooth' } );
                        } );
                    }
                });
            });

            this.settingSections = dokan.settings_sections;
            this.settingFields   = dokan.settings_fields;
            window.addEventListener( 'scroll', this.handleScroll );
        },
        mounted() {
            this.$root.$on('setting-submit-status', ( status ) => {
                this.disableSubmit = status;
            } );

            this.updateDocumentWidth();
            window.addEventListener('resize', this.updateDocumentWidth);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.updateDocumentWidth);
        }
    };

</script>

<style lang="less">

    .dokan-settings-wrap {
        border: 1px solid #c8d7e1;
        display: flex;
        padding: 20px;
        position: relative;
        background: #fff;
        padding-bottom: 100px;
        scroll-margin-top: 65px;
        .dokan-settings-menu-toggle-btn {
            border: 1px solid #e9e9ea;
        }
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
            margin-right: 15px;
        }

        div.nav-tab-wrapper {
            //width: 340px;
            background: #F9FAFB;
            box-sizing: border-box;
            margin-right: 12px;
            border-bottom: none;
            border-top-color: #cecaca85;

            .nav-section {
                padding: 14px 16px 30px 24px;
            }

            .nav-tab {
                color: #052B74;
                float: none;
                margin: 0;
                border: none;
                cursor: pointer;
                display: flex;
                padding: 18px;
                font-size: 15px;
                transition:none;
                background: transparent;
                font-weight: bold;
                border-bottom: 1px solid #e9e9ea;
                transition-property: none;
                white-space: normal;

                img {
                    width: 20px;
                    height: 20px;
                    margin: 3px 15px 0 0;
                }

                .nav-content {
                    .nav-title {
                        line-height: 22px;
                        text-transform: uppercase;
                    }

                    .nav-description {
                        color: #686666;
                        font-size: 10px;
                        line-height: 14px;
                        font-weight: 500;
                        text-transform: uppercase;
                    }
                }

                &:focus,
                &:active {
                    box-shadow: none;
                    outline: 0;
                }

                &.nav-tab-active {
                    width: 100%;
                    color: rgba(3, 58, 163, 0.81);
                    position: relative;
                    transition: .3s linear;
                    background: #fff !important;
                    //box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                    transition-property: none;

                    &:before {
                        content: '';
                        position: absolute;
                        left: 0px;
                        width: 4px;
                        background-color: #246EFE;
                        height: 100%;
                        top: 0;
                    }

                }

                &:last-child {
                    border-bottom: 0;
                }
            }
        }

        .metabox-holder {
            flex: 3;
            padding: 0 6px 75px 3% !important;
            position: relative;

            .settings-header {
                display: flex;
                margin-bottom: 50px;
                justify-content: space-between;

                .settings-content {
                    flex: 4;

                    .settings-title {
                        margin: 30px 0 20px 0;
                        font-size: 22px;
                        line-height: 26px;
                        font-family: Roboto, sans-serif;
                        margin-bottom: 12px;
                    }

                    .settings-description {
                        color: #000;
                        margin: 0;
                        font-size: 16px;
                        font-weight: 300;
                        line-height: 24px;
                        font-family: Roboto, sans-serif;
                    }
                }

                .settings-document-button {
                    flex: 2.5;
                    text-align: right;
                    margin-top: 35px;

                    a.doc-link {
                        color: #033AA3D9;
                        border: 1px solid #f3f4f6;
                        padding: 10px 15px;
                        font-size: 12px;
                        background: #FFF;
                        box-sizing: border-box;
                        box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.1);
                        font-family: Roboto, sans-serif;
                        line-height: 15px;
                        border-radius: 6.56px;
                        text-decoration: none;

                        &:hover {
                            background: #033aa30f;
                        }
                    }
                }
            }

            .group {
                .form-table {
                    .dokan-settings-fields {
                        .dokan-settings-field-type-sub_section,
                        .dokan-settings-field-type-disbursement_sub_section {
                            border-bottom: 1px solid #f3f4f6;

                            .sub-section-styles {
                                margin-top: 20px;
                                margin-bottom:0;
                                padding: 20px;
                                background: #f9fafb;
                            }
                        }

                        div {
                            &:not(.dokan-settings-field-type-sub_section) {
                                .field_contents {
                                    border: 1px solid #f3f4f6;
                                    border-top: none;
                                }
                            }
                        }

                        > div {
                            &:not(.dokan-settings-field-type-sub_section) {
                                &:first-child {
                                    border-top: 1px solid #f3f4f6;
                                }
                            }
                        }
                    }
                }
            }

            .back-to-top {
                width: 44px;
                right: 75px;
                height: 44px;
                bottom: 150px;
                cursor: pointer;
                position: fixed;
                transition: .1s linear;
                transform: scale(0);
                box-shadow: 0px 0px 10px 0px #0000001F;
                border-radius: 50%;
                background-color: #fff;

                img {
                    top: 50%;
                    left: 50%;
                    position: absolute;
                    transform: translate(-50%, -50%);
                }

                &:hover {
                    transform: scale(1.05);
                }
            }

            &:before {
                top: 0;
                left: 0;
                width: 1px;
                height: 100%;
                content: "";
                position: absolute;
                background: #fff;
            }
        }

        .radio-image-container {
            padding: 20px 0;
            display: grid;
            grid-row-gap: 2.6%;
            grid-column-gap: 3.2%;

            .radio-image {
                display: block;
                width: 50%;
                width: 100%;
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

        .radio-image-container {
            grid-template-columns: repeat(2, 1fr);
        }

        .search-section {
            .search-box {
                input {
                    width: 100%;
                    height: 48px;
                    border: none;
                    display: block;
                    padding: 0 45px 0 0;
                    background: transparent;
                    font-weight: 400;
                    font-family: Roboto, sans-serif;

                    &:focus {
                        outline: none;
                        box-shadow: none;
                        border-color: transparent;
                    }
                }

                .dashicons {
                    &.dashicons-search {
                        font-size: 1.5rem;
                    }

                    &.dashicons-no-alt {
                        cursor: pointer;
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);

                        &:hover {
                            color: #d43f3a;
                        }
                    }
                }
            }
            color: rgba(60, 60, 67, 0.6);
            filter: drop-shadow(0px 0.0869484px 0.260845px rgba(0, 0, 0, 0.1)) drop-shadow(0px 0.869484px 1.73897px rgba(0, 0, 0, 0.2));
            margin: 8px 0px 14px;
            display: flex;
            position: relative;
            background: #FFF;
            align-items: center;
            border-radius: 5px;

            .dashicons.dashicons-search {
                font-size: 26px;
                margin-left: 15px;
                line-height: 20px;
                letter-spacing: 0.434742px;
            }

            .dashicons.dashicons-no-alt {
                position: absolute;
                top: 50%;
                right: 5px;
                cursor: pointer;
                color: #000;
                font-size: 25px;
                transform: translate(0%, -60%);
                &:hover {
                    color: #d43f3a;
                }
            }

            .dokan-admin-search-settings {
                width: 100%;
                border: 0;
                height: 48px;
                display: block;
                padding: 0 45px 0 0;
                background: #FFF;
                border-top: 0;
                font-weight: 400;
                font-family: Roboto, sans-serif;
            }

            input[type="text"]:focus {
                border-color: transparent;
                outline: none;
                box-shadow: none;
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

    .submit {
        margin-top: 40px !important;
        text-align: right !important;

        .button {
            color: #FFFFFF;
            padding: 10px 15px;
            font-size: 15px;
            transition: .3s;
            background: #5a92ff;
            font-style: normal;
            font-family: 'Roboto', sans-serif;
            font-weight: 800;
            line-height: 17px;
            border-color: transparent;
            border-radius: 4.46803px;
        }
    }



    @media only screen and (max-width: 768px) {
        .dokan-settings-wrap {
            .nav-tab-wrapper {
                .nav-tab {
                    .nav-content {
                        .nav-title {
                            font-size: 10px;
                        }

                        .nav-description {
                            font-size: 8px !important;
                        }
                    }
                }
            }

            .metabox-holder {
                width: 100%;
                padding: 0 !important;
                .settings-header {
                    .settings-content {
                        .settings-title {
                            padding-left: 0;
                        }
                    }
                }
            }

            .slide-enter-active, .slide-leave-active {
                transition: transform 0.3s ease-out;
            }
            .slide-enter, .slide-leave-to {
                transform: translateX(-100%);
            }
            .dokan-settings-wrap {
                    .nav-tab-wrapper {
                        .mobile-settings-list {
                            margin-top: 1rem;

                            .setting-section {
                                &.active {
                                    border-left: 4px solid #246EFE;
                                }

                                &:hover {
                                    background-color: #f9fafb;
                                }
                            }
                        }
                    }
                }
            }
        }




</style>
