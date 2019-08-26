<template>
    <div id="dokan-upgrade-notice" :class="[ 'wp-clearfix notice', ! updateCompleted ? 'notice-info' : 'updated' ]" :style="containerStyle">
        <div id="dokan-upgrade-notice-icon">
            <img :src="dokanLogo" :alt="__( 'Dokan Logo', 'dokan-lite' )">
        </div>
        <div id="dokan-upgrade-notice-message">
            <template v-if="! updateCompleted">
                <div id="dokan-upgrade-notice-title">
                    {{ __( 'Dokan Data Update Required', 'dokan-lite' ) }}
                </div>
                <div id="dokan-upgrade-notice-content">
                    <p v-if="! showConfirmation">{{ __( 'We need to update your install to the latest version', 'dokan-lite' ) }}</p>
                    <p v-else class="text-danger">{{ __( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ) }}</p>
                </div>
                <div id="dokan-upgrade-notice-buttons">
                    <button
                        v-if="! isUpgrading && ! showConfirmation"
                        class="button button-primary"
                        @click="showConfirmation = true"
                        v-text="__( 'Update', 'dokan-lite' )"
                    />
                    <template v-else>
                        <button
                            class="button button-primary"
                            :disabled="isUpgrading"
                            @click="doUpgrade"
                            v-text="__( 'Yes, Update Now', 'dokan-lite' )"
                        />
                        <button
                            class="button"
                            :disabled="isUpgrading"
                            @click="showConfirmation = false"
                            v-text="__( 'No, Cancel', 'dokan-lite' )"
                        />
                    </template>
                </div>
            </template>
            <template v-else>
                <div id="dokan-upgrade-notice-title">
                    {{ __( 'Dokan Data Updated Successfully!', 'dokan-lite' ) }}
                </div>
                <div id="dokan-upgrade-notice-content">
                    <p>{{ __( 'All data updated successfully. Thank you for using Dokan.', 'dokan-lite' ) }}</p>
                </div>
                <div id="dokan-upgrade-notice-buttons">
                    <button
                        class="button"
                        @click="refreshPage"
                        v-text="__( 'Close', 'dokan-lite' )"
                    />
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import $ from 'jquery';
    import { __ } from '@/utils/i18n';

    export default {
        data() {
            return {
                isUpgrading: false,
                showConfirmation: false,
                updateCompleted: false
            };
        },

        computed: {
            dokanLogo() {
                return `${dokan.urls.assetsUrl}/images/dokan-logo-small.svg`;
            },

            containerStyle() {
                return {
                    backgroundImage: `url(${dokan.urls.assetsUrl}/images/dokan-notification-banner.svg)`,
                };
            }
        },

        methods: {
            doUpgrade() {
                this.isUpgrading = true;

                $.ajax( {
                    url: dokan.ajaxurl,
                    method: 'post',
                    dataType: 'json',
                    data: {
                        action: 'dokan_do_upgrade',
                        _wpnonce: dokan.nonce,
                    },
                } ).always( () => {
                    this.isUpgrading = false;
                } ).done( () => {
                    this.updateCompleted = true;
                } );
            },

            refreshPage() {
                window.location.reload();
            }
        }
    };
</script>

<style lang="less">
    .text-danger {
        color: #dc3232;
    }

    #dokan-upgrade-notice {
        box-sizing: border-box;
        background-repeat: no-repeat;
        background-position: bottom right;
        transition: all .5s;

        &:after {
            content: "";
            display: table;
            clear: both;
        }

        & * {
            box-sizing: border-box;
        }
    }

    #dokan-upgrade-notice-icon {
        width: 65px;
        float: left;
        padding: 12px 12px 12px 0;

        img {
            width: 100%;
        }
    }

    #dokan-upgrade-notice-message {
        float: left;
        width: calc(100% - 65px);
    }

    #dokan-upgrade-notice-title {
        padding-top: 12px;
        font-size: 15px;
        font-weight: 600;
    }

    #dokan-upgrade-notice-buttons {
        padding-bottom: 12px;
    }
</style>
