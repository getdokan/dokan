<template>
    <div class="dokan-pro-features">

        <!-- Header Section -->
        <div class="header-section">
            <div class="feature-thumb">
                <img :src="`${asstesUrl}/images/premium/header-feature-thumb@2x.png`" :alt="__( 'Upgrade to Dokan Pro!', 'dokan-lite' )" :title="__( 'Upgrade to Dokan Pro!', 'dokan-lite' )">
            </div>
            <div class="content-area">
                <h1>{{ __( 'Upgrade to Dokan Pro!', 'dokan-lite' ) }}</h1>
                <p>{{ __( 'Seems To Be Convinced, You Need More Out Of Your Marketplace', 'dokan-lite' ) }}</p>
            </div>
        </div>
        <!-- End of Header Section -->

        <!-- Service Section -->
        <div class="service-section">
            <h2 class="section-title">{{ __( 'Why Upgrade', 'dokan-lite' ) }}</h2>

            <div class="service-list">
                <div class="service-box" v-for="service in services">
                    <div class="service-thumb">
                        <img :src="service.thumbnail" :alt="service.title" :title="service.title"/>
                    </div>

                    <div class="service-detail">
                        <h3 class="title">{{ service.title }}</h3>
                    </div>
                </div>
            </div>

            <a href="https://wedevs.com/dokan/features/" class="btn" target="_blank">
                {{ __( 'And Many More', 'dokan-lite' ) }}
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         viewBox="0 0 17.5 12.5" style="enable-background:new 0 0 17.5 12.5;" xml:space="preserve">
                    <path class="st0" d="M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7
                        l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z
                         M10.6,1.5"/>
                </svg>
            </a>
        </div>
        <!-- End of Service Section -->

        <!-- Comparison Section -->
        <div class="comparison-section">
            <h2 class="section-title">{{ __( 'Comparison With Dokan PRO', 'dokan-lite' ) }}</h2>

            <div class="comparison-area">
                <div class="compare-box dokan-lite">
                    <div class="logo-section">
                        <img :src="`${asstesUrl}/images/premium/dokan-lite-logo@2x.png`" alt="Dokan Lite" />
                    </div>

                    <ul class="compare-list">
                        <li :class="comparison.compare.lite" v-for="comparison in comparisons">
                            <img :src="`${asstesUrl}/images/premium/available@2x.png`" alt="" v-if="comparison.compare.lite === 'available'">
                            <img :src="`${asstesUrl}/images/premium/unavailable@2x.png`" alt="" v-else>
                            <span>{{ comparison.title }}</span>
                        </li>
                    </ul>
                </div>

                <div class="compare-box dokan-pro">
                    <div class="logo-section">
                        <img :src="`${asstesUrl}/images/premium/dokan-pro-logo@2x.png`" alt="Dokan Pro" />
                    </div>

                    <ul class="compare-list">
                        <li :class="comparison.compare.pro" v-for="comparison in comparisons">
                            <img :src="`${asstesUrl}/images/premium/available@2x.png`" alt="" v-if="comparison.compare.pro === 'available'">
                            <img :src="`${asstesUrl}/images/premium/unavailable@2x.png`" alt="" v-else>
                            <span>{{ comparison.title }}</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
        <!-- End of Comparison Section -->

        <!-- Pricing Section -->
        <div class="pricing-section">
            <h2 class="section-title">{{ __( 'The Packages We Provide', 'dokan-lite' ) }}</h2>

            <div class="pricing-wrapper">
                <div class="table-row">
                    <div class="table-col"></div>
                    <div class="table-col">
                        <div class="plan-name starter">Starter</div>
                        <div class="price">
                            <span><sup>$</sup>149</span>
                            <span>/year</span>
                        </div>
                    </div>
                    <div class="table-col popular">
                        <div class="plan-name professional">Professional</div>
                        <div class="price">
                            <span><sup>$</sup>249</span>
                            <span>/year</span>
                        </div>
                    </div>
                    <div class="table-col">
                        <div class="plan-name business">Business</div>
                        <div class="price">
                            <span><sup>$</sup>499</span>
                            <span>/year</span>
                        </div>
                    </div>
                    <div class="table-col">
                        <div class="plan-name enterprise">Enterprise</div>
                        <div class="price">
                            <span><sup>$</sup>999</span>
                            <span>/year</span>
                        </div>
                    </div>
                </div>

                <div class="table-row" v-for="module in modules">
                    <div class="table-col">
                        <a :href="module.url" class="module-name" target="_blank">{{ module.title}}</a>
                    </div>
                    <div class="table-col">
                        <div class="plan-data" v-if="module.starter.type === 'numeric'">{{ module.starter.value}}</div>
                        <div class="plan-data" v-else>
                            <img :src="module.starter.value" alt="">
                        </div>
                    </div>
                    <div class="table-col popular">
                        <div class="plan-data" v-if="module.professional.type === 'numeric'">{{ module.professional.value}}</div>
                        <div class="plan-data" v-else>
                            <img :src="module.professional.value" alt="">
                        </div>
                    </div>
                    <div class="table-col">
                        <div class="plan-data" v-if="module.business.type === 'numeric'">{{ module.business.value}}</div>
                        <div class="plan-data" v-else>
                            <img :src="module.business.value" alt="">
                        </div>
                    </div>
                    <div class="table-col">
                        <div class="plan-data" v-if="module.enterprise.type === 'numeric'">{{ module.enterprise.value}}</div>
                        <div class="plan-data" v-else>
                            <img :src="module.enterprise.value" alt="">
                        </div>
                    </div>
                </div>

                <div class="table-row">
                    <div class="table-col"></div>
                    <div class="table-col">
                        <a :href="buyNowProUrl + `add-to-cart=15310&variation_id=15316&attribute_pa_license=starter`" class="buy-btn starter" target="_blank">{{ __( 'Buy Now', 'dokan-lite' ) }}</a>
                    </div>
                    <div class="table-col popular">
                        <a :href="buyNowProUrl + `add-to-cart=15310&variation_id=15314&attribute_pa_license=professional`" class="buy-btn professional" target="_blank">{{ __( 'Buy Now', 'dokan-lite' ) }}</a>
                    </div>
                    <div class="table-col">
                        <a :href="buyNowProUrl + `add-to-cart=15310&variation_id=15315&attribute_pa_license=business`" class="buy-btn business" target="_blank">{{ __( 'Buy Now', 'dokan-lite' ) }}</a>
                    </div>
                    <div class="table-col">
                        <a :href="buyNowProUrl + `add-to-cart=15310&variation_id=103829&attribute_pa_license=enterprise`" class="buy-btn enterprise" target="_blank">{{ __( 'Buy Now', 'dokan-lite' ) }}</a>
                    </div>
                </div>
            </div>
        </div>
        <!-- End of Pricing Section -->

        <!-- Payment Section -->
        <div class="payment-section">
            <div class="guarantee-section">
                <div class="feature-thumb">
                    <img :src="payment.guaranteeThumbnail" alt="Dokan">
                </div>
                <div class="guarantee-detail">
                    <h2>{{ __( '14 Days Money Back Guarantee', 'dokan-lite' ) }}</h2>
                    <p>{{ __( 'After successful purchase, you will be eligible for conditional refund', 'dokan-lite' ) }}</p>
                    <a :href="payment.termsPolicyUrl" target="_blank"><img :src="payment.viewIcon" alt="Dokan"> {{ __( 'Terms & Condition Applied', 'dokan-lite' ) }}</a>
                </div>
            </div>
            <div class="payment-area">
                <h3>{{ __( 'Payment Options:', 'dokan-lite' ) }}</h3>

                <div class="option">
                    <img :src="payment.thumbnail" alt="Credit Card">
                </div>
            </div>
        </div>
        <!-- End of Payment Section -->

        <!-- Testimonial Section -->
        <div class="testimonial-section">
            <h2 class="section-title">{{ __( 'People We Have Helped', 'dokan-lite' ) }}</h2>

            <div class="testimonial-wrapper">

                <slick ref="slick" :options="slickOptions">

                    <div class="testimonial-box" v-for="testimonial in testimonials">
                        <div class="profile-pic">
                            <img :src="testimonial.pic" alt="">
                        </div>

                        <div class="content-detail" v-bind:style="{ 'background-image': 'url(' + `${asstesUrl}/images/premium/quote-icon.png` + ')' } ">
                            <h4>{{ testimonial.name }}</h4>
                            <span>{{ testimonial.designation }}</span>
                            <p>{{ testimonial.content }}</p>
                        </div>
                    </div>

                </slick>

            </div>

            <p v-html="sprintf( '%s <a href=\'%s\' target=\'_blank\'>%s</a> %s', __( 'We are proud to say the official', 'dokan-lite' ), 'https://themes.getbootstrap.com/', 'Bootstrap theme marketplace', __( 'is built using Dokan', 'dokan-lite' ) )"></p>
        </div>
        <!-- End of Testimonial Section -->

        <!-- CTA Section -->
        <div class="cta-section" v-bind:style="{ 'background-image': 'url(' + cta.styles.bgPattern + '), linear-gradient( 45deg, rgb(255,125,144) 33%, rgb(255,173,111) 100%)' }">
            <div class="feature-thumb">
                <img :src="cta.thumbnail" alt="Dokan Lite">
            </div>
            <div class="content-area">
                <h2>{{ __( 'Convinced?', 'dokan-lite' ) }}</h2>
                <p>{{ __( 'With all the advance features you get it’s hard to resist buying Dokan Pro.', 'dokan-lite' ) }}</p>
                <a :href="cta.url" class="btn">
                    {{ __( 'I Want To Buy Now', 'dokan-lite' ) }}
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         viewBox="0 0 17.5 12.5" style="enable-background:new 0 0 17.5 12.5;" xml:space="preserve">
                    <path class="st0" d="M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7
                        l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z
                         M10.6,1.5"/>
                    </svg>
                </a>
            </div>
        </div>
        <!-- End of CTA Section -->

    </div>
</template>

<script>

import 'slick-carousel/slick/slick.css';
import Slick from 'vue-slick';

export default {

    name: 'Premium',

    components: { Slick },

    data () {
        return {
            asstesUrl : dokan.urls.assetsUrl,
            services: [
                {
                    "title": this.__( "Premium modules to make everything easier & better", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-01@2x.png'
                },
                {
                    "title": this.__( "Frontend dashboard for vendors with advanced controls", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-02@2x.png'
                },
                {
                    "title": this.__( "Unlimited Product Variations and group product upload", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-03@2x.png'
                },
                {
                    "title": this.__( "Zone wise shipping with multiple method for vendors", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-04@2x.png'
                },
                {
                    "title": this.__( "Store support based on ticket system for your customers", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-05@2x.png'
                },
                {
                    "title": this.__( "Vendors will be able to generate coupon codes", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-06@2x.png'
                },
                {
                    "title": this.__( "Earning, Selling and Commission Reports & Statement", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-07@2x.png'
                },
                {
                    "title": this.__( "24/7 super fast premium customer support for you", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-08@2x.png'
                },
                {
                    "title": this.__( "Add Social profile to your vendor’s store and support for store SEO", "dokan-lite" ),
                    "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-09@2x.png'
                }
            ],

            comparisons: [
                {
                    "title": this.__( "Frontend order management", "dokan-lite" ),
                    "compare" : {
                        "lite": "available",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Seller Statement Reports", "dokan-lite" ),
                    "compare" : {
                        "lite": "available",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Making Announcements", "dokan-lite" ),
                    "compare" : {
                        "lite": "available",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Customized Product Categories", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Store SEO", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Back Ordering System", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Store Contact Form", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Single Product Multiple Seller", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Seller Verification", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Featured Seller", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Multiple Commission Types", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Frontend Shipping Tracking", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Setup Wizard", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Google Maps", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Manage reviews", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                },
                {
                    "title": this.__( "Bookable Product", "dokan-lite" ),
                    "compare" : {
                        "lite": "unavailable",
                        "pro" : 'available'
                    }
                }
            ],

            modules: [
                {
                    "title": "Domain",
                    "url": "https:\/\/wedevs.com\/dokan\/",
                    "starter" : {
                        "type": "numeric",
                        "value" : '01'
                    },
                    "professional" : {
                        "type": "numeric",
                        "value" : '03'
                    },
                    "business" : {
                        "type": "numeric",
                        "value" : '05'
                    },
                    "enterprise" : {
                        "type": "numeric",
                        "value" : '20'
                    }
                },
                {
                    "title": "Modules",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/",
                    "starter" : {
                        "type": "numeric",
                        "value" : '01'
                    },
                    "professional" : {
                        "type": "numeric",
                        "value" : '08'
                    },
                    "business" : {
                        "type": "numeric",
                        "value" : '14'
                    },
                    "enterprise" : {
                        "type": "numeric",
                        "value" : '14'
                    }
                },
                {
                    "title": "Color Scheme",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/color-scheme-customizer\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Vendor Review",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-vendor-review\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Store Support",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/store-support\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Auction",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-simple-auctions\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Ajax Live Search",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/ajax-live-search\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Stripe Connect",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/stripe-connect\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Subscriptions",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/subscription\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Single Product Multivendor",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/single-product-multivendor\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Seller Verification",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/seller-verification\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "WC Booking Integration",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/woocommerce-booking-integration\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Vendor Staff Manager",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-staff-manager\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Export Import",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/export-import\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Product Enquiry",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/product-enquiry\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Vendor Vacation",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-vacation\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Return and Warranty Request",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/rma\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Moip",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/moip\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Follow Store",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/follow-store\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Geolocation",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/geolocation\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Shipstation",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/shipstation\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
                {
                    "title": "Wholesale",
                    "url": "https:\/\/wedevs.com\/dokan\/modules\/wholesale\/",
                    "starter" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "professional" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                    },
                    "business" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    },
                    "enterprise" : {
                        "type": "icon",
                        "value" : dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                    }
                },
            ],

            payment: {
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/payment-options.png',
                "guaranteeThumbnail": dokan.urls.assetsUrl + '/images/premium/gaurantee-thumb.png',
                "viewIcon": dokan.urls.assetsUrl + '/images/premium/view-icon@2x.png',
                "termsPolicyUrl": "https:\/\/wedevs.com\/refund-policy\/"
            },

            slickOptions: {
                //options can be used from the plugin documentation
                slidesToShow: 1,
                fade: true,
                speed: 500,
                cssEase: 'linear',
                autoplay: true,
                autoplaySpeed: 2000,
                infinite: true,
                accessibility: true,
                adaptiveHeight: false,
                arrows: false,
                dots: true,
                draggable: true,
                edgeFriction: 0.30,
                swipe: true
            },

            testimonials: [
                {
                    "name": "Melissa McGovern",
                    "designation": "Director, Hawk And PeddleProjects",
                    "pic": dokan.urls.assetsUrl + '/images/premium/melissa.jpg',
                    "content": "We're still a new business and are continuing to build our platform. Dokan has halved the time it would take us to build our ecommerce platform by being feature rich and easy to install and configure."
                },
                {
                    "name": "Morten J. Christensen",
                    "designation": "Owner, Dincatering",
                    "pic": dokan.urls.assetsUrl + '/images/premium/Morten-J.-Christensen.jpg',
                    "content": "First and foremost it enables the possibility for actually creating the kind of marketplace i wanted. The plugin lets me create a local marketplace for local danish catering suppliers to showcase and sell their offers of the season."
                },
                {
                    "name": "Cédric Lefrancq",
                    "designation": "Webmaster, Unwebmaster.Be",
                    "pic": dokan.urls.assetsUrl + '/images/premium/cedric-lefrancq.jpeg',
                    "content": "The support is very good. The plugin is perfect. Bugs are fixed very quickly. That’s a very good plugin."
                },
                {
                    "name": "David Gaz",
                    "designation": "Founder, The Bureau Of Small Projects",
                    "pic": dokan.urls.assetsUrl + '/images/premium/david-gaz.jpeg',
                    "content": "It’s hands down an amazing plugin. But their support is even more amazing. They got back to me within hours on the weekend."
                }
            ],

            cta: {
                "styles" : {
                    "bgPattern": dokan.urls.assetsUrl + '/images/premium/cta-pattern@2x.png'
                },
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/cta-dokan-logo.png',
                "url": dokan.urls.buynowpro
            },

        };
    },

    methods: {
        next() {
            this.$refs.slick.next();
        },

        prev() {
            this.$refs.slick.prev();
        },

        reInit() {
            // Helpful if you have to deal with v-for to update dynamic lists
            this.$nextTick(() => {
                this.$refs.slick.reSlick();
            });
        },
    },

    computed: {
        buyNowProUrl() {
            return dokan.urls.buynowpro.substr(-1) === '/' ? dokan.urls.buynowpro + '?' : dokan.urls.buynowpro + '&';
        }
    }
};
</script>

<style lang="less" type="text/less">

    .dokan-pro-features {
        font-family: 'Open Sans', sans-serif;
        margin: -10px -20px 0 -22px;

        a {
            transition: all .2s ease;
        }

        .section-title {
            text-align: center;
            color: #2e2c2c;
            font-size: 30px;
            line-height: 1.5em;
            font-weight: 400;
            position: relative;
            margin: 0 0 58px;

            &:after {
                content: '';
                position: absolute;
                bottom: -21px;
                left: 50%;
                transform: translateX(-50%);
                width: 38px;
                height: 5px;
                border-radius: 3px;
                background-color: #f2624d;
            }
        }

        .header-section {
            background-color: #f2f2f2;
            color: #3f4143;
            font-size: 16px;
            display: flex;
            align-items: center;
            padding: 0 8%;
            border-bottom: 1px solid #eee;

            @media (min-width: 1281px) {
                padding: 0 24%;
            }

            .feature-thumb {
                img {
                    width: 233px;
                    margin: -20px 0 -30px;
                }
            }

            .content-area {
                padding-left: 10%;

                h1 {
                    font-size: 27px;
                    line-height: 1.5em;
                    color: #2e2c2c;
                }

                p {
                    font-size: 16px;
                    line-height: 1.5em;
                    font-weight: 300;
                    margin: 0;
                    letter-spacing: .5px;
                }
            }
        }

        .service-section {
            text-align: center;
            padding: 73px 30px 85px;
            background-color: #f7f8f9;

            @media (min-width: 1281px) {
                padding-left: 20%;
                padding-right: 20%;
            }

            .service-list {
                display: flex;
                flex-wrap: wrap;

                .service-box {
                    flex: 0 0 28.9%;
                    margin: 2.2%;
                    text-align: center;
                    border-radius: 5px;
                    background-color: rgb(255, 255, 255);


                    .service-thumb {
                        img {
                            border-radius: 5px 5px 0 0;
                            max-width: 100%;
                        }
                    }

                    .service-detail {
                        padding: 20px 25px 25px;

                        h3 {
                            color: #3f4143;
                            font-size: 15px;
                            line-height: 1.5em;
                            font-weight: 300;
                            margin: 0;
                        }
                    }
                }
            }

            .btn {
                font-size: 16px;
                line-height: 1.5em;
                font-weight: 300;
                color: #ffff;
                background-color: #3984b5;
                border: 1px solid #226b9b;
                border-radius: 3px;
                text-decoration: none;
                padding: 13px 28px;
                display: inline-block;
                margin-top: 52px;
                transition: all .2s ease;

                &:hover {
                    box-shadow: 2.736px 7.518px 20px 0 rgba(0,0,0,.15);
                }

                svg {
                    width: 15px;
                    fill: #fff;
                    margin-left: 5px;
                }
            }

        }

        .comparison-section {
            background-color: #f1f1f1;
            padding: 75px;

            @media (min-width: 1281px) {
                padding-left: 21.2%;
                padding-right: 21.2%;
            }

            .section-title {
                margin-bottom: 90px;
            }

            .comparison-area {
                display: flex;
                justify-content: space-between;

                .compare-box {
                    flex: 0 0 48%;
                    background-color: #fff;
                    border: 1px solid #E0E9EC;
                    border-radius: 5px;
                    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
                    padding: 50px;
                    box-sizing: border-box;

                    .logo-section {
                        margin-bottom: 58px;
                        position: relative;

                        &:after {
                            content: "";
                            position: absolute;
                            bottom: -23px;
                            left: 0;
                            width: 38px;
                            height: 5px;
                            border-radius: 3px;
                            background-color: #d7d7d7;
                        }

                        img {
                            width: 120px;
                        }
                    }

                    .compare-list{
                        margin: 0;

                        li {
                            font-size: 15px;
                            line-height: 1.5em;
                            font-weight: 300;
                            color: #66676E;
                            margin-bottom: 28px;
                            position: relative;
                            display: flex;
                            align-items: center;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            img {
                                width: 21px;
                                margin-right: 12px;
                            }


                            &.unavailable {
                                color: #ccced5;
                            }
                        }
                    }
                }
            }

        }

        .pricing-section {
            background-color: #f7f8f9;
            padding: 85px 0 62px;

            .section-title {
                margin-bottom: 120px;
            }

            .pricing-wrapper {
                padding: 0 4.5%;

                @media (min-width: 1281px) {
                    padding-left: 21%;
                    padding-right: 21%;
                }
            }

            .table-row {
                display: flex;

                &:first-child {
                    .table-col {
                        &:first-child {
                            background-color: transparent;
                            border-color: transparent;
                            border-radius: 3px 3px 0 0;
                        }

                        &:nth-child(2) {
                            border-radius: 3px 0 0 0;
                        }

                        &:last-child {
                            border-radius: 0 3px 0 0;
                        }

                        &.popular {
                            position: relative;

                            &:before {
                                position: absolute;
                                top: -28px;
                                left: 0;
                                width: 100%;
                                content: 'Most Popular';
                                color: #23282d;
                                font-size: 14px;
                                line-height: 1.4em;
                                background-color: #ffcc00;
                                border-radius: 3px 3px 0 0;
                                padding: 5px;
                                box-sizing: border-box;
                            }
                        }
                    }
                }

                &:nth-child(2) {
                    .table-col {
                        &:first-child {
                            border-radius: 3px 3px 0 0;
                        }
                    }
                }

                &:nth-last-child(2) {
                    .table-col {
                        &:first-child {
                            border-radius: 0 0 5px 5px;
                            border-bottom: 1px solid #e7eaeb;
                        }
                    }
                }

                &:last-child {
                    .table-col {
                        border-bottom: 1px solid #e7eaeb;

                        &:first-child {
                            border-radius:  0 0 5px 5px;
                            background-color: transparent;
                            border-color: transparent;
                        }

                        &:nth-child(2) {
                            border-radius: 0 0 0 5px;
                        }

                        &:last-child {
                            border-radius: 0 0 5px 0;
                        }
                    }
                }

                .table-col {
                    width: 18.5%;
                    text-align: center;
                    border: 1px solid #e7eaeb;
                    padding: 18px;
                    background-color: #fff;
                    border-bottom: 0;
                    border-left: 0;
                    border-right: 0;

                    &:first-child {
                        width: 25%;
                        margin-right: 2%;
                        text-align: left;
                        border-left: 1px solid #e7eaeb;
                        border-right: 1px solid #e7eaeb;
                    }

                    &:nth-child(2) {
                        border-left: 1px solid #e7eaeb;

                    }
                    &:last-child {
                        border-left: 1px solid #e7eaeb;
                        border-right: 1px solid #e7eaeb;
                    }

                    &.popular {
                        z-index: 1;
                        box-shadow: 1px 10px 30px 0 rgba(215,223,254,.5);
                    }

                    .module-name {
                        color: #157ef5;
                        font-size: 14px;
                        line-height: 1.5em;
                        font-weight: 300;
                        text-decoration: none;
                    }

                    .plan-data {
                        font-size: 15px;
                        color: #3f4143;

                        img {
                            display: block;
                            margin: 0 auto;
                            width: 23px;
                        }
                    }

                    .buy-btn {
                        font-size: 14px;
                        font-weight: 300;
                        border-radius: 3px;
                        padding: 13px 34px;
                        color: #fff;
                        text-decoration: none;
                        margin: 25px 0 14px;
                        display: inline-block;
                        transition: all .2s ease;

                        &:hover {
                            box-shadow: 1px 10px 30px 0 rgba(215,223,254,.5);
                        }

                        &.starter {
                            background-color: #00bcff;
                        }
                        &.professional {
                            background-color: #2bc66d;
                        }
                        &.business {
                            background-color: #795dff;
                        }
                        &.enterprise {
                            background-color: #ff5956;
                        }
                    }
                }
            }

            .plan-name {
                display: inline-block;
                background: black;
                color: #fff;
                font-size: 14px;
                font-weight: 300;
                line-height: 1.4em;
                border-radius: 25px;
                padding: 5px 20px;
                min-width: 95px;
                box-sizing: border-box;
                margin: 26px 0 20px;

                &.starter {
                    background-color: #00bcff;
                }
                &.professional {
                    background-color: #2bc66d;
                }
                &.business {
                    background-color: #795dff;
                }
                &.enterprise {
                    background-color: #ff5956;
                }
            }

            .price {
                margin-bottom: 15px;
                span {
                    font-size: 14px;
                    line-height: 1.2em;
                    font-weight: 300;
                    color: #b8bbbe;
                    display: block;

                    &:first-child {
                        font-size: 28px;
                        line-height: 1.5em;
                        font-weight: 400;
                        color: #23282d;

                        sup {
                            font-size: 14px;
                        }
                    }
                }
            }
        }

        .payment-section {
            display: flex;
            background: #fff;
            justify-content: space-between;
            padding: 20px 65px 15px;
            align-items: center;

            @media (min-width: 1281px) {
                padding-left: 21%;
                padding-right: 21%;
            }

            .guarantee-section {
                display: flex;
                flex: 0 0 70%;
                align-content: center;
                align-items: center;
                position: relative;

                &:after {
                    content: "";
                    position: absolute;
                    right: -18px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 5px;
                    height: 38px;
                    border-radius: 3px;
                    background-color: #f1f1f1;
                }

                .feature-thumb {
                    img {
                        max-width: 100%;
                        width: 160px;
                    }
                }

                .guarantee-detail {
                    padding-left: 25px;

                    h2 {
                        font-size: 24px;
                        line-height: 1.5em;
                        color: #2e2c2c;
                        font-weight: 400;
                        margin: 0;
                    }

                    p {
                        color: #66676e;
                        font-size: 15px;
                        line-height: 1.5em;
                        font-weight: 300;
                        margin: 5px 0 20px;
                    }

                    a {
                        color: #f2624d;
                        font-size: 15px;
                        line-height: 1.5em;
                        text-decoration: none;

                        img {
                            width: 18px;
                            margin-right: 4px;
                        }
                    }
                }
            }

            .payment-area {
                h3 {
                    font-size: 15px;
                    font-weight: 300;
                    color: #66676e;
                    margin: 0px 0 17px;
                }
                .option {
                    img {
                        max-width: 100%;
                    }
                }
            }
        }

        .testimonial-section {
            background-color: #f1f1f1;
            padding: 75px 0 70px;
            text-align: center;

            .section-title {
                margin-bottom: 75px;
            }

            .testimonial-wrapper {
                width: 80%;
                text-align: center;
                margin: 0 auto;

                @media only screen and (min-width: 1281px) {
                    width: 55%;
                }

                .testimonial-box {
                    .profile-pic {
                        width: 70px;
                        height: 70px;
                        border: 5px solid #fff;
                        border-radius: 50%;
                        background-color: #fff;
                        box-shadow: 0px 1px 16px 0px rgba(0, 0, 0, 0.16);
                        margin: 0 auto -35px;
                        z-index: 1;
                        position: relative;

                        img {
                            border-radius: 50%;
                            max-width: 100%;
                        }
                    }

                    .content-detail {
                        background-color: #fff;
                        color: #000;
                        border-radius: 5px;
                        border: 1px solid #E0E9EC;
                        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
                        padding: 50px 30px 30px;
                        background-repeat: no-repeat;
                        background-position: 40px 40px;

                        h4 {
                            font-size: 18px;
                            line-height: 1.444;
                            color: #F2624D;
                            font-weight: 400;
                            margin-top: 0;
                            margin-bottom: 5px;
                        }

                        span {
                            font-size: 15px;
                            line-height: 1.444;
                            font-weight: 300;
                            color: #66676e;
                            margin-bottom: 20px;
                            display: inline-block;
                        }

                        p {
                            color: #2e2c2c;
                            font-size: 14px;
                            line-height: 1.9em;
                            font-weight: 300;
                        }
                    }

                }

                .slick-dots {
                    text-align: center;
                    margin: 40px 0 25px;

                    li {
                        position: relative;
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        margin: 0 5px;
                        padding: 0;
                        cursor: pointer;

                        &.slick-active button:before{
                            background-color: #3f4143;
                        }

                        button {
                            position: relative;
                            font-size: 0;
                            line-height: 0;
                            display: block;
                            width: 20px;
                            height: 20px;
                            padding: 5px;
                            cursor: pointer;
                            color: transparent;
                            border: 0;
                            outline: none;
                            background: transparent;

                            &:before {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 21px;
                                height: 5px;
                                content: '';
                                text-align: center;
                                background-color: #d6d6d6;
                                border-radius: 30px;
                            }
                        }
                    }
                }
            }

            p {
                color: #262626;
                font-size: 16px;
                line-height: 1.5em;
                font-weight: 300;

                a {
                    color: #8263f7;
                    text-decoration: none;
                }
            }

        }

        .cta-section {
            background-image: -moz-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
            background-image: -webkit-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
            background-image: -ms-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
            background-image: linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            text-align: center;
            padding: 35px 75px 40px;
            color: #fff;

            img {
                width: 60px;
                border-radius: 50%;
                box-shadow: 0px 3px 70px 0px rgba(126, 17, 0, 0.35);
            }

            h2 {
                font-size: 30px;
                color: #fff;
                font-weight: 400;
                line-height: 1.333em;
                text-align: center;
                margin: 10px 0;
                text-shadow: 0px 1px 2px rgba(255, 255, 255, 0.31);
            }

            p {
                font-size: 16px;
                line-height: 1.5em;
                font-weight: 300;
                margin: 10px 0 30px;
            }

            .btn {
                background-color: #fff;
                color: #f2624d;
                font-size: 16px;
                line-height: 1.538em;
                font-weight: 300;
                border: 1px solid #FF9381;
                border-radius: 3px;
                box-shadow: 0px 1px 2px 0px rgba(255, 128, 142, 0.05);
                display: inline-block;
                text-decoration: none;
                padding: 12px 27px;

                &:hover {
                    box-shadow: 2.736px 7.518px 20px 0 rgba(0,0,0,.15);
                }

                svg {
                    width: 15px;
                    fill: #f2624d;
                    margin-left: 6px;
                }
            }
        }
    }

</style>
