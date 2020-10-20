<template>
    <div id="dokan-upgrade-wrapper">
        <div id="dokan-upgrade-popper">
            <p>{{ __("You're using", 'dokan-lite' ) }} <span>{{ __( 'Dokan Lite', 'dokan-lite' ) }}</span>. {{ __( 'To unlock more features, consider', 'dokan-lite' ) }}</p>
            <a href="https://wedevs.com/dokan-lite-upgrade-to-pro" class="button">{{ __( 'Upgrade to Pro', 'dokan-lite' ) }}</a>
        </div>

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
                    <button class="button">{{ __( 'Upgrade to Pro', 'dokan-lite' ) }}</button>

                    <div class="promo-card">
                        <img :src="bonusImage" :alt="__( 'Dokan Upgrade Promo', 'dokan-lite' )">
                        <p>{{ __( 'Bonus: Dokan Lite users get 50% off regular price, automatically applied to checkout.', 'dokan-lite' ) }}</p>
                    </div>

                    <span @click="closePopup">{{ __( 'Already upgraded?', 'dokan-lite' ) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "UpgradePopup",
    data() {
        return {
            showPopup: false,
        }
    },
    methods: {
        closePopup() {
            this.showPopup = false;
        },
        openPopup() {
            this.showPopup = true;
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

#dokan-upgrade-wrapper {
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
                }

                span {
                    cursor: pointer;
                    color: #AD644E;
                }
            }

        }
    }

    #dokan-upgrade-popper {
        background: #fff;
        padding: 5px 20px;
        margin-bottom: 20px;
        margin-top: 20px;
        border: 1px solid #ccd0d4;
        box-shadow: 0 1px 1px rgba(0,0,0,.04);
        display: flex;
        align-items: center;
        width: auto;

        p {
            font-size: 14px;
            font-weight: bold;

            span {
                color: #ff5722;
            }
        }
    }
}
</style>
