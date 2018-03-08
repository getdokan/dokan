<template>
    <div class="dokan-dashboard">
        <h1>Dashboard</h1>

        <div class="widgets-wrapper">
            <postbox title="At a Glance" extraClass="dokan-status">
                <div class="dokan-status">
                    <ul>
                        <li class="sale">
                            <div class="dashicons dashicons-chart-bar"></div>
                            <a href="#">
                                <strong>
                                    $1200
                                </strong>
                                <div class="details">
                                    net sales this month<span class="up">2</span>
                                </div>
                            </a>
                        </li>
                        <li class="commission">
                            <div class="dashicons dashicons-chart-pie"></div>
                            <a href="#">
                                <strong>
                                    $1100
                                </strong>
                                <div class="details">
                                    net sales this month<span class="up">2</span>
                                </div>
                            </a>
                        </li>
                        <li class="vendor">
                            <div class="dashicons dashicons-id"></div>
                            <a href="#">
                                <strong>100 Vendor</strong>
                                <div class="details">
                                    signup this month<span class="down">3</span>
                                </div>
                            </a>
                        </li>
                        <li class="approval">
                            <div class="dashicons dashicons-businessman"></div>
                            <a href="#">
                                <strong>10 Vendor</strong>
                                <div class="details">
                                    awaiting approval
                                </div>
                            </a>
                        </li>
                        <li class="product">
                            <div class="dashicons dashicons-cart"></div>
                            <a href="#">
                                <strong>17 Product</strong>
                                <div class="details">
                                    created this month<span class="up">10</span>
                                </div>
                            </a>
                        </li>
                        <li class="withdraw">
                            <div class="dashicons dashicons-money"></div>
                            <a href="#">
                                <strong>19 Withdrawals</strong>
                                <div class="details">
                                    awaiting approval
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </postbox>
            <postbox title="Overview"></postbox>
            <postbox title="Dokan News Updates"></postbox>
        </div>

    </div>
</template>

<script>
let Postbox = dokan_get_lib('Postbox');

export default {

    name: 'Dashboard',

    components: {
        Postbox,
    },

    data () {
        return {

        }
    },

    created() {

    },

    methods: {

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
    }
}
</style>
