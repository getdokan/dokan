<template>
    <fieldset class="dokan-new-commission-wraper">
        <div class="dokan-new-commission-header dokan-new-commission-row">
            <div class="dokan-new-commission-col-from">{{ __( 'From', 'dokan' ) }}</div>
            <div class="dokan-new-commission-col-to">{{ __( 'To', 'dokan' ) }}</div>
            <div class="dokan-new-commission-col-ct">{{ __( 'Type', 'dokan' ) }}</div>
            <div class="dokan-new-commission-col-commission">{{ __( 'Commission', 'dokan' ) }}</div>
            <div class="dokan-new-commission-col-action"></div>
        </div>
        <div class="dokan-new-commission-content dokan-new-commission-row" v-for="(commission,index) in allCommission" :key="index">
            <div class="dokan-new-commission-col-from">
                <input disabled type="text" placeholder="0" :value="commission.from">
            </div>
            <div class="dokan-new-commission-col-to">
                <input :value="commission.to == 0 ? '' : commission.to" @blur="resetRows( $event.target.value, index )" @input="handleTOInput( $event.target.value, index, commission.to, $event )" type="text" placeholder="∞" :ref="`dokan-to${index}`">
                <span :ref="`dokan-${selectedCommissionLabel}-from-msg${index}`" class="dokan-commission-tooltiptext">Tooltip text</span>
            </div>
            <div class="dokan-new-commission-col-ct">
                <select @change="updateCommissionValue( $event.target.value, 'commission_type', index, 'string', $event )" :value="commission.commission_type" :name="'commission_type' + index" :id="'commission_type' + index">
                    <option value="flat">{{ __( 'Flat', 'dokan') }}</option>
                    <option value="percentage">{{ __( 'Percentage', 'dokan') }}</option>
                    <option value="combine">{{ __( 'Combined', 'dokan') }}</option>
                </select>
            </div>
            <div class="dokan-new-commission-col-commission">
                <div class="commission-inner-type" v-if="'percentage' == commission.commission_type || 'combine' == commission.commission_type">
                    <input :value="commission.percentage" @input="updateCommissionValue( $event.target.value, 'percentage', index, 'number', $event )" type="text" min="1" max="9999" class="dokan-commission-value"/>
                    <span class="commisson-indecator">%</span>
                </div>
                <div class="commission-inner-type-middle" v-if="'combine' == commission.commission_type">
                    <span class="commission-inner-type-middle-text">+</span>
                </div>
                <div class="commission-inner-type" v-if="'flat' == commission.commission_type || 'combine' == commission.commission_type">
                    <input :value="commission.flat" @input="updateCommissionValue( $event.target.value, 'flat', index, 'number', $event )" type="text" min="1" max="9999" class="dokan-commission-value">
                    <span class="commisson-indecator" v-html="get_currency_symbol"></span>
                </div>
            </div>
            <div class="dokan-new-commission-col-action">
                <span v-if="0 != index && 0 != commission.to && '' != commission.to" @click="removeCommissionFromList(index)" class="dashicons dashicons-dismiss dokan-commission-row-delete"></span>
            </div>
        </div>
    </fieldset>
</template>

<script>
export default {
    name : 'SinglePriceQuantityVendorSale',
    props: [ 'allCommission', 'selectedCommissionName', 'selectedCommissionLabel' ],
    methods: {
        updateCommissionValue( input, field, index, type, event ) {
            if ( 'number' === type ) {
                input = this.validateNumber( input, event );
            }
            this.$emit(
                'updateCommissionState',
                {
                    value: input,
                    field: field,
                    index: index,
                    type: type
                }
            );
        },

        validateNumber ( input, event ) {
            let res = input.replace(/\D/g, '');
            event.target.value = res;
            return res;
        },

        removeCommissionFromList( index, ) {
            this.$emit(
                'removeCommissionFromList',
                index,
            );
        },

        generateNextRow( input, index ) {
            this.$emit(
                'generateNextRow',
                {
                    value: input,
                    index: index + 1,
                }
            );
        },

        resetRows( input, index ) {
            this.$emit(
                'resetRows',
                {
                    value: input,
                    index: index,
                }
            );
        },

        async handleTOInput( e, index, to, event ) {
            if ( isNaN( Number(e) ) ) {
                this.$refs[`dokan-to${index}`].value = to;
                this.validateNumber( e, event );
                return;
            }

            this.allCommission[index].from > Number(e) && '' != e ? this.showFromErrorMessage( index, this.allCommission[index].from, e ) : this.hideFromErrorMessage( index );

            await this.updateCommissionValue( e, 'to', index, 'number', event );
            await this.generateNextRow( e, index );
        },

        showFromErrorMessage( index, from, to ) {
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].innerText = this.sprintf( this.__( `Must be more or equal %d`, 'dokan' ), from );
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].style.display = 'block';

            jQuery('p.submit input#submit').prop('disabled', true);
            jQuery('.dokan-vendor-setting-save-btn').prop('disabled', true);
        },

        hideFromErrorMessage( index ) {
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].style.display = 'none';

            jQuery('p.submit input#submit').prop('disabled', false);
            jQuery('.dokan-vendor-setting-save-btn').prop('disabled', false);
        }
    },
    computed: {
        get_currency_symbol() {
            return undefined !== dokan.currency.symbol ? dokan.currency.symbol : '';
        },
    },
}
</script>

<style lang="less" scoped>
    .dokan-hide{
        display: none !important;
    }

    .dokan-new-commission-wraper {
        box-shadow: 0 4px 8px 0 rgba(140, 143, 148, 0.45);
        border-radius: 4px;
        padding: 10px;

        .dokan-new-commission-header {
            padding-bottom: 5px;
            font-weight: 600;
        }
        .dokan-new-commission-content {
            padding: 10px 0;

            &:last-child{
                border-bottom: none;
                padding: 10px 0 0 0;
            }
        }
        .dokan-new-commission-row {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #dddddd;

            & input, select {
                border-color: rgba(220, 220, 222, 0.75) !important;
                box-shadow: inset 0 1px 2px rgb(0 0 0 .4) !important;
                width: 100%;
            }

            .dokan-new-commission-col-from {
                width: 20%;
                margin-right: 5px;
            }
            .dokan-new-commission-col-to {
                width: 20%;
                margin-right: 5px;
                position: relative;
                display: inline-block;

                .dokan-commission-tooltiptext {
                    display: none;
                    width: 120px;
                    background-color: #d63638;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px 0;
                    position: absolute;
                    z-index: 1;
                    top: 120%;
                    left: 50%;
                    margin-left: -60px;

                    &::after {
                        content: "";
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        margin-left: -5px;
                        border-width: 5px;
                        border-style: solid;
                        border-color: transparent transparent #d63638 transparent;
                    }
                }
            }

            .dokan-new-commission-col-ct {
                width: 20%;
                margin-right: 5px;
            }
            .dokan-new-commission-col-commission {
                width: 35%;
                display: flex;
                & input {
                    width: 100%;
                }

                .commission-inner-type{
                    position: relative;
                    width: 100%;

                    .commisson-indecator{
                        position: absolute;
                        top: 5%;
                        right: 5px;
                        color: #8c8f94;
                    }
                }
            }
            .dokan-new-commission-col-action {
                width: 5%;
                display: flex;
                justify-content: center;
                text-align: center;
                flex-direction: column;
                margin-left: 5px;

                .dokan-commission-row-delete {
                    cursor: pointer;

                    &:hover{
                        color: #d63638;
                    }
                }
            }
        }
    }
</style>
