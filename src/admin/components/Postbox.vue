<template>
    <div :class="['postbox', 'dokan-postbox', { 'closed': !showing }, extraClass]">
        <button type="button" class="handlediv" aria-expanded="false" @click="showing = !showing">
            <span class="toggle-indicator" aria-hidden="true"></span>
        </button>

        <h2 class="hndle"><span>{{ title }}</span></h2>
        <div class="inside">
            <div class="main">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {

    name: 'Postbox',
    props: {
        title: {
            type: String,
            required: true,
            default: ''
        },
        extraClass: {
            type: String,
            default: null
        }
    },

    data () {
        return {
            showing: true
        };
    }
};
</script>

<style lang="css">
.dokan-postbox .toggle-indicator:before {
    content: "\f142";
    display: inline-block;
    font: 400 20px/1 dashicons;
    speak: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-decoration: none!important
}

.dokan-postbox.closed .toggle-indicator:before {
    content: "\f140";
}

.dokan-postbox {
    position: relative;
}

.dokan-postbox h2.hndle {
    font-size: 14px;
    padding: 8px 12px;
    margin: 0;
    line-height: 1.4;
}
</style>
