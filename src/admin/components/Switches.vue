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

<style lang="less">
    .switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 18px;
        input {
           display: none;
           &:checked + .slider {
                background-color: #64b450;
                &:before {
                    -webkit-transform: translateX(22px);
                    -ms-transform: translateX(22px);
                    transform: translateX(22px);
                }
           }
           &:focus + .slider {
                box-shadow: 0 0 1px #2196F3;
           }
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;

            &:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                -webkit-transition: .4s;
                transition: .4s;
            }
            &.round {
                border-radius: 34px;
                &:before {
                    border-radius: 50%;
                }
            }
        }
    }
</style>
