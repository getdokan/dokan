<template>
    <div id="dokan-vendor-capabilities">
        <div class="vendor-capabilities-banner" :style="bannerBg">
            <img :src="bannerImage" :alt="__( 'Dokan Vendor Capabilities Banner', 'dokan-lite' )">
            <div class="content">
                <p class="title">{{ __( 'Vendor Capabilities', 'dokan-lite' ) }}</p>
                <p>
                    {{ __( 'One of the finest attractions of Dokan PRO is the vast array of powerful vendor controls & functions it provides so sellers can enjoy ownership, automation & freedom to run their stores. To use these awesome vendor features listed below, consider Upgrading to PRO.', 'dokan-lite' ) }}
                </p>
            </div>
        </div>

        <div class="grid">
            <div v-for="card in capabilityCards" class="col-6">
                <div class="capability-card">
                    <div class="capability-image">
                        <img class="image" :src="card.image" :alt="__( 'Dokan Capability', 'dokan-lite' )">
                        <div class="middle">
                            <div @click="openPopup( card.image )" class="zoom"><div class="dashicons dashicons-search"></div></div>
                        </div>
                    </div>
                    <p class="title">{{ card.title }}</p>
                    <p class="content">{{ card.content }}</p>
                </div>
            </div>
        </div>

        <ProCta />

        <div @click="closePopup" v-if="showPopup" id="dokan-capability-image-popup">
            <div class="modal-content">
                <div class="body">
                    <img :src="this.selectedCapabilityImage" :alt="__( 'Dokan Capability', 'dokan-lite' )">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ProCta from '../components/ProCta.vue';

export default {
    name: "VendorCapabilities",
    components: {
        ProCta,
    },
    data() {
        return {
            showPopup: false,
            selectedCapabilityImage: '',
            capabilityCards: [
                {
                    title: this.__( 'Coupons', 'dokan-lite' ),
                    content: this.__( 'Each vendor can create unlimited discount coupon codes for their products.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-coupon.svg`
                },
                {
                    title: this.__( 'Shipping', 'dokan-lite' ),
                    content: this.__( 'Vendors can configure their own shipping costs for each country, state & single products.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-shipping.svg`
                },
                {
                    title: this.__( 'Duplicate Product' , 'dokan-lite' ),
                    content: this.__('Vendors can duplicate their own products for ease and time saving.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-duplicate-product.svg`
                },
                {
                    title: this.__( 'Reporting', 'dokan-lite' ),
                    content: this.__( 'Earning, selling and commissions reports for vendors to improve sales & take major decisions.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-reports.svg`
                },
                {
                    title: this.__('Create Tags', 'dokan-lite' ),
                    content: this.__( 'Vendors can create & attach tags to products to categorize & for better search engine optimization.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-create-tags.svg`
                },
                {
                    title: this.__( 'Vendor Biography', 'dokan-lite' ),
                    content: this.__( 'Vendors can write about themselves & about their store in a text field which visitors can see from the store page', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-vendor-biography.svg`
                },
                {
                    title: this.__('Vendor Product Upload', 'dokan-lite' ),
                    content: this.__( 'New vendors can start uploading products upon registration if admins allow.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-vendor-product-upload.svg`
                },
                {
                    title: this.__( 'Order Status Change', 'dokan-lite' ),
                    content: this.__( 'Vendors will be able to mark products as draft & update the order status to inform customers about progress.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-order-status-change.svg`
                },
                {
                    title: this.__( 'Social Share', 'dokan-lite' ),
                    content: this.__( 'Visitors and customers can share a store page with their friends and acquaintances on their social profiles.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-social-share.svg`
                },
                {
                    title: this.__( 'Variable Product', 'dokan-lite' ),
                    content: this.__( 'Vendors can create variable products with predefined and custom attributes.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-variable-product.svg`
                },
                {
                    title: this.__( 'Store Opening & Closing Time', 'dokan-lite' ),
                    content: this.__( 'Vendors can define the working hours of their online store for each day of the week for visitors to see.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-opening-closing-hours.svg`
                },
                {
                    title: this.__( 'Woocommerce Booking Integration', 'dokan-lite' ),
                    content: this.__( 'Create hotel rooms, resorts, conference rooms, cars, bikes, etc for renting out.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-woocommerce-booking.svg`
                },
                {
                    title: this.__( 'Announcement For Vendors', 'dokan-lite' ),
                    content: this.__( 'Admins can make announcements targeted to a single vendor, multiple or all vendors.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-announcement-vendors.svg`
                },
                {
                    title: this.__( 'Woocommerce Simple Auctions Integration', 'dokan-lite' ),
                    content: this.__( 'Sell auction-able products in your store with Dokan’s integration.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-simple-auction.svg`
                },
                {
                    title: this.__( 'Social Profiles', 'dokan-lite' ),
                    content: this.__( 'Vendors can upload & showcase their Facebook, Twitter and Linkedin profiles on their store page.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-social-profile.svg`
                },
                {
                    title: this.__( 'Refund', 'dokan-lite' ),
                    content: this.__( 'Vendors can send refund requests for an order to the admins who can approve or deny it from the dashboard.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-refund.svg`
                },
                {
                    title: this.__( 'Store Seo', 'dokan-lite' ),
                    content: this.__( 'The Yoast SEO integration lets vendors define Store Title, Description, Slug and Keyword to appear in search engine results.', 'dokan-lite' ),
                    image: `${dokan.urls.assetsUrl}/images/vendor-capability/cap-store-seo.svg`
                },
            ],
        }
    },
    methods: {
        closePopup() {
            this.showPopup = false;
        },
        openPopup( image ) {
            this.showPopup = true;
            this.selectedCapabilityImage = image;
        },
    },
    computed: {
        bannerBg() {
            return {
                backgroundImage: `url(${dokan.urls.assetsUrl}/images/dokan-vendor-capabilities-banner-bg.svg)`,
            };
        },
        bannerImage() {
            return `${dokan.urls.assetsUrl}/images/dokan-vendor-capabilities-banner.svg`;
        }
    },
}
</script>

<style lang="less">
    #dokan-vendor-capabilities {
        padding: 20px 70px;

        .grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-gap: 16px;
            margin-bottom: 30px;
        }

        .col-6 {
            grid-column: auto/span 6;
        }

        #dokan-capability-image-popup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.7);
            z-index: 99900;

            .modal-content {
                background-color: transparent;
                z-index: 100000;
                margin: 8% auto;
                max-width: 850px;
                text-align: center;
            }
        }

        .capability-card {
            background: #fff;
            padding: 50px;
            border-radius: 9px;
            border: 1px solid #E2E2E2;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            .capability-image {
                position: relative;
                width: 100%;

                .image {
                    opacity: 1;
                    width: 100%;
                    height: 270px;
                    max-height: 370px;
                    transition: .5s ease;
                    backface-visibility: hidden;
                }

                .middle {
                    transition: .5s ease;
                    opacity: 0;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    -ms-transform: translate(-50%, -50%);
                    text-align: center;
                }

                &:hover .image {
                    opacity: 0.3;
                }

                &:hover .middle {
                    opacity: 1;
                }

                .zoom {
                    background-color: #FFB24B;
                    border-radius: 9px;
                    color: white;
                    font-size: 24px;
                    padding: 16px 24px;
                    cursor: pointer;
                }
            }

            .title {
                font-size: 18px;
            }

            .content {
                min-height: 40px;
            }

            p {
                margin-bottom: 0px;
            }
        }

        .vendor-capabilities-banner {
            display: flex;
            align-items: center;
            padding: 50px;
            height: auto;
            border-radius: 9px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            margin-bottom: 16px;

            .content {
                margin: 30px;

                .title {
                    font-size: 26px;
                    font-weight: bold;
                    color: #FF0000;
                }
            }
        }
    }
</style>
