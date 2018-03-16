<template>
    <label class="switch tips">
        <input type="checkbox" class="toogle-checkbox" :checked="enabled" @change="trigger" :value="value">
        <span class="slider round"></span>
    </label>
</template>

<script>
export default {

    name: 'Switches',

    props: {
        enabled: {
            type: Boolean, // String, Number, Boolean, Function, Object, Array
            required: true,
            default: false
        },
        value: {
            type: [String, Number]
        }
    },

    data () {
        return {

        };
    },

    methods: {

        trigger(e) {
            this.$emit('input', e.target.checked, e.target.value);
        }
    }
};
</script>

<style lang="css">
</style>
