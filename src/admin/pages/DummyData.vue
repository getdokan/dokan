<template>
    <div>
        <h1>{{ __( 'Import dummy data', 'dokan-lite' ) }}</h1>
        <div class="dokan-importer-wrapper">
            <ol class="dokan-importer-progress-steps">
                <li class="active">{{ __( 'Import', 'dokan-lite' ) }}</li>
                <li class="">{{ __( 'Done!', 'dokan-lite' ) }}</li>
            </ol>
            <div v-if="'' != errorMsg" class="error inline"><p>{{ errorMsg }}</p></div>
            <div class="dokan-importer">
                <header>
                    <h2>{{ __( 'Import dummy vendors and products', 'dokan-lite' ) }}</h2>
                    <p>{{ __( 'This tool allows you to import vendor and some products for vendors to your market place.', 'dokan-lite' ) }}</p>
                </header>
                <section>
                    <table>
                        <tbody>
                            <tr>
                                <progress class="dokan-dummy-data-progress-bar" max="100" :value="progress">30</progress>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <div class="dokan-importer-action">
                    <button @click="continueBtnHandler" class="dokan-import-continue-btn" :class="loading ? 'is-busy' : ''">{{ __( 'Run the importer', 'dokan-lite' ) }}</button>
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
            loading: false,
            allVendors: [],
            allProducts: []
        }
    },
    created() {
        this.loadCsvFile();
    },
    methods: {
        resetDataState() {
            this.dummyData = [];
            this.allVendors = [];
            this.allProducts = [];
        },
        loadCsvFile() {
            let self = this;
            self.loading = true;
            self.resetDataState();

            jQuery.ajax({
                type: 'GET',
                url: this.csvFileUrl,
                data: {},
                success: function(data){
                    parse(data, {
                        header: true,
                        complete: function (results, file) {
                            self.loading = false;
                            self.dummyData = results.data;
                            self.importCsvFile();
                        },
                    });
                }
            });
        },

        importCsvFile(){
            this.dummyData.forEach( item => {
                if ( 'vendor' === item.type ) {
                    this.allVendors.push(this.formatVendorData(item));
                } else {
                    this.allProducts.push(this.formatProductData(item));
                }
            } );


        },

        requestToImport(data){
            jQuery.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();

                    // Download progress
                    xhr.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                            var percentComplete = ( evt.loaded / evt.total ) * 100;
                            console.log(percentComplete);
                        }
                    }, false);

                    return xhr;
                },
                type: 'POST',
                url: dokan.ajaxurl,
                data: {
                    action:'dokan_dummy_data_import',
                    csv_file_data: data,
                    'nonce': dokan.nonce,
                },
                success: function(data){
                    console.log(data);
                }
            });

            // jQuery.post(dokan.ajaxurl, {
            //     'action': 'dokan_dummy_data_import',
            //     'nonce': dokan.nonce,
            //     'csv_file_data': data
            // }, function (response, status, xhr) {
            //     console.log(response, status, xhr);
            // });
        },

        continueBtnHandler() {
            let vendorData = this.allVendors[0];
            let data = {
                vendor_data: vendorData,
                vendor_products: this.getVendorProducts(vendorData.id)
            };

            this.requestToImport(data);
        },

        formatVendorData(data) {
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
        formatProductData(data) {
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
                    value: data.attribute_1_value.split(','),
                    visible: data.attribute_1_visible,
                    taxonomy: data.attribute_1_global,
                },
                {
                    name: data.attribute_2_name,
                    value: data.attribute_2_value.split(','),
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
            return this.allProducts.filter( function (item) {
                return item.vendor == vendorId
            } );
        }
    },
}
</script>

<style lang="less" scoped>
    .dokan-importer-wrapper{
        text-align: center;
        max-width: 700px;
        margin: 40px auto;

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
                // border-bottom: 1px solid #eee;
                margin: 0;
                padding: 24px 24px 0;
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

                    tbody{
                        tr{
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
                        }
                    }
                }
            }
            .dokan-importer-action{
                overflow: hidden;
                margin: 0;
                padding: 24px;
                line-height: 3em;

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
            }
        }
    }
</style>