<template>
    <div class="field combine_fields">
        <div class="percent_fee">
            <input
                type="text"
                class="wc_input_decimal regular-text medium"
                :id="percentageId"
                :name="percentageName"
                v-model="percentage"
                v-on:input="onInput"
            />
            {{ '%' }}
        </div>
        <div>
            {{ '+' }}
        </div>
        <div class="fixed_fee">
            <span>{{ getCurrencySymbol }}</span>
            <input
                type="text"
                class="wc_input_price regular-text medium"
                :id="fixedId"
                :name="fixexName"
                v-model="fixed"
                v-on:input="onInput"
            />
        </div>
    </div>
</template>

<script>
    import { fixed } from 'lodash/fp/_falseOptions';
    const Debounce = dokan_get_lib('debounce');

    export default {
        name: 'CombineInput',
        props: {
            fixedId: {
                type: String,
                default: 'fixed-val-id'
            },
            percentageId: {
                type: String,
                default: 'percentage-val-id'
            },
            fixexName: {
                type: String,
                default: 'fixed-val-name'
            },
            percentageName: {
                type: String,
                default: 'percentage-val-name'
            },
            value: {
                type: Object,
                default: {
                    fixed: 0,
                    percentage: 0
                }
            },
        },
        data() {
            return {
                fixed: this.formatPositiveValue( this.value.fixed ) ?? 0,
                percentage: this.formatPositiveValue( this.value.percentage ) ?? 0
            };
        },
        watch: {
            value: {
                handler(newVal, oldVal) {
                    this.fixed = this.formatPositiveValue( newVal.fixed );
                    this.percentage = this.formatPositiveValue( newVal.percentage );
                },
                deep: true
            }
        },
        methods: {
            onInput: Debounce( function() {
                let self = this,
                    data = {
                        fixed: self.fixed,
                        percentage: self.percentage
                    };

                this.$emit('change', data);
            }, 1600 ),
            formatPositiveValue: ( value ) => {
                return accounting.formatNumber( value, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal );
            },
        },
        computed:{
            getCurrencySymbol() {
                return window.dokan.currency.symbol;
            }
        }
    };
</script>

<style scoped lang='less'>
    .combine_fields {
        display: flex;
        justify-content: right;
        align-items: center;

        .percent_fee {
            padding-right: 10px;
        }

        .fixed_fee,
        .percent_fee {
            input {
                width: 100px;
            }
        }
    }
</style>
