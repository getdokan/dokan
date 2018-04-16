<template>
    <div class="dokan-pro-features">
        <h1>{{ __( 'Dokan - Pro Features', 'dokan-lite' ) }}</h1>

        <div class="pro-feature-wrap">
            <div class="pro-feature" v-for="feature in features">
                <div class="pro-feature-thumb">
                    <a :href="feature.url" target="_blank">
                        <img :src="feature.thumbnail" :alt="feature.title" />
                    </a>
                </div>

                <div class="pro-detail">
                    <h3 class="title">
                        <a :href="feature.url" target="_blank">{{ feature.title }}</a>
                    </h3>

                    <div class="text">{{ feature.desc }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {

    name: 'Premium',

    data () {
        return {
            features: [
                {
                    "title": "Vendor Listing",
                    "desc": "View vendor listing with vendor details and earnings.",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/seller@2x.png?58e47e",
                    "class": "seller-listing",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Commission Per Vendor Report",
                    "desc": "View commission per vendor with vendor earnings. You can charge your vendors percentage, giving them an e-commerce solution free of any monthly fees.",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/earn@2x.png?58e47e",
                    "class": "commission-per-seller-report",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Birds Eye View With Reports",
                    "desc": "Every vendor can see his\/her own sales report and see a bird eye view on the sales they are making. ",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2017\/01\/Store-Insights-with-Reports-and-Statement@2x.png?x21811",
                    "class": "report-bird-view",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Coupon Management",
                    "desc": "Every vendor manages their own products and discounts they offer. create discount coupons for special sales! ",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/coupon@2x.png?58e47e",
                    "class": "coupon-management",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Manage Product Reviews",
                    "desc": "Each vendor manages their own product reviews independently. Delete, mark as spam or modify the product reviews on the fly.",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/reviews@2x.png?58e47e",
                    "class": "manage-product-reviews",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Vendor Profile Completeness",
                    "desc": "Dokan manage vendors profile completeness par on vendors dashboard. Vendor can view his\/her profile completeness percent by the bar. ",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-profile-completion.png?58e47e",
                    "class": "profile-completeness",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Vendor Payment Method Setup",
                    "desc": "Vendor can manage there payment methods from their dashboard settings. They can set their withdraw method from there.",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-payment.png?58e47e",
                    "class": "payment-method",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                },
                {
                    "title": "Admin Announcement System for Vendor",
                    "desc": "Admin can set announcement for vendors from back-end. Admin can choose all vendor or select individuals as he\/she wants. the announcement will then show on vendor dashboard which leads to a announcement list template. ",
                    "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-announcement.png?58e47e",
                    "class": "announcement",
                    "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
                }
            ]
        };
    }
};
</script>

<style lang="less">
.dokan-pro-features {

    .pro-feature-wrap {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 15px;
    }

    .pro-feature {
        min-width: 48%;
        max-width: 48%;
        margin-bottom: 20px;
        border: 1px solid #E6E6E6;
        background: #fff;
    }

    @media screen and (max-width: 782px) {
        .pro-feature {
            min-width: 100%;
            max-width: 100%;
        }
    }

    .pro-feature:nth-child(2n) {
        margin-right: 0px;
    }

    .pro-feature-thumb img {
        width: 100%;
        height: auto;
    }

    .pro-detail {
        padding: 10px 20px;
        min-height: 100px;
        background: #fff;
    }

    .pro-detail h3.title {
        margin: 5px 0 10px;
        padding: 0;
    }

    .pro-detail h3.title a {
        text-decoration: none;
        color: #111;
    }

    .pro-links {
        padding: 10px;
        background: #F5F5F5;
        border-top: 1px solid #E6E6E6;
    }

    a.button.disabled {
        background: #eee;
    }
}
</style>
