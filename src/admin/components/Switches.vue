<template>
    <label class="switch tips">
        <input type="checkbox" class="toogle-checkbox" :class="enabled ? 'enabled' : ''" :checked="enabled" @click="trigger(!enabled, value)" :value="value" :disabled="disabled"/>
        <span class="slider round" :style="enabledStyle"></span>
    </label>
</template>

<script>
export default {

    name: 'Switches',

    props: {
        enabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        activeColor: {
            type: String,
            required: false,
            default: '#0090ff',
        },
        inactiveColor: {
            type: String,
            required: false,
            default: '#d7dadd',
        },
        toggleColor: {
            type: String,
            required: false,
            default: '#fff',
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

        trigger(enabled, value) {
            this.$emit('input', enabled, value);
        }
    },

    computed: {
        enabledStyle() {
            return {
                '--dokan-toggle-color': this.toggleColor,
                '--dokan-toggle-inactive-color': this.inactiveColor,
                '--dokan-toggle-active-color': this.activeColor
            };
        }
    }
};
</script>

<style lang="less">
    .switch {
        position: relative;
        display: inline-block;
        width: 42px;
        height: 20px;
        input {
           display: none;
            &.enabled + .slider {
                background-color: var(--dokan-toggle-active-color);
                 &:before {
                     -webkit-transform: translateX(22px);
                     -ms-transform: translateX(22px);
                     transform: translateX(22px);
                 }
            }
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--dokan-toggle-inactive-color);
            -webkit-transition: .4s;
            transition: .4s;

            &:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: var(--dokan-toggle-color);
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
