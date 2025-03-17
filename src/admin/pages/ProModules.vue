<template>
    <div id="lite-modules">
        <div class="dokan-modules-wrap">
            <h1>{{ __( 'Modules', 'dokan-lite' ) }}</h1>

            <div class="module-content">
                <div class="wp-list-table widefat dokan-modules">
                    <template v-if="modules.length > 0">
                        <div class="plugin-card" v-for="module in modules">
                            <div class='flex p-5'>
                                <div class='w-[128px h-[128px]'>
                                    <a :href="module.modLink" target="_blank" class="">
                                        <img class="w-[128px] h-[128px] max-w-[128px]" :src="module.thumbnail" :alt="module.name" />
                                    </a>
                                </div>
                                <div class='flex justify-between w-[calc(100%-128px)]'>
                                    <div class='ml-5'>
                                        <a :href="module.modLink" target="_blank" class="plugin-name text-[1.3em]">{{ module.name }}</a>
                                        <p class='mt-3' v-html="module.description"></p>
                                    </div>
                                    <div class='flex flex-col justify-between'>
                                        <div class="">
                                            <ul class="plugin-action-buttons">
                                                <li @click="togglePopup(true)">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="20"><rect width="42" height="20" rx="10" fill="#c0c3c6"/><circle cx="6" cy="6" r="6" transform="translate(6 4)" fill="#fff"/></svg>
                                                </li>
                                            </ul>
                                        </div>
                                        <a :href="module.docLink" target="_blank">{{ __( 'Documentation', 'dokan-lite' ) }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div id="message" class="notice notice-info">
                            <p><strong>{{ __( 'No modules found.', 'dokan-lite' ) }}</strong></p>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <ModuleUpgradePopup @toggle="togglePopup" :show-popup="showPopup"></ModuleUpgradePopup>
    </div>
</template>

<script>
import ModuleUpgradePopup from '../components/ModuleUpgradePopup.vue';

export default {
    name: "ProModules",
    components: {
        ModuleUpgradePopup,
    },
    data() {
        return {
            modules : [
                {
                    name: this.__( 'WooCommerce Booking Integration', 'dokan-lite' ),
                    description: this.__( 'Integrates WooCommerce Booking with Dokan.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/booking.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-bookings/',
                    modLink: 'https://dokan.co/wordpress/modules/woocommerce-booking-integration/',
                },
                {
                    name: this.__( 'Color Scheme Customizer', 'dokan-lite' ),
                    description: this.__( 'A Dokan plugin Add-on to Customize Colors of Dokan Dashboard', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/color-scheme-customizer.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/color-scheme/',
                    modLink: 'https://dokan.co/wordpress/modules/color-scheme-customizer/',
                },
                {
                    name: this.__( 'Elementor', 'dokan-lite' ),
                    description: this.__( 'Elementor Page Builder widgets for Dokan', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/elementor.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/elementor-dokan/',
                    modLink: 'https://dokan.co/wordpress/modules/elementor/',
                },
                {
                    name: this.__( 'Vendor Product Importer and Exporter', 'dokan-lite' ),
                    description: this.__( 'This is simple product import and export plugin for vendor', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/import-export.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-and-use-dokan-exportimport-add/',
                    modLink: 'https://dokan.co/wordpress/modules/export-import/',
                },
                {
                    name: this.__( 'Follow Store', 'dokan-lite' ),
                    description: this.__( 'Send emails to customers when their favorite store updates.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/follow-store.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/follow-store/',
                    modLink: 'https://dokan.co/wordpress/modules/follow-store/',
                },
                {
                    name: this.__( 'Geolocation', 'dokan-lite' ),
                    description: this.__( 'Search Products and Vendors by geolocation.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/geolocation.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-geolocation/',
                    modLink: 'https://dokan.co/wordpress/modules/geolocation/',
                },
                {
                    name: this.__( 'Live Chat', 'dokan-lite' ),
                    description: this.__( 'Live Chat Between Vendor & Customer.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/live-chat.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-live-chat/',
                    modLink: 'https://dokan.co/wordpress/modules/live-chat/',
                },
                {
                    name: this.__( 'Live Search', 'dokan-lite' ),
                    description: this.__( 'Live product search for WooCommerce store.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/ajax-live-search.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-configure-use-dokan-live-search/',
                    modLink: 'https://dokan.co/wordpress/modules/ajax-live-search/',
                },
                {
                    name: this.__( 'Wirecard', 'dokan-lite' ),
                    description: this.__( 'Wirecard payment gateway for Dokan.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/wirecard-connect.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-moip-connect/',
                    modLink: 'https://dokan.co/wordpress/modules/moip/',
                },
                {
                    name: this.__( 'PayPal Adaptive Payment', 'dokan-lite' ),
                    description: this.__( 'Allows to send split payments to vendor via PayPal Adaptive Payment gateway.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/paypal-adaptive.png`,
                    docLink: '#',
                    modLink: '#',
                },
                {
                    name: this.__( 'Product Addon', 'dokan-lite' ),
                    description: this.__( 'WooCommerce Product Addon support.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/product-addon.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/product-addon/',
                    modLink: 'https://dokan.co/wordpress/modules/product-addons/',
                },
                {
                    name: this.__( 'Product Enquiry', 'dokan-lite' ),
                    description: this.__( 'Enquiry for a specific product to a seller.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/product-enquiry.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-configure-use-dokan-product-enquiry/',
                    modLink: 'https://dokan.co/wordpress/modules/product-enquiry/',
                },
                {
                    name: this.__( 'Report Abuse', 'dokan-lite' ),
                    description: this.__( 'Let customers report fraudulent or fake products.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/report-abuse.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-report-abuse/',
                    modLink: 'https://dokan.co/docs/wordpress/modules/dokan-report-abuse/',
                },
                {
                    name: this.__( 'Return and Warranty Request', 'dokan-lite' ),
                    description: this.__( 'Manage return and warranty from vendor end.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/report-abuse.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/vendor-rma/',
                    modLink: 'https://dokan.co/wordpress/modules/rma/',
                },
                {
                    name: this.__( 'Seller Vacation', 'dokan-lite' ),
                    description: this.__( 'Using this plugin seller can go to vacation by closing their stores.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/seller-vacation.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-vendor-vacation/',
                    modLink: 'https://dokan.co/wordpress/modules/vendor-vacation/',
                },
                {
                    name: this.__( 'ShipStation Integration', 'dokan-lite' ),
                    description: this.__( 'Adds ShipStation label printing support to Dokan. Requires server DomDocument support.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/shipstation.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/shipstation-dokan-wedevs/',
                    modLink: 'https://dokan.co/wordpress/modules/shipstation/',
                },
                {
                    name: this.__( 'Auction Integration', 'dokan-lite' ),
                    description: this.__( 'A plugin that combined WooCommerce simple auction and Dokan plugin.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/auction.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/woocommerce-auctions-frontend-multivendor-marketplace/',
                    modLink: 'https://dokan.co/wordpress/modules/dokan-simple-auctions/',
                },
                {
                    name: this.__( 'Single Product Multiple Vendor', 'dokan-lite' ),
                    description: this.__( 'A module that offers multiple vendor to sell a single product.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/single-product-multivendor.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/single-product-multiple-vendor/',
                    modLink: 'https://dokan.co/wordpress/modules/single-product-multivendor/',
                },
                {
                    name: this.__( 'Store Reviews', 'dokan-lite' ),
                    description: this.__( 'A plugin that allows customers to rate the sellers.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/vendor-review.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/vendor-review/',
                    modLink: 'https://dokan.co/wordpress/modules/dokan-vendor-review/',
                },
                {
                    name: this.__( 'Store Support', 'dokan-lite' ),
                    description: this.__( 'Enable vendors to provide support to customers from store page.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/store-support.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-and-use-store-support/',
                    modLink: 'https://dokan.co/wordpress/modules/store-support/',
                },
                {
                    name: this.__( 'Stripe Connect', 'dokan-lite' ),
                    description: this.__( 'Accept credit card payments and allow your sellers to get automatic split payment in Dokan via Stripe.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/stripe.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-and-configure-dokan-stripe-connect/',
                    modLink: 'https://dokan.co/wordpress/modules/store-support/',
                },
                {
                    name: this.__( 'Vendor Subscription', 'dokan-lite' ),
                    description: this.__( 'Product subscription pack add-on for Dokan vendors.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/subscription.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/how-to-install-use-dokan-subscription/',
                    modLink: 'https://dokan.co/wordpress/modules/subscription/',
                },
                {
                    name: this.__( 'Vendor Analytics', 'dokan-lite' ),
                    description: this.__( 'A plugin for store and product analytics for vendor.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/analytics.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-vendor-analytics/',
                    modLink: 'https://dokan.co/docs/wordpress/modules/dokan-vendor-analytics/',
                },
                {
                    name: this.__( 'Vendor Staff Manager', 'dokan-lite' ),
                    description: this.__( 'A plugin for manage store via vendor staffs.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/vendor-staff.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-vendor-staff-manager/',
                    modLink: 'https://dokan.co/wordpress/modules/vendor-staff-manager/',
                },
                {
                    name: this.__( 'Vendor Subscription Product', 'dokan-lite' ),
                    description: this.__( 'WooCommerce Subscription integration for Dokan', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/vendor-subscription-product.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-vendor-subscription-product/',
                    modLink: 'https://dokan.co/wordpress/modules/vendor-subscription-product/',
                },
                {
                    name: this.__( 'Vendor Verification', 'dokan-lite' ),
                    description: this.__( 'Dokan add-on to verify sellers.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/vendor-verification.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-seller-verification-admin-settings/',
                    modLink: 'https://dokan.co/wordpress/modules/seller-verification/',
                },
                {
                    name: this.__( 'Wholesale', 'dokan-lite' ),
                    description: this.__( 'Offer any customer to buy product as a wholesale price from any vendors.', 'dokan-lite' ),
                    thumbnail: `${dokan.urls.assetsUrl}/images/modules/wholesale.png`,
                    docLink: 'https://dokan.co/docs/wordpress/modules/dokan-wholesale/',
                    modLink: 'https://dokan.co/wordpress/modules/wholesale/',
                },
            ],
            showPopup: true,
        }
    },
    methods: {
        togglePopup( isShowing ) {
            this.showPopup = isShowing;
        }
    }
}
</script>

<style lang="less">
.dokan-modules-wrap {
    .module-content {
        position: relative;
        margin-top: 15px;

        .loading {
            position: absolute;
            width: 100%;
            width: 100%;
            height: 100%;
            top: 0px;
            left: 0px;
            background: rgba( 255,255,255, 0.5);

            .dokan-loader {
                top: 30%;
                left: 47%;
            }
        }

        .dokan-modules {
            .plugin-card {
                position: relative;

                .plugin-action-buttons svg {
                    cursor: pointer;
                }

                .card-footer {
                    position: absolute;
                    bottom: 18px;
                    right: 20px;
                }
            }
        }

    }

}

@media only screen and (max-width: 600px) {
    .dokan-modules-wrap {
        input#media-search-input {
            width: 74%;
        }

        .module-content {
            .tablenav.top {
                margin-top: -16px;
            }
        }

        table {
            td.name, td.active {
                display: table-cell !important;
            }

            th:not(.check-column):not(.name):not(.active) {
                display: none;
            }

            td:not(.check-column):not(.name):not(.active) {
                display: none;
            }

            th.column, td.column {
                width: auto;
            }

            th.column.name {
                width: 50% !important;
            }

            th.column.active {
                width: 20% !important;
            }

            td.column.order_id {
                .row-actions {
                    font-size: 11px;
                }
            }
        }
    }
}
</style>
