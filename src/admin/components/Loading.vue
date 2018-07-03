<template>
    <div class="dokan-loader"><div></div><div></div></div>
</template>

<script>
export default {

    name: 'Loading',

    data () {
        return {

        };
    }
};
</script>

<style lang="css">
.dokan-loader {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
}

.dokan-loader div {
    position: absolute;
    border: 4px solid #FF5722;
    opacity: 1;
    border-radius: 50%;
    animation: dokan-loader 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.dokan-loader div:nth-child(2) {
    animation-delay: -0.5s;
}

@keyframes dokan-loader {
    0% {
        top: 28px;
        left: 28px;
        width: 0;
        height: 0;
        opacity: 1;
    }

    100% {
        top: -1px;
        left: -1px;
        width: 58px;
        height: 58px;
        opacity: 0;
    }
}
</style>
