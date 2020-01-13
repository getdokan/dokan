<template>
    <div class="dokan-settings">
        <h2 style="margin-bottom: 15px;">{{ __( 'Settings', 'dokan-lite' ) }}</h2>

        <div id="setting-message_updated" class="settings-error notice is-dismissible" :class="{ 'updated' : isUpdated, 'error' : !isUpdated }" v-if="isSaved">
            <p><strong v-html="message"></strong></p>
            <button type="button" class="notice-dismiss" @click.prevent="isSaved = false">
                <span class="screen-reader-text">{{ __( 'Dismiss this notice.', 'dokan-lite' ) }}</span>
            </button>
        </div>

        <div class="dokan-settings-wrap">
            <h2 class="nav-tab-wrapper">
                <template v-for="section in settingSections">
                    <a
                        href="#"
                        :class="['nav-tab', currentTab === section.id ? 'nav-tab-active' : '']"
                        @click.prevent="changeTab(section)"
                    >
                        <span class="dashicons" :class="section.icon"></span> {{ section.title }}
                    </a>
                </template>
            </h2>

            <div class="metabox-holder">
                <template v-for="(fields, index) in settingFields" v-if="isLoaded">
                    <div :id="index" class="group" v-if="currentTab === index">
                        <form method="post" action="options.php">
                            <input type="hidden" name="option_page" :value="index">
                            <input type="hidden" name="action" value="update">
                            <table class="form-table">
                                <thead v-if="showSectionTitle(fields)">
                                    <tr class="dokan-settings-field-type-sub_section">
                                        <th colspan="2" class="dokan-settings-sub-section-title">
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

</template>

<script>
    let Loading = dokan_get_lib('Loading');
    import Fields from "admin/components/Fields.vue"

    export default {

        name: 'Settings',

        components: {
            Fields,
            Loading
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
                errors: []
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

            saveSettings( fieldData, section ) {
                if ( ! this.formIsValid( section ) ) {
                    return;
                }

                var self = this,
                    data = {
                        action : 'dokan_save_settings',
                        nonce: dokan.nonce,
                        settingsData: fieldData,
                        section: section
                    };
                self.showLoading = true;

                jQuery.post( dokan.ajaxurl, data )
                    .done( function ( response ) {
                        var settings = response.data.settings;

                        self.isSaved = true;
                        self.isUpdated = true;

                        self.message = response.data.message;

                        self.settingValues[ settings.name ] = settings.value;

                        let option;

                        for ( option in fieldData ) {
                            const fieldName = `${section}.${option}`;

                            if ( self.refreshable_props[ fieldName ] ) {
                                window.location.reload();
                                break;
                            }
                        }
                    } )
                    .fail( function ( jqXHR ) {
                        var messages = jqXHR.responseJSON.data.map( function ( error ) {
                            return error.message;
                        } );

                        alert( messages.join( ' ' ) );
                    } )
                    .always( function () {
                        self.showLoading = false;
                    } );
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
</style>
