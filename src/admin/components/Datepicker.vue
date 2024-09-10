<template>
    <input
        type="text"
        :value="value"
        ref="datepicker"
        :placeholder="placeholder"
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
                default: 'YYYY-MM-DD'
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
            startFromCurrentDate: {
                type: Boolean,
                required: false,
                default: false
            }
        },

        computed: {
            computedValue: {
                get() {
                    return this.value;
                },
                set(newValue) {
                    this.$emit('input', newValue);
                }
            }
        },

        mounted() {
            this.initDatepicker();
        },

        methods: {
            initDatepicker() {
                const vm = this;

                const options = {
                    dateFormat: vm.format,
                    changeMonth: vm.changeMonthYear,
                    changeYear: vm.changeMonthYear,
                    minDate: vm.startFromCurrentDate ? new Date() : null,

                    beforeShow() {
                        jQuery(this).datepicker('widget').addClass('dokan-datepicker');
                    },

                    onSelect(date) {
                        vm.$nextTick(() => {
                            vm.updateValue(date);
                        });
                    }
                };

                jQuery(this.$refs.datepicker).datepicker(options);
            },

            updateValue(value) {
                if (!value) {
                    value = moment().format(this.format);
                }
                this.computedValue = value;
            }
        },

        watch: {
            value(newVal) {
                jQuery(this.$refs.datepicker).datepicker('setDate', newVal);
            }
        },

        beforeDestroy() {
            jQuery(this.$refs.datepicker).datepicker('destroy');
        }
    };
</script>
