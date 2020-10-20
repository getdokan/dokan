<template>
    <div id="dokan-upgrade-wrapper">
        <div id="dokan-upgrade-popper">
            <p>{{ __("You're using", 'dokan-lite' ) }} <span>{{ __( 'Dokan Lite', 'dokan-lite' ) }}</span>. {{ __( 'To unlock more features, consider', 'dokan-lite' ) }}</p>
            <a :href="upgradeURL" class="button">{{ __( 'Upgrade to Pro', 'dokan-lite' ) }}</a>
        </div>
    </div>
</template>

<script>
export default {
    name: "UpgradeBanner",
    data() {
        return {
            upgradeURL: dokan.dokan_upgrade_to_pro_url
        }
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
