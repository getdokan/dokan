<template>
    <div id="dokan-upgrade-to-pro-wrapper">
        <div v-if="showPopup" id="dokan-upgrade-popup">
            <div class="modal-content">
                <span @click="closePopup" class="close"></span>
                <div class="header">
                    <img :src="headerImage" :alt="__( 'Dokan Upgrade Popup', 'dokan-lite' )">
                    <h1>{{ __( 'Unlock 20+ Modules', 'dokan-lite' ) }}</h1>
                    <p class="text-brand">{{ __( 'with Dokan Premium Plans', 'dokan-lite' ) }}</p>
                    <p class="text-disabled">
                        {{ __( "We’re sorry, Dokan Modules are not available on Dokan Lite. Please upgrade to a PRO plan to unlock the modules of your choice.", 'dokan-lite' ) }}
                    </p>
                </div>

                <div class="body">
                    <a target="_blank" rel="noopener noreferrer" :href="upgradeURL" class="button">{{ __( 'Upgrade to Pro', 'dokan-lite' ) }}</a>

                    <div class="promo-card">
                        <img :src="bonusImage" :alt="__( 'Dokan Upgrade Promo', 'dokan-lite' )">
                        <p>{{ __( 'Bonus: Dokan Lite users get 30% off regular price. Click on the link above to obtain the coupon & apply it during checkout.', 'dokan-lite' ) }}</p>
                    </div>

                    <span><a target="_blank" rel="noopener noreferrer" href="https://wedevs.com/docs/dokan/getting-started/installation-2/">{{ __( 'Already upgraded?', 'dokan-lite' ) }}</a></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ModuleUpgradePopup",
    props: {
        showPopup: {
            type: Boolean,
            required: true,
            default: true
        },
    },
    data() {
        return {
            upgradeURL: dokan.urls.upgradeToPro
        }
    },
    methods: {
        closePopup() {
            this.$emit('toggle', false);
        },
        openPopup() {
            this.$emit('toggle', true);
        },
    },
    computed: {
        headerImage() {
            return `${dokan.urls.assetsUrl}/images/dokan-upgrade-popup-header.svg`;
        },
        bonusImage() {
            return `${dokan.urls.assetsUrl}/images/dokan-upgrade-popup-bonus.svg`;
        },
    },
}
</script>

<style lang="less">

#dokan-upgrade-to-pro-wrapper {
    button, a {
        box-shadow: none;
        background: #FF5722;
        color: #fff;
        border-color: #FF5722;
        margin: 0px 30px;
        &:hover {
            background: lighten(#FF5722, 5%);
        }
    }
    .text-brand {
        color: #FF5722;
    }
    .text-disabled {
        color: #919191;
    }
    #dokan-upgrade-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        min-height: 360px;
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,0.7);
        z-index: 99900;
        .modal-content {
            background-color: #fefefe;
            z-index: 100000;
            margin: 8% auto;
            width: 500px;
            border-radius: 9px;
            text-align: center;
            p {
                font-size: 14px;
            }
            span {
                &.close {
                    float: right;
                    margin-top: -15px;
                    margin-right: -10px;
                    cursor: pointer;
                    color: #fff;
                    border: 1px solid #AEAEAE;
                    border-radius: 50%;
                    background: #fff;
                    font-size: 18px;
                    display: inline-block;
                    line-height: 0px;
                    padding: 20px 14px;
                    &:before {
                        content: "X";
                        color: #484848;
                    }
                }
            }
            .header {
                padding: 20px 40px;
                h1 {
                    font-size: 30px;
                }
                img {
                    height: 120px;
                    display: block;
                    width: 50%;
                    margin: 20px auto 10px;
                }
            }
            .body {
                padding: 20px 40px;
                background: rgba(255, 87, 34, 0.08);
                button {
                    font-size: 16px !important;
                }
                .promo-card {
                    margin: 20px 0px;
                    background: #fff;
                    padding: 10px;
                    border-radius: 9px;
                    -webkit-box-shadow: 0px 0px 22px 0px rgba(207,207,207,1);
                    -moz-box-shadow: 0px 0px 22px 0px rgba(207,207,207,1);
                    box-shadow: 0px 0px 22px 0px rgba(207,207,207,1);
                    display: flex;
                    align-items: center;

                    p {
                        text-align: left;
                        margin-left: 16px;
                    }
                }
                span {
                    a {
                        background: transparent;
                        text-decoration: none;
                        cursor: pointer;
                        color: #AD644E;
                    }
                }
            }
        }
    }
}

</style>
