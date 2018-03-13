<template>
    <div class="dokan-dashboard">
        <h1>Dashboard</h1>

        <div class="widgets-wrapper">
            <div class="left-side">
                <postbox title="At a Glance" extraClass="dokan-status">
                    <div class="dokan-status" v-if="overview !== null">
                        <ul>
                            <li class="sale">
                                <div class="dashicons dashicons-chart-bar"></div>
                                <a href="#">
                                    <strong>{{ overview.orders.this_month | currency }}</strong>
                                    <div class="details">
                                        net sales this month <span :class="overview.orders.class">{{ overview.orders.parcent }}</span>
                                    </div>
                                </a>
                            </li>
                            <li class="commission">
                                <div class="dashicons dashicons-chart-pie"></div>
                                <a href="#">
                                    <strong>{{ overview.earning.this_month | currency }}</strong>
                                    <div class="details">
                                        commission earned <span :class="overview.earning.class">{{ overview.earning.parcent }}</span>
                                    </div>
                                </a>
                            </li>
                            <li class="vendor">
                                <div class="dashicons dashicons-id"></div>
                                <a href="#">
                                    <strong>{{ overview.vendors.this_month }} Vendor</strong>
                                    <div class="details">
                                        signup this month <span :class="overview.vendors.class">{{ overview.vendors.parcent }}</span>
                                    </div>
                                </a>
                            </li>
                            <li class="approval">
                                <div class="dashicons dashicons-businessman"></div>
                                <a href="#">
                                    <strong>{{ overview.vendors.inactive }} Vendor</strong>
                                    <div class="details">awaiting approval</div>
                                </a>
                            </li>
                            <li class="product">
                                <div class="dashicons dashicons-cart"></div>
                                <a href="#">
                                    <strong>{{ overview.products.this_month }} Products</strong>
                                    <div class="details">
                                        created this month <span :class="overview.products.class">{{ overview.products.parcent }}</span>
                                    </div>
                                </a>
                            </li>
                            <li class="withdraw">
                                <div class="dashicons dashicons-money"></div>
                                <a href="#">
                                    <strong>{{ overview.withdraw.pending }} Withdrawals</strong>
                                    <div class="details">awaiting approval</div>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>

                <postbox title="Dokan News Updates">
                    <div class="rss-widget" v-if="feed !== null">
                        <ul>
                            <li v-for="news in feed">
                                <a :href="news.link + '?utm_source=wp-admin&utm_campaign=dokan-news'" target="_blank">{{ news.title }}</a>
                            </li>
                        </ul>
                    </div>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>
            </div>

            <div class="right-side">
                <postbox title="Overview">
                    <chart :data="report" v-if="report !== null"></chart>
                    <div class="loading" v-else>
                        <loading></loading>
                    </div>
                </postbox>
            </div>
        </div>

    </div>
</template>

<script>
let Postbox = dokan_get_lib('Postbox');
let Loading = dokan_get_lib('Loading');

import Chart from "admin/components/Chart.vue"

export default {

    name: 'Dashboard',

    components: {
        Postbox,
        Loading,
        Chart
    },

    data () {
        return {
            overview: null,
            feed: null,
            report: null
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
    },

    filters: {
        currency(price) {
            return accounting.formatMoney(price, dokan.currency);
        }
    }
}
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
}
</style>
