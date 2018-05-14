<template>
    <div class="dokan-settings" v-if="isLoaded">
        <h2 style="margin-bottom: 15px;">Settings</h2>

        <div class="dokan-settings-wrap">
            <h2 class="nav-tab-wrapper">
                <template v-for="section in settingSections">
                    <a href="#" class="nav-tab" :class="{ 'nav-tab-active': currentTab === section.id }" id="dokan_general-tab" @click.prevent="changeTab(section)"><span class="dashicons" :class="section.icon"></span> {{ section.title }}</a>
                </template>
            </h2>

            <div class="metabox-holder">
                <template v-for="(fields, index) in settingFields">
                    <div :id="index" class="group" v-show="currentTab===index">
                        <form method="post" action="options.php">
                            <input type="hidden" name="option_page" :value="index">
                            <input type="hidden" name="action" value="update">
                            <h2>{{ showSectionTitle( index ) }}</h2>
                            <table class="form-table">
                                <fields v-for="(field, fieldId) in fields" :section-id="index" :id="fieldId" :field-data="field" :field-value="settingValues[index]"></fields>
                            </table>
                            <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>
                        </form>
                    </div>
                </template>
            </div>

        </div>
    </div>

</template>

<script>
    import Fields from "admin/components/Fields.vue"

    export default {

        name: 'Settings',

        components: {
            Fields
        },

        data () {
            return {
                isLoaded: false,
                currentTab: null,
                settingSections: [],
                settingFields: {},
                settingValues: {}
            }
        },

        computed: {

        },

        methods: {
            changeTab( section ) {
                var activetab = '';
                this.currentTab = section.id;

                if ( typeof( localStorage ) != 'undefined' ) {
                    localStorage.setItem( "activetab", this.currentTab );
                }
            },

            showSectionTitle( index ) {
                return _.findWhere( this.settingSections, { id:index} ).title;
            },

            fetchSettingValues() {
                var self = this,
                    data = {
                        action: 'dokan_get_setting_values',
                        nonce: dokan.nonce
                    };

                $.post( dokan.ajaxurl, data, function(resp) {
                    if ( resp.success ) {
                        self.settingValues = resp.data;
                        self.isLoaded = true;
                    }
                });
            }
        },

        created() {
            this.fetchSettingValues();

            this.currentTab = 'dokan_general';
            if ( typeof(localStorage) != 'undefined' ) {
                this.currentTab = localStorage.getItem("activetab");
            }

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

</style>