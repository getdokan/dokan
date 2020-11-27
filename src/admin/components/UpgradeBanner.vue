<template>
    <div class="dokan-upgrade-bar" v-if="show && showUpgrade">
        You're using <span>Dokan Lite</span>. To unlock more features, consider
        <a target="_blank" rel="noopener" :href="upgradeURL">
            Upgrading to Pro</a
        >.

        <div class="close-button" title="Dismiss the notice" @click="dismiss()">
            &times;
        </div>
    </div>
</template>

<script>
export default {
    name: "UpgradeBanner",
    data() {
        return {
            show: true,
            upgradeURL: dokan.urls.upgradeToPro
        };
    },

    computed: {
        showUpgrade() {
            return !dokan.hasPro && dokan.proNag === "show";
        }
    },

    methods: {
        dismiss() {
            this.show = false;

            wp.ajax.post("dokan-upgrade-dissmiss");
        }
    }
};
</script>

<style lang="less">
.dokan-upgrade-bar {
    background: #ffdbcf;
    padding: 5px 20px;
    margin: -10px -21px 15px -23px;
    border: 1px solid #dedede;
    border-top: none;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    text-align: center;

    span {
        color: #ff5722;
        font-size: 14px;
    }

    .close-button {
        float: right;
        font-size: 18px;
        padding: 0px 10px;
        cursor: pointer;
        visibility: hidden;

        &:hover {
            background: #ff5822;
            color: #fff;
            display: inline-block;
            border-radius: 3px;
        }
    }

    &:hover .close-button {
        visibility: visible;
    }
}
</style>
