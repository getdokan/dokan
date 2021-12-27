<template>
    <fieldset class="new_commission_fields dokan-commission-wrapper" >
        <span @click.prevent="removeCommissionFromList( $event.target.value, selectedCommission.name, index, 'number' )" class="dashicons dashicons-no remove-vpq-commission"></span>
        <div class="commission-content-container">
            <div class="commission-inner-type-select">
                <label :for="'commission_type' + index">{{ __( 'Commission type', 'dokan-lite') }}</label>
                <select @change="updateCommissionValue( $event.target.value, 'commission_type', index, 'string' )" :value="commission.commission_type" class="dokan-commission-input" :name="'commission_type' + index" :id="'commission_type' + index">
                    <option value="flat">{{ __( 'Flat', 'dokan-lite') }}</option>
                    <option value="percentage">{{ __( 'Percentage', 'dokan-lite') }}</option>
                    <option value="combine">{{ __( 'Combine', 'dokan-lite') }}</option>
                </select>
            </div>

            <div class="commission-inner-types">
                <div class="commission-inner-type-middle"><span class="commission-inner-type-middle-text">as</span></div>

                <div
                    class="commission-inner-type-percentage"
                    v-if="'combine' === currentCommissionType || 'percentage' === currentCommissionType"
                >
                    <label >{{ __( 'Percentage', 'dokan' ) }}</label>
                    <input :value="commission.percentage" @input="updateCommissionValue( $event.target.value, 'percentage', index, 'number' )" type="number" class="dokan-commission-value">

                    <span class="commisson-indecator">%</span>
                </div>

                <div class="commission-inner-type-middle" v-if="'combine' === currentCommissionType"><span class="commission-inner-type-middle-text">+</span></div>

                <div
                    class="commission-inner-type-flat"
                    v-if="'combine' === currentCommissionType || 'flat' === currentCommissionType"
                >
                    <label >{{ __( 'Flat', 'dokan' ) }}</label>
                    <input :value="commission.flat" @input="updateCommissionValue( $event.target.value, 'flat', index, 'number' )" type="number" class="dokan-commission-value">

                    <span class="commisson-indecator" v-html="get_currency_symbol()"></span>
                </div>
            </div>
        </div>

        <div class="commission-content-container">
            <div class="commission-inner-type-select">
                <label :for="'rule' + index">{{ __( 'When Rule', 'dokan-lite') }}</label>
                <select
                @change="updateCommissionValue( $event.target.value, 'rule', index, 'string' )"
                :value="commission.rule"
                class="dokan-commission-input" :name="'rule' + index"
                :id="'rule' + index">
                    <option value="upto">{{ __( 'Up to', 'dokan-lite') }}</option>
                    <option value="more_than">{{ __( 'More than', 'dokan-lite') }}</option>
                </select>
            </div>
            <div class="admin-commission-amount">
                <label :for="selectedCommission.name + index">{{ selectedCommission.label }}</label>
                <input
                    @input="updateCommissionValue( $event.target.value, selectedCommission.name, index, 'number' )"
                    :value="commission[selectedCommission.name]"
                    type="number"
                    :name="selectedCommission.name + index"
                    :id="selectedCommission.name + index"
                    class="dokan-commission-value"
                    :placeholder="__( 'Write here', 'dokan-lite')"
                >
            </div>
        </div>
    </fieldset>
</template>

<script>
export default {
    name : 'SinglePriceQuantityVendorSale',
    props: [ 'commission', 'allCommission', 'selectedCommission', 'index' ],
    data(){
        return{
            currentCommissionType:this.commission.commission_type,
        }
    },
    methods: {
            updateCommissionValue( event, field, index, type ) {
                field === 'commission_type' ? this.currentCommissionType = event : '';
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

            removeCommissionFromList( event, field, index, type ) {
                this.$emit(
                    'removeCommissionFromList',
                    {
                        value: event,
                        field: field,
                        index: index,
                        type: type
                    }
                );
            },

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
    .dashicons-no-container{
        display:block;
        width: 100%;
        margin-bottom: -25px;
    }

    .new_commission_fields{
        display:block;
        box-sizing: border-box;
        box-shadow: 0 0 0 transparent;
        border-radius: 4px;
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        box-shadow: 0 4px 8px 0 rgba(140, 143, 148, 0.45);
        transition: 0.3s;
        position: relative;

        & .dashicons-no{
            cursor: pointer;
            position: absolute;
            right: 5px;
            z-index: 9;
            top: 5px;

            &:hover{
                color: #d63638;
            }
        }

        & input, select {
            border-color: rgba(220, 220, 222, 0.75) !important;
            box-shadow: inset 0 1px 2px rgb(0 0 0 .4) !important;
        }
    }

    .commission-content-container {
        display: flex;

        & .admin-commission-amount {
            flex: 1 1 50%;
            display: flex;
            flex-direction: column;
        }
        & .commission-inner-type-select {
            flex: 1 1 50%;
            display: flex;
            flex-direction: column;
        }
        & .commission-inner-types {
            flex: 1 1 50%;
            display: flex;
            & .commission-inner-type-middle {
                flex: 1 1 10%;
                display: flex;
                justify-content: center;
                position: relative;
                & .commission-inner-type-middle-text {
                    position: absolute;
                    top: 50%;
                }
            }
            & .commission-inner-type-percentage {
                flex: 1 1 50%;
                position:relative;
            }
            & .commission-inner-type-flat {
                flex: 1 1 50%;
                position:relative;
            }
        }
        & .commission-condition-title{
            flex: 1 0 40%;
        }
    }

    .dokan-commission-value{
        width: 100%;
        padding-right: 20px !important;
    }
    .commisson-indecator{
        position: absolute;
        top: 50%;
        right: 5px;
        color: #8c8f94;
    }
    .add_new_commission_set {
        border: none;
        background-color: rgba(140, 143, 148, 1);
        border-radius: 4px;
        padding: 5px 12px;
        color: #fff;
        margin-top: -6px;
        cursor: pointer;
    }
    @media screen and (max-width: 960px) {
        .new_commission_fields{
            display:block;
            box-sizing: border-box;

            box-shadow: 0 0 0 transparent;
            border-radius: 4px;
            /* border: 1px solid #8c8f94; */
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            box-shadow: 0 4px 8px 0 rgba(140, 143, 148, 0.45);
            transition: 0.3s;
        }
    }
</style>
