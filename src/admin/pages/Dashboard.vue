<template>
    <div class="dokan-dashboard">
        <h1>{{ __( 'Dashboard', 'dokan-lite' ) }}</h1>
        <AdminNotice></AdminNotice>
<!--        <UpgradeBanner v-if="! hasPro"></UpgradeBanner>-->

        <div class="widgets-wrapper">

            <div class="left-side">
                <postbox :title="__( 'At a Glance', 'dokan-lite' )" extraClass="dokan-status">
                    <div class="dokan-status" v-if="overview !== null">
                        <ul>
                            <li class="sale !mt-[13px]">
                                <div class="dashicons dashicons-chart-bar"></div>
                                <router-link :to="hasPro ? { name: 'Reports' } : ''">
                                    <strong>
                                        <currency :amount="overview.sales.this_month"></currency>
                                    </strong>
                                    <div class="details">
                                        {{ __( 'net sales this month', 'dokan-lite' ) }} <span :class="overview.sales.class">{{ overview.sales.parcent }}</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="commission !mt-[13px]">
                                <div class="dashicons dashicons-chart-pie"></div>
                                <router-link :to="hasPro ? {name: 'Reports'} : ''">
                                    <strong>
                                        <currency :amount="overview.earning.this_month"></currency>
                                    </strong>
                                    <div class="details">
                                        {{ __( 'commission earned', 'dokan-lite' ) }} <span :class="overview.earning.class">{{ overview.earning.parcent }}</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="vendor">
                                <div class="dashicons dashicons-id"></div>
                                <router-link :to="hasPro ? {name: 'Vendors'} : ''">
                                    <strong>{{ overview.vendors.this_month }} {{ __( 'Vendor', 'dokan-lite' ) }}</strong>
                                    <div class="details">
                                        {{ __( 'signup this month', 'dokan-lite' ) }} <span :class="overview.vendors.class">{{ overview.vendors.parcent }}</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="approval">
                                <div class="dashicons dashicons-businessman"></div>
                                <router-link :to="hasPro ? {name: 'Vendors', query: {status: 'pending'} } : ''">
                                    <strong>{{ overview.vendors.inactive }} {{ __( 'Vendor', 'dokan-lite' ) }}</strong>
                                    <div class="details">{{ __( 'awaiting approval', 'dokan-lite' ) }}</div>
                                </router-link>
                            </li>
                            <li class="product">
                                <div class="dashicons dashicons-cart"></div>
                                <a href="#">
                                    <strong>{{ overview.products.this_month }} {{ __( 'Products', 'dokan-lite' ) }}</strong>
                                    <div class="details">
                                        {{ __( 'created this month', 'dokan-lite' ) }} <span :class="overview.products.class">{{ overview.products.parcent }}</span>
                                    </div>
                                </a>
                            </li>
                            <li class="withdraw">
                                <div class="dashicons dashicons-money"></div>
                                <router-link :to="{name: 'Withdraw', query: {status: 'pending'}}">
                                    <strong>{{ overview.withdraw.pending }} {{ __( 'Withdrawals', 'dokan-lite' ) }}</strong>
                                    <div class="details">{{ __( 'awaiting approval', 'dokan-lite' ) }}</div>
                                </router-link>
                            </li>
                        </ul>
                    </div>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>

                <postbox :title="__( 'Dokan News Updates', 'dokan-lite' )">
                    <div class="rss-widget" v-if="feed !== null">
                        <ul>
                            <li v-for="news in feed">
                                <a :href="news.link + '?utm_source=wp-admin&utm_campaign=dokan-news'" target="_blank">{{ news.title }}</a>
                            </li>
                        </ul>

                        <div class="subscribe-box">
                            <template v-if="!subscribe.success">
                                <div class="loading" v-if="subscribe.loading">
                                    <loading></loading>
                                </div>
                                <h3 class='text-xl'>{{ __( 'Stay up-to-date', 'dokan-lite' ) }}</h3>
                                <p>
                                    {{ __( 'We\'re constantly developing new features, stay up-to-date by subscribing to our newsletter.', 'dokan-lite' ) }}
                                </p>
                                <div class="form-wrap">
                                    <input type="text" :placeholder="__( 'Your Name', 'dokan-lite' )" v-model="subscribe.full_name" />
                                    <input type="email" v-model="subscribe.email" :placeholder="__( 'Your Email Address', 'dokan-lite' )" @keyup.enter="emailSubscribe()">
                                    <button class="button" @click="emailSubscribe()">{{ __( 'Subscribe', 'dokan-lite' ) }}</button>
                                </div>
                            </template>
                            <div v-else class="thank-you">{{ __( 'Thank you for subscribing!', 'dokan-lite' ) }}</div>
                        </div>
                    </div>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>
            </div>

            <div class="right-side">
                <postbox :title="__( 'Overview', 'dokan-lite' )" class="overview-chart">
                    <div v-if="report !== null">
                        <chart :data="report"></chart>
                    </div>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>
            </div>
        </div>

    </div>
</template>

<script>
let Postbox     = dokan_get_lib('Postbox');
let Loading     = dokan_get_lib('Loading');
let Currency    = dokan_get_lib('Currency');
let AdminNotice = dokan_get_lib('AdminNotice');

import Chart from "admin/components/Chart.vue"
// import UpgradeBanner from "admin/components/UpgradeBanner.vue"

export default {

    name: 'Dashboard',

    components: {
        Postbox,
        Loading,
        Chart,
        Currency,
        // UpgradeBanner,
        AdminNotice,
    },

    data () {
        return {
            overview: null,
            feed: null,
            report: null,
            subscribe: {
                success: false,
                loading: false,
                email: '',
                full_name: '',
            },
            hasPro: dokan.hasPro ? true : false
        }
    },

    created() {
        this.fetchOverview();
        this.fetchFeed();
        this.fetchReport();
    },

    methods: {

        fetchOverview() {
            dokan.api.get('/admin/report/summary')
            .done(response => {
                this.overview = response;
            });
        },

        fetchFeed() {
            dokan.api.get('/admin/dashboard/feed')
            .done(response => {
                this.feed = response;
            });
        },

        fetchReport() {
            dokan.api.get('/admin/report/overview')
            .done(response => {
                this.report = response;
            });
        },

        validEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },

        emailSubscribe() {
            if ( ! this.validEmail(this.subscribe.email) ) {
                return;
            }

            let action = 'https://api.getwemail.io/v1/embed/subscribe/8da67b42-c367-4ad3-ae70-5cf63635a832';
            this.subscribe.loading = true;

            let options = {
                type: 'POST',
                url:  action,
                data: {
                    email: this.subscribe.email,
                    full_name: this.subscribe.full_name,
                    tag: '8e0ae2bb-e838-4ec8-9aa1-c9e5dd96fe34'
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
            };

            wp.ajax.send( options, options.data ).always( (response) => {
                this.subscribe.success = true;
                this.subscribe.loading = false;
            });
        }
    },
};
</script>

<style lang="less">
.dokan-dashboard {

    .widgets-wrapper {
        display: block;
        overflow: hidden;
        margin-top: 15px;
        width: 100%;

        .left-side,
        .right-side {
            float: left;
            width: 48%;
        }

        .left-side {
            margin-right: 3%;
        }
    }

    .dokan-postbox {
        .loading {
            display: block;
            width: 100%;
            margin: 15px auto;
            text-align: center;
        }
    }

    .subscribe-box {
        margin: 20px -12px -11px -12px;
        padding: 0 15px 15px;
        background: #fafafa;
        border-top: 1px solid #efefef;
        position: relative;

        h3 {
            margin: 10px 0;
        }

        p {
            margin-bottom: 10px !important;
        }

        .thank-you {
            background: #4fa72b;
            margin-top: 10px;
            padding: 15px;
            border-radius: 3px;
            color: #fff;
        }

        .form-wrap {
            display: flex;

            input[type="email"] {
                width: 100%;
                padding: 3px 0 3px 6px;
                margin: 0px -1px 0 0;
            }

            button.button {
                box-shadow: none;
                background: #FF5722;
                color: #fff;
                border-color: #FF5722;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;

                &:hover {
                    background: lighten(#FF5722, 5%);
                }
            }
        }

        .loading {
            position: absolute;
            height: 100%;
            margin: 0 0 0 -15px;
            background: rgba(0,0,0, 0.2);

            .dokan-loader {
                margin-top: 30px;
            }
        }
    }
}

@media only screen and (max-width: 770px) {
    .dokan-dashboard {
        .widgets-wrapper {
            .left-side {
                margin-right: 0;
            }
            .left-side, .right-side {
                width: auto;
            }
        }
    }
}

@media only screen and (max-width: 500px) {
    .dokan-dashboard {
        .widgets-wrapper {
            .left-side {
                margin-right: 0;
            }
            .left-side, .right-side {
                width: auto;
            }
        }
    }

    .dokan-dashboard .postbox.dokan-status ul li a {
        .details {
            span.up, span.down {
                display: none;
            }
        }
        strong {
            font-size: 16px;
        }
    }
}

@media only screen and (max-width: 360px) {
    .dokan-dashboard .postbox.dokan-status ul li a .details {
        display: none;
    }
}
</style>
