<template>
    <div class="tools-page">
        <h1 class="wp-heading-inline">{{ __( 'Tools Page', 'dokan-lite' ) }}</h1>

        <AdminNotice></AdminNotice>

        <postbox v-for="(type, key) in sections" :key="key" :title="type.name">
            <p v-text="type.desc"></p>

            <div v-if="type.action && showBar === type.action">
                <progressbar :value="progressValue"></progressbar>
            </div>

            <!-- Custom-rendered section (e.g. Pro's Distance Matrix inputs) -->
            <component :is="type.component" v-if="type.component" />

            <div class="mt-2" v-if="key === 'create_pages' && allPageStatus.exists">
                <a class="button button-disabled">{{ __( 'All Pages Created', 'dokan-lite' ) }}</a>
            </div>
            <div class="mt-2" v-else-if="type.disabled">
                <a class="button button-disabled" v-text="type.button"></a>
            </div>
            <div class="mt-2" v-else-if="type.action">
                <a class="button button-primary" v-text="type.button" @click="doAction( type.action, type )"></a>
            </div>
        </postbox>
    </div>
</template>

<script>
let Postbox     = dokan_get_lib( 'Postbox' );
let Progressbar = dokan_get_lib( 'Progressbar' );
let AdminNotice = dokan_get_lib( 'AdminNotice' );

export default {
    name: 'Tools',

    components: {
        Postbox,
        Progressbar,
        AdminNotice,
    },

    data() {
        return {
            progressValue: 0,
            showBar: '',
            allPageStatus: {
                data: {
                    action: 'check_all_dokan_pages_exists',
                },
                exists: false,
                loading: false,
            },
        };
    },

    computed: {
        // Free sections, plus any injected by Dokan Pro / 3rd parties. Pro splices
        // its sections in before `clear_dokan_caches` so the free button stays last.
        sections() {
            return dokan.hooks.applyFilters( 'dokan_admin_tools_sections', this.getFreeTypes(), this );
        },
    },

    created() {
        this.checkAllPages();
    },

    methods: {
        getFreeTypes() {
            return {
                create_pages: {
                    name: this.__( 'Page Installation', 'dokan-lite' ),
                    desc: this.__( 'Clicking this button will create required pages for the plugin.', 'dokan-lite' ),
                    button: this.__( 'Install Dokan Pages', 'dokan-lite' ),
                    action: 'create_pages',
                },
                clear_dokan_caches: {
                    name: this.__( 'Clear Dokan Caches', 'dokan-lite' ),
                    desc: this.__( 'Flush all Dokan cached data (vendor stats, reports, product counts, etc.). Use this if cached values look stale — caches rebuild automatically on the next load.', 'dokan-lite' ),
                    button: this.__( 'Clear Caches', 'dokan-lite' ),
                    action: 'clear_dokan_caches',
                },
            };
        },

        doAction( action, type ) {
            switch ( action ) {
                case 'create_pages':
                    this.createPages();
                    break;
                case 'clear_dokan_caches':
                    this.clearDokanCaches();
                    break;
                default:
                    // Hand off to Dokan Pro / 3rd parties for their injected actions.
                    dokan.hooks.doAction( 'dokan_admin_tools_do_action', action, this, type );
                    break;
            }
        },

        createPages() {
            let self = this;

            if ( self.allPageStatus.loading ) {
                return;
            }

            self.allPageStatus.loading = true;

            jQuery.post( dokan.ajaxurl, { action: 'create_pages' }, function ( res ) {
                if ( res.success ) {
                    self.$notify( {
                        title: self.__( 'Success!', 'dokan-lite' ),
                        text: res.data.message,
                        type: 'success',
                    } );
                    self.allPageStatus.exists = true;
                } else {
                    self.$notify( {
                        title: self.__( 'Failure!', 'dokan-lite' ),
                        text: self.__( 'Something went wrong.', 'dokan-lite' ),
                        type: 'warn',
                    } );
                }

                self.allPageStatus.loading = false;
            } );
        },

        checkAllPages() {
            let self = this;

            jQuery.post( dokan.ajaxurl, this.allPageStatus.data, function ( res ) {
                self.allPageStatus.exists = res.data.all_pages_exists === '1';
            } );
        },

        clearDokanCaches() {
            let self = this;

            wp.ajax.post( 'dokan_clear_caches', { nonce: dokan.nonce } ).done( ( response ) => {
                self.$notify( {
                    title: self.__( 'Success!', 'dokan-lite' ),
                    text: response.message,
                    type: 'success',
                } );
            } ).fail( ( jqXHR ) => {
                self.$notify( {
                    title: self.__( 'Failure!', 'dokan-lite' ),
                    text: jqXHR.responseJSON ? jqXHR.responseJSON.data : self.__( 'Something went wrong.', 'dokan-lite' ),
                    type: 'warn',
                } );
            } );
        },

        showProgressBar( action ) {
            this.showBar = action;
        },
    },
};
</script>
