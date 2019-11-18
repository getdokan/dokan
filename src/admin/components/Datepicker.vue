<template>
    <input
        type="text"
        :value="value"
        :placeholder="placeholder"
        @input="updateValue($event.target.value)"
    >
</template>

<script>
    export default {
        props: {
            value: {
                type: String,
                required: true,
                default: ''
            },

            format: {
                type: String,
                required: false,
                default: ''
            },

            placeholder: {
                type: String,
                required: false,
                default: ''
            },

            changeMonthYear: {
                type: Boolean,
                required: false,
                default: false
            },
        },

        mounted() {
            const vm = this;

            jQuery(vm.$el).datepicker({
                dateFormat:  vm.format,
                changeMonth: vm.changeMonthYear,
                changeYear:  vm.changeMonthYear,

                beforeShow() {
                    jQuery(this).datepicker('widget').addClass('dokan-datepicker');
                },

                onSelect(date) {
                    vm.updateValue(date);
                }
            });
        },

        methods: {
            updateValue(value) {
                if ( ! value) {
                    value = moment().format('YYYY-MM-DD');
                }

                this.$emit('input', value);
            }
        }
    };
</script>
