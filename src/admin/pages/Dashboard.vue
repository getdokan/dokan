<template>
    <div class="dokan-dashboard">
        <h1>Dashboard</h1>

        <div class="widgets-wrapper">
            <postbox title="At a Glance" extraClass="dokan-status">
                <div class="dokan-status" v-if="overview">
                    <ul>
                        <li class="sale">
                            <div class="dashicons dashicons-chart-bar"></div>
                            <a href="#">
                                <strong v-html="currency(overview.orders.this_month)"></strong>
                                <div class="details">
                                    net sales this month <span :class="overview.orders.class">{{ overview.orders.parcent }}</span>
                                </div>
                            </a>
                        </li>
                        <li class="commission">
                            <div class="dashicons dashicons-chart-pie"></div>
                            <a href="#">
                                <strong v-html="currency(overview.earning.this_month)"></strong>
                                <div class="details">
                                    commission earned <span :class="overview.earning.class">{{ overview.earning.parcent }}</span>
                                </div>
                            </a>
                        </li>
                        <li class="vendor">
                            <div class="dashicons dashicons-id"></div>
                            <a href="#">
                                <strong>{{ overview.vendors.this_month }}</strong>
                                <div class="details">
                                    signup this month <span :class="overview.vendors.class">{{ overview.vendors.parcent }}</span>
                                </div>
                            </a>
                        </li>
                        <li class="approval">
                            <div class="dashicons dashicons-businessman"></div>
                            <a href="#">
                                <strong>{{ overview.vendors.inactive }}</strong>
                                <div class="details">awaiting approval</div>
                            </a>
                        </li>
                        <li class="product">
                            <div class="dashicons dashicons-cart"></div>
                            <a href="#">
                                <strong>{{ overview.products.this_month }}</strong>
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
            <postbox title="Overview"></postbox>
            <postbox title="Dokan News Updates"></postbox>
        </div>

    </div>
</template>

<script>
let Postbox = dokan_get_lib('Postbox');
let Loading = dokan_get_lib('Loading');

export default {

    name: 'Dashboard',

    components: {
        Postbox,
        Loading
    },

    data () {
        return {
            overview: null
        }
    },

    created() {
        this.fetchOverview();
    },

    methods: {

        fetchOverview() {
            dokan.api.get('/admin/report/summary')
            .done(response => {
                this.overview = response;
            });
        },

        currency(price) {
            return accounting.formatMoney(price, dokan.currency);
        }
    },
}
</script>

<style lang="less">
.dokan-dashboard {

    .widgets-wrapper {
        display: block;
        overflow: hidden;
        margin-top: 15px;
        width: 100%;
    }

    .dokan-postbox {
        width: ~"calc(50% - 15px)";
        margin-right: 20px;
        float: left;

        &:nth-child(n+2) {
            margin-right: 0;
        }

        &:nth-child(2n+1) {
            clear: both;
        }

        .loading {
            display: block;
            width: 100%;
            margin: 0 auto;
            text-align: center;
        }
    }
}
</style>
