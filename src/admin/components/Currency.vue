<template>
    <div v-html="formattedPrice( amount )"></div>
</template>

<script>
export default {
    props : ['amount'],

    methods: {
        formattedPrice(value) {
            return accounting.formatMoney( value, dokan.currency );
        }
    }
};
</script>
