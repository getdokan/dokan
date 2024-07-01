<template>
    <div>
        <h1>{{ __( 'Import dummy data', 'dokan-lite' ) }}</h1>
        <div v-if="! statusLoader" class="dokan-importer-wrapper">
            <ol class="dokan-importer-progress-steps">
                <li class="active before:box-content">{{ __( 'Import', 'dokan-lite' ) }}</li>
                <li class='before:box-content' :class="done ? 'active' : ''">{{ __( 'Done!', 'dokan-lite' ) }}</li>
            </ol>
            <div v-if="'' != errorMsg" class="error inline"><p>{{ errorMsg }}</p></div>
            <div v-if="! done" class="dokan-importer">
                <header>
                    <h2 class='text-xl font-semibold m-[1em] ml-0 mr-0'>{{ __( 'Import dummy vendors and products', 'dokan-lite' ) }}</h2>
                    <p class='m-[1em] ml-0 mr-0'>{{ __( 'This tool allows you to import vendor and some products for vendors to your marketplace.', 'dokan-lite' ) }}</p>
                </header>
                <section>
                    <div>
                        <progress class="dokan-dummy-data-progress-bar" max="100" :value="progress"></progress>
                    </div>
                </section>
                <div class="dokan-importer-action">
                    <button @click="importBtnHandler" class="dokan-import-continue-btn" :disabled="loading" :class="loading ? 'is-loading' : ''">{{ __( 'Run the importer', 'dokan-lite' ) }}</button>
                </div>
            </div>
            <div v-else class="dokan-importer">
                <section class="import-done">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100" height="100">
                        <path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM371.8 211.8C382.7 200.9 382.7 183.1 371.8 172.2C360.9 161.3 343.1 161.3 332.2 172.2L224 280.4L179.8 236.2C168.9 225.3 151.1 225.3 140.2 236.2C129.3 247.1 129.3 264.9 140.2 275.8L204.2 339.8C215.1 350.7 232.9 350.7 243.8 339.8L371.8 211.8z" fill="#1BAC9E"/>
                    </svg>
                    <p>
                        {{__( 'Import complete!', 'dokan-lite' )}}
                    </p>
                    <div class="links">
                        <router-link :to="{ name: 'Vendors', query: { status: 'all' }}" exact >{{ __( 'View vendors', 'dokan-lite' ) }}</router-link>
                        &nbsp;
                        <a :href="getProductsPageUrl()">{{ __( 'View products', 'dokan-lite' ) }}</a>
                    </div>
                </section>
                <div class="dokan-importer-action">
                    <button @click="clearAllDummyData" class="cancel-btn dokan-import-continue-btn" :disabled="loading" :class="loading ? 'is-busy' : ''">{{ __( 'Clear dummy data', 'dokan-lite' ) }}</button>
                </div>
            </div>
        </div>
        <div v-else class="dokan-importer-wrapper">
            <div class="dokan-importer">
                <header>
                    <span class="loader-title skeleton-loader"></span>
                    <span class="loader-description skeleton-loader"></span>
                </header>
                <section>
                    <div>
                        <span class="loader-loader skeleton-loader"></span>
                    </div>
                </section>
                <div class="dokan-importer-action">
                    <span class="loader-btn skeleton-loader"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { parse } from "papaparse";

export default {
    name: 'DummyData',

    data(){
        return {
            errorMsg: '',
            csvFileUrl: dokan.urls.dummy_data,
            progress: 0,
            dummyData: [],
            loading: true,
            allVendors: [],
            allProducts: [],
            done: false,
            statusLoader: true,
            vendorsDataToRemove: [
                'sku',
                'status',
                'catalog_visibility',
                'short_description',
                'date_on_sale_from',
                'date_on_sale_to',
                'tax_status',
                'tax_class',
                'stock_status',
                'manage_stock',
                'stock_quantity',
                'children',
                'backorders',
                'sold_individually',
                'reviews_allowed',
                'purchase_note',
                'sale_price',
                'regular_price',
                'category_ids',
                'tag_ids',
                'shipping_class_id',
                'raw_image_id',
                'raw_gallery_image_ids',
                'download_limit',
                'download_expiry',
                'parent_id',
                'grouped_products',
                'upsell_ids',
                'cross_sell_ids',
                'product_url',
                'button_text',
                'menu_order',
                'virtual',
                'downloadable',
                'status',
                'attribute_1_name',
                'attribute_1_value',
                'attribute_1_visible',
                'attribute_1_global',
                'attribute_2_name',
                'attribute_2_value',
                'attribute_2_visible',
                'attribute_2_global',
                '_wpcom_is_markdown',
                'download1_name',
                'download_1_url',
                'download_2_name',
                'download_2_url',
                'vendor',
            ],
            productsDataToRemove: [
                'email',
                'password',
                'store_name',
                'social',
                'payment',
                'phone',
                'show_email',
                'address',
                'location',
                'banner',
                'icon',
                'gravatar',
                'show_more_tpab',
                'show_ppp',
                'enable_tnc',
                'store_tnc',
                'show_min_order_discount',
                'store_seo',
                'dokan_store_time',
                'enabled',
                'trusted',
                'attribute_1_name',
                'attribute_1_value',
                'attribute_1_visible',
                'attribute_1_global',
                'attribute_2_name',
                'attribute_2_value',
                'attribute_2_visible',
                'attribute_2_global',
            ]
        }
    },

    created() {
        this.loadImportStatus();
        this.loadCsvFile();
    },

    methods: {
        // Loads and sets if import already successfully.
        loadImportStatus() {
            this.statusLoader = true;
            let self = this;

            dokan.api.get(`/dummy-data/status`, {
                'nonce': dokan.nonce,
            })
            .done((response, status, xhr) => {
                if ( response.import_status == 'yes' ) {
                    self.done = true;
                }
                self.statusLoader = false;
            })
            .fail( ( jqXHR ) => {
                let message = window.dokan_handle_ajax_error( jqXHR );
                if ( message ) {
                    Swal.fire( message, '', 'error' );
                }
            });
        },

        // Resets data states
        resetDataState() {
            this.dummyData   = [];
            this.allVendors  = [];
            this.allProducts = [];
        },

        // Loads csv file and parse csv data.
        loadCsvFile() {
            let self     = this;
            self.loading = true;
            self.resetDataState();

            jQuery.ajax( {
                type: 'GET',
                url: this.csvFileUrl,
                data: {},
                success: function( data ){
                    parse( data, {
                        header: true,
                        complete: function ( results ) {
                            self.loading   = false;
                            self.dummyData = results.data;
                            self.loadCsvData();
                        },
                    } );

                    self.loading = false;
                }
            } );
        },

        // Lodes and sates vendor and products data.
        loadCsvData(){
            this.dummyData.forEach( item => {
                if ( 'vendor' === item.type ) {
                    this.allVendors.push( this.formatVendorData( item ) );
                } else {
                    this.allProducts.push( this.formatProductData( item ) );
                }
            } );
        },

        // Request ajax to import data to database.
        requestToImport( data ){
            let self = this;

            dokan.api.post(`/dummy-data/import`, data)
            .done((response, status, xhr) => {
                self.handleImport( response.vendor_index );
                self.updateProgress( response.vendor_index );
            })
            .fail( ( jqXHR ) => {
                let message = window.dokan_handle_ajax_error( jqXHR );
                if ( message ) {
                    Swal.fire(
                        self.__( 'Something went wrong', 'dokan' ),
                        message,
                        'error'
                    );
                }
            });
        },

        // Run importer button handler.
        importBtnHandler() {
            this.handleImport();
        },

        // Updates progress bar progress.
        updateProgress( numVendorSucceed ){
            this.progress = ( 100 * numVendorSucceed ) / this.allVendors.length;
        },

        // Requrests to server.
        handleImport( vendor_index = 0 ) {
            let vendorData = this.allVendors[ vendor_index ];
            if ( ! vendorData || undefined == vendorData ) {
                this.loading = false;
                this.done    = true;

                return;
            }

            let data = {
                nonce: dokan.nonce,
                vendor_data: vendorData,
                vendor_products: this.getVendorProducts( vendorData.id ),
                vendor_index: vendor_index,
                total_vendors: this.allVendors.length
            };

            this.loading = true;
            this.requestToImport( data );
        },

        // Formats data for vendor removing products data
        formatVendorData( data ) {
            this.vendorsDataToRemove.forEach( item => {
                delete(data[item]);
            } );

            return data;
        },

        // Formats products data removing vendors data.
        formatProductData( data ) {
            data.raw_attributes = [
                {
                    name: data.attribute_1_name,
                    value: data.attribute_1_value.split( ',' ),
                    visible: data.attribute_1_visible,
                    taxonomy: data.attribute_1_global,
                },
                {
                    name: data.attribute_2_name,
                    value: data.attribute_2_value.split( ',' ),
                    visible: data.attribute_2_visible,
                    taxonomy: data.attribute_2_global,
                },
            ];
            data.manage_stock = Boolean( data.manage_stock );

            this.productsDataToRemove.forEach( item => {
                delete(data[item]);
            } );

            return data;
        },

        // Returns single vendors products from all products array.
        getVendorProducts( vendorId ) {
            return this.allProducts.filter( function ( item ) {
                return item.vendor == vendorId
            } );
        },

        // Reset import state.
        resetToImport() {
            this.errorMsg = '';
            this.progress = 0;
            this.loading  = false;
            this.done     = false;
        },

        // Request to server to clear dummy data from this site.
        async clearAllDummyData() {
            let self = this;

            const answer = await dokan_sweetalert( "Are you sure? You want to remove all dummy data!", {
                action : 'confirm',
                icon : 'warning',
            } );

            if ( 'undefined' !== answer && answer.isConfirmed ) {
                self.loading = true;

                dokan.api.delete(`/dummy-data/clear`, {
                    'nonce': dokan.nonce,
                })
                .done((response, status, xhr) => {
                    dokan_sweetalert( '', {
                        toast: true,
                        icon: 'success',
                        title: response.message,
                        position: 'bottom-right',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: ( toast ) => {
                            toast.addEventListener( 'mouseenter', Swal.stopTimer )
                            toast.addEventListener( 'mouseleave', Swal.resumeTimer )
                        }
                    } );

                    self.resetToImport();
                })
                .fail( ( jqXHR ) => {
                    let message = window.dokan_handle_ajax_error( jqXHR );
                    if ( message ) {
                        Swal.fire(
                            self.__( 'Something went wrong', 'dokan' ),
                            message,
                            'error'
                        );
                    }
                });
            }
        },

        // Returns woocommerce admin products list page url.
        getProductsPageUrl() {
            return `${ dokan.urls.adminRoot }edit.php?post_type=product`;
        },
    },
}
</script>

<style lang="less" scoped>
    .dokan-importer-wrapper{
        text-align: center;
        max-width: 700px;
        margin: 40px auto;

        .skeleton-loader {
            width: 100%;
            display: block;
            background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0),
                rgba(255, 255, 255, 0.5) 50%,
                rgba(255, 255, 255, 0) 80%
                ),
                lightgray;
            background-repeat: repeat-y;
            background-size: 50px 500px;
            background-position: 0 0;
            animation: shine 1s infinite;
            border-radius: 5px;
        }
        @keyframes shine {
            to {
                background-position: 100% 0, /* move highlight to right */ 0 0;
            }
        }

        .error{
            border-radius: 5px;
        }

        .dokan-importer-progress-steps{
            padding: 0 0 24px;
            margin: 0;
            list-style: none outside;
            overflow: hidden;
            color: #ccc;
            width: 100%;
            display: inline-flex;

            & li{
                width: 50%;
                float: left;
                padding: 0 0 0.8em;
                margin: 0;
                text-align: center;
                position: relative;
                border-bottom: 4px solid #ccc;
                line-height: 1.4em;

                &::before {
                    content: "";
                    border: 4px solid #ccc;
                    border-radius: 100%;
                    width: 4px;
                    height: 4px;
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    margin-left: -6px;
                    margin-bottom: -8px;
                    background: #fff;
                }
            }

            & li.active {
                border-color: #1BAC9E;
                color: #1BAC9E;

                &::before{
                    border-color: #1BAC9E;
                }
            }
        }

        .dokan-importer{
            background: #fff;
            overflow: hidden;
            padding: 0;
            margin: 0 0 16px;
            color: #555;
            text-align: left;

            header {
                margin: 0;
                padding: 24px 24px 0;

                .loader-title{
                    width: 50%;
                    height: 20px;
                    margin-bottom: 24px;
                }

                .loader-description {
                    height: 10px;
                    margin-bottom: 10px;
                }
            }
            section {
                padding: 10px 24px 0;

                div {
                    margin: 0;
                    position: relative;
                    table-layout: fixed;
                    border-collapse: collapse;
                    width: 100%;
                    clear: both;

                    .dokan-dummy-data-progress-bar{
                        width: 100%;
                        height: 35px;
                        -webkit-appearance: none;

                        &[value]::-webkit-progress-bar {
                            background-color: #EEEEEE;
                            border: 1px solid #BCBCBC;
                            border-radius: 5px;
                        }
                        &[value]::-webkit-progress-value {
                            background-color: #1BAC9E;
                            border-radius: 5px;
                            transition: width 0.5s;
                        }
                    }

                    .loader-loader{
                        height: 35px;
                    }
                }
            }
            .import-done{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 24px 24px 0 24px;

                p {
                    font-size: 1.2rem;
                    color: #1BAC9E;
                }

                .links {
                    text-align: center;
                }
            }
            .dokan-importer-action{
                overflow: hidden;
                margin: 0;
                padding: 24px;
                line-height: 3em;

                .loader-btn {
                    height: 35px;
                    width: 150px;
                    float: right;
                }

                .dokan-import-continue-btn{
                    float: right;
                    font-size: 1.25em;
                    padding: 6px 12px;
                    line-height: 1.5em;
                    height: auto;
                    border-radius: 4px;
                    background-color: #1BAC9E;
                    border-color: #1BAC9E;
                    border: none;
                    margin: 0;
                    opacity: 1;
                    color: #FFF;
                    cursor: pointer;

                    &.is-loading {
                        background-color: rgba(27, 172, 158, .5);
                        border-color: rgba(27, 172, 158, .5);
                    }

                    &.is-busy {
                        animation: components-button__busy-animation 2500ms infinite linear;
                        opacity: 1;
                        background-size: 100px 100%;
                        background-image: linear-gradient(-45deg, #f7f6f6 33%, #e0e0e0 33%, #e0e0e0 70%, #f7f6f6 70%);
                        color: #848484;
                    }
                }

                .cancel-btn{
                    background-color: #FFFFFF;
                    border-color: #E2E2E2;
                    color: #72777C;
                    border: 1px solid #E2E2E2;
                    margin-top: 15px
                }
            }
        }
    }
</style>
