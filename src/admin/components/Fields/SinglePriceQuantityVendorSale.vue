<template>
    <fieldset class="dokan-new-commission-wraper">
        <div class="dokan-new-commission-header dokan-new-commission-row">
            <div class="dokan-new-commission-col-from">{{ __( 'From', 'dokan-lite' ) }}</div>
            <div class="dokan-new-commission-col-to">{{ __( 'To', 'dokan-lite' ) }}</div>
            <div class="dokan-new-commission-col-ct">{{ __( 'Type', 'dokan-lite' ) }}</div>
            <div class="dokan-new-commission-col-commission">{{ __( 'Commission', 'dokan-lite' ) }}</div>
            <div class="dokan-new-commission-col-action"></div>
        </div>
        <div class="dokan-new-commission-content dokan-new-commission-row" v-for="(commission,index) in allCommission" :key="index">
            <div class="dokan-new-commission-col-from">
                <input disabled type="text" placeholder="0" :value="commission.from">
            </div>
            <div class="dokan-new-commission-col-to">
                <input :value="commission.to == 0 ? '' : commission.to" @input="handleTOInput($event.target.value, index, commission.to)" type="number" placeholder="∞" :ref="`dokan-to${index}`">
                <span :ref="`dokan-${selectedCommissionLabel}-from-msg${index}`" class="dokan-commission-tooltiptext">Tooltip text</span>
            </div>
            <div class="dokan-new-commission-col-ct">
                <select @change="updateCommissionValue( $event.target.value, 'commission_type', index, 'string' )" :value="commission.commission_type" :name="'commission_type' + index" :id="'commission_type' + index">
                    <option value="flat">{{ __( 'Flat', 'dokan-lite') }}</option>
                    <option value="percentage">{{ __( 'Percentage', 'dokan-lite') }}</option>
                    <option value="combine">{{ __( 'Combined', 'dokan-lite') }}</option>
                </select>
            </div>
            <div class="dokan-new-commission-col-commission">
                <div class="commission-inner-type" v-if="'percentage' == commission.commission_type || 'combine' == commission.commission_type">
                    <input @input="updateCommissionValue( $event.target.value, 'percentage', index, 'number' )" type="number" min="1" max="9999" maxlength="10" oninput="this.value=this.value.slice(0,this.maxLength||1/1);this.value=(this.value < 0) ? 0 : this.value;" class="dokan-commission-value"/> 
                    <span class="commisson-indecator">%</span>
                </div> 
                <div class="commission-inner-type-middle" v-if="'combine' == commission.commission_type">
                    <span class="commission-inner-type-middle-text">+</span>
                </div> 
                <div class="commission-inner-type" v-if="'flat' == commission.commission_type || 'combine' == commission.commission_type">
                    <input @input="updateCommissionValue( $event.target.value, 'flat', index, 'number' )" type="number" min="1" max="9999" maxlength="10" oninput="this.value=this.value.slice(0,this.maxLength||1/1);this.value=(this.value < 0) ? 0 : this.value;" class="dokan-commission-value"> 
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
        updateCommissionValue( event, field, index, type ) {
            this.$emit(
                'updateCommissionState',
                {
                    value: event,
                    field: field,
                    index: index,
                    type: type
                }
            );
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

        async handleTOInput( e, index, to ) {
            if ( isNaN( Number(e) ) ) {
                this.$refs[`dokan-to${index}`].value = to;
                return;
            }

            this.allCommission[index].from > Number(e) && '' != e ? this.showFromErrorMessage( index, this.allCommission[index].from, e ) : this.hideFromErrorMessage( index );
            
            await this.updateCommissionValue( e, 'to', index, 'number' );
            await this.generateNextRow( e, index );
        },

        showFromErrorMessage( index, from, to ) {
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].innerText = `Must be more or equal ${from}`;
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].style.display = 'block';
        },

        hideFromErrorMessage( index ) {
            this.$refs[`dokan-${this.selectedCommissionLabel}-from-msg${index}`][0].style.display = 'none';
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
                    visibility: hidden;
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

                &:hover .dokan-commission-tooltiptext {
                    visibility: visible;
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
