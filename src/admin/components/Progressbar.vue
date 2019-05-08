<template>
    <div id="progressbar" :class="bgColor">
        <div id="value" :style="{width: value + '%'}" :class="fgColor">
            <template v-if="!hidden">{{ value + '%' }}</template>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: Number,
                default: 0
            },
            hidden: {
                type: Boolean,
                default: false
            },
            bgColor: {
                type: String,
                default: 'defaultBg'
            },
            fgColor: {
                type: String,
                default: 'defaultFg'
            }
        },
    };
</script>

<style scoped>
    #progressbar {
        border-radius: 13px;
        padding: 3px;
        margin-bottom : 20px;
    }
    .defaultFg {
        background-color: #00a0d2;
    }
    .defaultBg {
        background-color: #eee;
    }
    .blue {
        background-color: blue;
    }
    .red {
        background-color: red;
    }
    .green {
        background-color: green;
    }
    .yellow {
        background-color: yellow;
    }
    .orange {
        background-color: orange;
    }
    #value {
        height: 20px;
        border-radius: 10px;
        text-align: center;
        color:#fff;
    }
</style>