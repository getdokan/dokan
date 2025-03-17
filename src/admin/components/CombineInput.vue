<template>
  <div
    class="d-xs:text-[8px] sm:text-[14px] d-xs:w-fit sm:w-fit md:w-auto h-[32px] flex d-xs:shadow-md md:shadow-none rounded-[5px]">
    <div
      class="md:shadow-md  border-[0.957434px] border-[#E9E9E9] d-xs:!border-r-0 md:!border-r-[0.957434px] rounded-[5px] d-xs:!rounded-r-none md:!rounded-r-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
      <input
        type="text"
        class="wc_input_decimal !border-none focus:!shadow-none !border-0 !w-[100%] !min-h-full !pl-2 !pr-0 !pt-0 !pb-0 min-w-[75px]"
        ref="percentage"
        :id="percentageId"
        :name="percentageName"
        :value="formatPositiveValue( value.percentage ?? '' )"
        v-on:input="( e ) => onInput(e.target.value, 'percentage')"
        style="border: none !important;"
      />
      <div
        class="d-xs:border-l-0 md:border-l-[0.957434px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100 !min-h-full">
        <span class="d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2">{{ __( '%', 'dokan-lite' ) }}</span></div>
    </div>
    <div class="d-xs:border-[0.957434px] md:border-0 d-xs:bg-gray-100 md:bg-transparent  flex justify-center items-center">
      <span class="d-xs:p-1 md:p-2">{{ __( '+', 'dokan-lite' ) }}</span>
    </div>
    <div
      class="md:shadow-md border-[0.957434px] d-xs:!border-l-0 md:!border-l-[0.957434px] rounded-[5px] d-xs:!rounded-l-none md:!rounded-l-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
      <div
        class="d-xs:border-r-0 md:border-r-[0.957434px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100 !min-h-full">
        <span class="d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2">{{ getCurrencySymbol }}</span></div>
      <input
        type="text"
        class="wc_input_price focus:!shadow-none !border-0 !w-[100%] !min-h-full !pl-2 !pr-0 !pt-0 !pb-0 min-w-[75px]"
        ref="fixed"
        :id="fixedId"
        :name="fixexName"
        :value="formatPositiveValue( value.fixed ?? '' )"
        v-on:input="( e ) => onInput(e.target.value, 'fixed')"
        style="border: none !important;"
      />
    </div>
  </div>
</template>

<script>
import Debounce from "debounce";

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
                    fixed: '',
                    percentage: ''
                }
            },
        },
        methods: {
            validatePercentage( percentage ) {
                if ( Number( percentage ) < 0 || Number( percentage ) > 100 ) {
                    percentage = '';
                }

                return percentage;
            },
            validateNegative( value ) {
                if ( Number( value ) < 0 ) {
                    value = '';
                }

                return value;
            },

            onInput: Debounce( function( currentValue, type ) {
                let self = this;
                let data = JSON.parse( JSON.stringify( { ...self.value }) );
                data[ type ] = '' !== currentValue  ? String( currentValue ) : '';

                data.fixed = '' !== data.fixed  ? self.validateNegative( accounting.unformat( data.fixed, dokan.currency.decimal ) ) : '';
                data.percentage = '' !== data.percentage  ? self.validateNegative( self.validatePercentage( accounting.unformat( data.percentage, dokan.currency.decimal ) ) ) : '';

                this.$emit('change', data);
            }, 500 ),

            formatPositiveValue: ( value ) => {
                if ( undefined === value || value === '' ) {
                    return '';
                }

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

<style scoped lang="less">
</style>
