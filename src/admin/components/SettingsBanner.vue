<template>
<div id="dokan-settings-banner">
    <img :src="bannerImage" :alt="__( 'Dokan Settings Banner', 'dokan-lite' )">
    <div class="content">
        <h1>Looking for Coupons, Variable Products, SEO or Shipping?</h1>
        <p>Unlock these awesome frontend features with Dokan PRO</p>
        <a class="button" href="#">Upgrade to Pro</a>
        <router-link class="button custom-button" :to="{ name: 'VendorCapabilities' }">Check Out All Vendor Functionalities</router-link>
    </div>
</div>
</template>

<script>
export default {
    name: "SettingsBanner",
    computed: {
        bannerImage() {
            return `${dokan.urls.assetsUrl}/images/dokan-settings-banner.svg`;
        },
    },
}
</script>

<style lang="less">
    #dokan-settings-banner {
        margin: 20px 0px;
        padding: 40px;
        background: #fff;
        display: flex;
        align-items: flex-start;

        a {
            box-shadow: none;
            background: #FF5722;
            color: #fff;
            border-color: #FF5722;

            &:hover {
                background: lighten(#FF5722, 5%);
            }
        }

        img {
            flex: 1;
        }

        .content {
            flex: 4;
            padding: 20px 50px;

            p {
                margin: 30px 0px;
                font-size: 14px;
            }

            a {
                margin-right: 8px;
            }

            .custom-button {
                background: #fff;
                color: #565656;
                border-color: #DFDADF;
                -webkit-box-shadow: 0px 0px 11px 1px rgba(235,235,235,1);
                -moz-box-shadow: 0px 0px 11px 1px rgba(235,235,235,1);
                box-shadow: 0px 0px 11px 1px rgba(235,235,235,1);

                &:hover {
                    background: darken(#fff, 5%);
                }
            }
        }
    }
</style>
