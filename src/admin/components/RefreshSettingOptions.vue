<template>
    <button
        type="button"
        class="button button-link"
        @click.prevent="refreshSettings"
        :disabled="isRefreshing || showRefreshedMsg"
    >
        <span v-if="! isRefreshing && ! showRefreshedMsg" class="dashicons dashicons-image-rotate"></span>
        <span v-if="isRefreshing" class="refreshing-message">{{ messages.refreshing }}...</span>
        <span v-if="showRefreshedMsg" class="refresh-message-success">✓ {{ messages.refreshed }}</span>
    </button>
</template>

<script>
    export default {
        props: {
            section: {
                type: String,
                required: true,
            },
            field: {
                type: Object,
                required: true,
            },
            toggleLoadingState: {
                type: Function,
                required: true,
            },
        },

        data() {
            return {
                isRefreshing: false,
                showRefreshedMsg: false,
            };
        },

        computed: {
            messages() {
                return {
                    refreshing: this.field.refresh_options?.messages?.refreshing || this.__( 'Refreshing options', 'dokan-lite' ),
                    refreshed: this.field.refresh_options?.messages?.refreshed || this.__( 'Option refreshed!', 'dokan-lite' ),
                }
            },
        },

        methods: {
            refreshSettings() {
                this.toggleLoadingState();
                this.isRefreshing = true;

                jQuery.ajax( {
                    url: dokan.ajaxurl,
                    method: 'post',
                    dataType: 'json',
                    data: {
                        action: 'dokan_refresh_admin_settings_field_options',
                        _wpnonce: dokan.admin_settings_nonce,
                        section: this.section,
                        field: this.field.name,
                    }
                } ).done( ( response ) => {
                    response?.data?.[0] && this.setSettingOptions( response.data );
                } ).always( () => {
                    this.toggleLoadingState();
                    this.isRefreshing = false;
                } ).fail( ( jqXHR ) => {
                    jqXHR?.responseJSON?.data && alert( jqXHR.responseJSON.data );
                } );
            },

            setSettingOptions( options ) {
                this.field.options = options;
                this.showRefreshedMsg = true;
                setTimeout( () => ( this.showRefreshedMsg = false ), 3000 );
            },
        }
    };
</script>

<style lang="less" scoped>
    .button {

        &.button-link {
            padding: 0 4px;
            text-decoration: none;
            line-height: 1;

            &:hover {
                background: none;

                .dashicons {
                    opacity: 1;
                }
            }

            &:active,
            &:focus {
                background: none;
                box-shadow: none;
            }

            &:active {

                .dashicons {
                    margin-top: 3px;
                }
            }

            &[disabled] {
                background: none !important;
                pointer-events: none;
            }

            .dashicons {
                font-size: 15px;
                padding: 0;
                margin: 0;
                line-height: 1.3;
                color: #444;
                opacity: .7;
                transition: opacity .4s;
            }

            .refreshing-message {
                line-height: 1;
                color: #444;
            }

            .refresh-message-success {
                line-height: 1;
                color: #46b450;
            }
        }
    }
</style>
