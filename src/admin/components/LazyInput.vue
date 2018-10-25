<template>
    <input
        :type="type"
        :value="value"
        :placeholder="placeholder"
        @input="updateValue($event.target.value)"
        @focus="focus"
        @blur="blur"
    >
</template>

<script>
    import { debounce } from 'debounce';

    export default {
        name: 'LazyInput',

        props: {
            value: {
                type: String,
                required: true,
                default: ''
            },

            type: {
                type: String,
                required: false,
                default: 'text'
            },

            placeholder: {
                type: String,
                required: false,
                default: ''
            }
        },

        data() {
            return {
                delay: 500,
                debouncer: null
            };
        },

        methods: {
            updateValue(value) {
                const vm = this;

                if (vm.debouncer) {
                    vm.debouncer.clear();
                }

                vm.debouncer = debounce(() => {
                    vm.triggerInput(value);
                }, vm.delay);

                vm.debouncer();
            },

            focus() {
                this.$emit('focus');
            },

            blur() {
                this.$emit('blur');
            },

            triggerInput(value) {
                this.$emit('input', value);
            }
        }
    };
</script>
