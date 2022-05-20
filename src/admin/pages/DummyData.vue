<template>
    <div>
        <h1>{{ __( 'Import dummy data', 'dokan-lite' ) }}</h1>
        <div v-if="! statusLoader" class="dokan-importer-wrapper">
            <ol class="dokan-importer-progress-steps">
                <li class="active">{{ __( 'Import', 'dokan-lite' ) }}</li>
                <li :class="done ? 'active' : ''">{{ __( 'Done!', 'dokan-lite' ) }}</li>
            </ol>
            <div v-if="'' != errorMsg" class="error inline"><p>{{ errorMsg }}</p></div>
            <div v-if="! done" class="dokan-importer">
                <header>
                    <h2>{{ __( 'Import dummy vendors and products', 'dokan-lite' ) }}</h2>
                    <p>{{ __( 'This tool allows you to import vendor and some products for vendors to your market place.', 'dokan-lite' ) }}</p>
                </header>
                <section>
                    <table>
                        <tbody>
                            <tr>
                                <progress class="dokan-dummy-data-progress-bar" max="100" :value="progress"></progress>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <div class="dokan-importer-action">
                    <button @click="continueBtnHandler" class="dokan-import-continue-btn" :disabled="loading" :class="loading ? 'is-busy' : ''">{{ __( 'Run the importer', 'dokan-lite' ) }}</button>
                </div>
            </div>
            <div v-else class="dokan-importer">
                <section class="import-done">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100" height="100">
                        <path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM371.8 211.8C382.7 200.9 382.7 183.1 371.8 172.2C360.9 161.3 343.1 161.3 332.2 172.2L224 280.4L179.8 236.2C168.9 225.3 151.1 225.3 140.2 236.2C129.3 247.1 129.3 264.9 140.2 275.8L204.2 339.8C215.1 350.7 232.9 350.7 243.8 339.8L371.8 211.8z" fill="#F4624D"/>
                    </svg>
                    <p>
                        {{__( 'Import complete!', 'dokan-lite' )}}
                    </p>
                </section>
                <div class="dokan-importer-action">
                    <button @click="clearAllDummyData" class="cancel-btn dokan-import-continue-btn" :disabled="loading" :class="loading ? 'is-busy' : ''">{{ __( 'Clear dummy data', 'dokan-lite' ) }}</button>

                    <div class="links">
                        <router-link :to="{ name: 'Vendors', query: { status: 'all' }}" exact >{{ __( 'View vendors', 'dokan-lite' ) }}</router-link>
                        &nbsp;
                        <a :href="getProductsPageUrl()">{{ __( 'View products', 'dokan-lite' ) }}</a>
                    </div>
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
                    <table>
                        <tbody>
                            <tr>
                                <span class="loader-loader skeleton-loader"></span>
                            </tr>
                        </tbody>
                    </table>
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
        }
    },

    created() {
        this.loadImportStatus();
        this.loadCsvFile();
    },

    methods: {
        loadImportStatus() {
            this.statusLoader = true;
            let self = this;

            jQuery.post( dokan.ajaxurl, {
                    'action': 'dokan_dummy_data_import_status',
                    'nonce': dokan.nonce,
                },
                function ( response ) {
                    if ( response.success && response.data == 'yes' ) {
                        self.done = true;
                    }
                    self.statusLoader = false;
                }
            );
        },

        resetDataState() {
            this.dummyData   = [];
            this.allVendors  = [];
            this.allProducts = [];
        },

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
                            self.importCsvFile();
                        },
                    } );

                    self.loading = false;
                }
            } );
        },

        importCsvFile(){
            this.dummyData.forEach( item => {
                if ( 'vendor' === item.type ) {
                    this.allVendors.push( this.formatVendorData( item ) );
                } else {
                    this.allProducts.push( this.formatProductData( item ) );
                }
            } );
        },

        requestToImport( data ){
            let self = this;

            jQuery.post( dokan.ajaxurl, {
                    'action': 'dokan_dummy_data_import',
                    'nonce': dokan.nonce,
                    'csv_file_data': data
                },
                function ( response ) {
                    if ( response.success ) {
                        self.handleImport( response.data.vendor_index );
                        self.updateProgress( response.data.vendor_index );
                    }
                }
            );
        },

        continueBtnHandler() {
            this.handleImport();
        },

        updateProgress( numVendorSucceed ){
            this.progress = ( 100 * numVendorSucceed ) / this.allVendors.length;
        },

        handleImport( vendor_index = 0 ) {
            let vendorData = this.allVendors[ vendor_index ];
            if ( ! vendorData || undefined == vendorData ) {
                this.loading = false;
                this.done    = true;

                return;
            }

            let data = {
                vendor_data: vendorData,
                vendor_products: this.getVendorProducts( vendorData.id ),
                vendor_index: vendor_index,
                total_vendors: this.allVendors.length
            };

            this.loading = true;
            this.requestToImport( data );
        },

        formatVendorData( data ) {
            delete( data.sku );
            delete( data.status );
            delete( data.catalog_visibility );
            delete( data.short_description );
            delete( data.date_on_sale_from );
            delete( data.date_on_sale_to );
            delete( data.tax_status );
            delete( data.tax_class );
            delete( data.stock_status );
            delete( data.manage_stock );
            delete( data.stock_quantity );
            delete( data.children );
            delete( data.backorders );
            delete( data.sold_individually );
            delete( data.reviews_allowed );
            delete( data.purchase_note );
            delete( data.sale_price );
            delete( data.regular_price );
            delete( data.category_ids );
            delete( data.tag_ids );
            delete( data.shipping_class_id );
            delete( data.raw_image_id );
            delete( data.raw_gallery_image_ids );
            delete( data.download_limit );
            delete( data.download_expiry );
            delete( data.parent_id );
            delete( data.grouped_products );
            delete( data.upsell_ids );
            delete( data.cross_sell_ids );
            delete( data.product_url );
            delete( data.button_text );
            delete( data.menu_order );
            delete( data.virtual );
            delete( data.downloadable );
            delete( data.status );
            delete( data.attribute_1_name );
            delete( data.attribute_1_value );
            delete( data.attribute_1_visible );
            delete( data.attribute_1_global );
            delete( data.attribute_2_name );
            delete( data.attribute_2_value );
            delete( data.attribute_2_visible );
            delete( data.attribute_2_global );
            delete( data._wpcom_is_markdown );
            delete( data.download1_name );
            delete( data.download_1_url );
            delete( data.download_2_name );
            delete( data.download_2_url );
            delete( data.vendor );

            return data;
        },

        formatProductData( data ) {
            delete( data.email );
            delete( data.password );
            delete( data.store_name );
            delete( data.social );
            delete( data.payment );
            delete( data.phone );
            delete( data.show_email );
            delete( data.address );
            delete( data.location );
            delete( data.banner );
            delete( data.icon );
            delete( data.gravatar );
            delete( data.show_more_tpab );
            delete( data.show_ppp );
            delete( data.enable_tnc );
            delete( data.store_tnc );
            delete( data.show_min_order_discount );
            delete( data.store_seo );
            delete( data.dokan_store_time );
            delete( data.enabled );
            delete( data.trusted );

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

            delete( data.attribute_1_name );
            delete( data.attribute_1_value );
            delete( data.attribute_1_visible );
            delete( data.attribute_1_global );
            delete( data.attribute_2_name );
            delete( data.attribute_2_value );
            delete( data.attribute_2_visible );
            delete( data.attribute_2_global );

            return data;
        },

        getVendorProducts(vendorId) {
            return this.allProducts.filter( function ( item ) {
                return item.vendor == vendorId
            } );
        },

        resetToImport() {
            this.errorMsg = '';
            this.progress = 0;
            this.loading  = false;
            this.done     = false;
        },

        async clearAllDummyData() {
            let self = this;

            const answer = await dokan_sweetalert( "Are you sure? You want to remove all dummy data!", {
                action : 'confirm',
                icon : 'warning',
            } );

            if ( 'undefined' !== answer && answer.isConfirmed ) {
                self.loading = true;

                jQuery.post( dokan.ajaxurl, {
                    'action': 'dokan_dummy_data_clear',
                    'nonce': dokan.nonce,
                    },
                    function ( response ) {
                        if ( response.success ) {
                            dokan_sweetalert( '', {
                                toast: true,
                                icon: 'success',
                                title: response.data,
                                animation: false,
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
                        }
                    }
                );
            }
        },

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
                border-color: #F3624D;
                color: #F3624D;

                &::before{
                    border-color: #F3624D;
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
                padding: 24px 24px 0 24px;

                table {
                    margin: 0;
                    position: relative;
                    table-layout: fixed;
                    border-collapse: collapse;
                    width: 100%;
                    clear: both;

                    tbody {
                        tr {
                            .dokan-dummy-data-progress-bar{
                                width: 100%;
                                height: 35px;
                                -webkit-appearance: none;

                                &[value]::-webkit-progress-bar {
                                    background-color: #ccc;
                                    border-radius: 5px;
                                }
                                &[value]::-webkit-progress-value {
                                    background-color: #F4624D;
                                    border-radius: 5px;
                                    transition: width 0.5s;
                                }
                            }

                            .loader-loader{
                                height: 35px;
                            }
                        }
                    }
                }
            }
            .import-done{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 24px 24px 0 24px;

                p{
                    font-size: 1.2rem;
                    color: #F5624D;
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
                    background-color: #F3624D;
                    border-color: #F3624D;
                    border: none;
                    margin: 0;
                    opacity: 1;
                    color: #FFF;
                    cursor: pointer;

                    &:hover{

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
                    background-color: #d33;
                    border-color: #d33;
                }
            }
        }
    }
</style>