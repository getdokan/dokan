<template>
    <div class="new_commission_body">
        <div class="new_commission_body_close"><span @click.prevent="removeCommissionFromList( $event.target.value, selectedCommission.name, index, 'number' )" class="dashicons dashicons-remove"></span></div>

        <div>
            <div class="column">
                <label :for="selectedCommission.name + index">{{ selectedCommission.label }}</label>
                <input
                    @input="updateCommissionValue( $event.target.value, selectedCommission.name, index, 'number' )"
                    :value="commission[selectedCommission.name]"
                    type="number"
                    :name="selectedCommission.name + index"
                    :id="selectedCommission.name + index"
                    class="dokan-form-input"
                    :placeholder="__( 'Write here', 'dokan-lite')"
                >
            </div>
        </div>

        <div>
            <div class="column">
                <label :for="'rule' + index">{{ __( 'Rule', 'dokan-lite') }}</label>
                <select @change="updateCommissionValue( $event.target.value, 'rule', index, 'string' )" :value="commission.rule" class="dokan-commission-input" :name="'rule' + index" :id="'rule' + index">
                    <option value="upto">{{ __( 'Up to', 'dokan-lite') }}</option>
                    <option value="more_than">{{ __( 'More than', 'dokan-lite') }}</option>
                </select>
            </div>
        </div>

        <div>
            <div class="column">
                <label :for="'commission_type' + index">{{ __( 'Commission type', 'dokan-lite') }}</label>
                <select @change="updateCommissionValue( $event.target.value, 'commission_type', index, 'string' )" :value="commission.commission_type" class="dokan-commission-input" :name="'commission_type' + index" :id="'commission_type' + index">
                    <option value="flat">{{ __( 'Flat', 'dokan-lite') }}</option>
                    <option value="percentage">{{ __( 'Percentage', 'dokan-lite') }}</option>
                    <option value="combine">{{ __( 'Combine', 'dokan-lite') }}</option>
                </select>
            </div>
        </div>

        <div>
            <div class="column combine-commission" v-if="'combine' === currentCommissionType">
                <label>{{ __( 'Admin Commission', 'dokan-lite' )  }}</label>
                <div class="combine-commission-field">
                    <input :value="commission.percentage" @input="updateCommissionValue( $event.target.value, 'percentage', index, 'number' )" type="number" class="wc_input_decimal dokan-form-input percent_fee">
                    {{ '% &nbsp;&nbsp; +' }}
                    <input :value="commission.flat" @input="updateCommissionValue( $event.target.value, 'flat', index, 'number' )" type="number" class="wc_input_price dokan-form-input fixed_fee">
                </div>
            </div>
            <div class="column" v-else-if="'flat' === currentCommissionType">
                <label>{{ __( 'Admin Commission', 'dokan-lite' )  }}</label>
                <input :value="commission.flat" @input="updateCommissionValue( $event.target.value, 'flat', index, 'number' )" type="number" class="dokan-form-input" :placeholder="__( 'Flat commission', 'dokan-lite' )">
            </div>
            <div class="column" v-else>
                <label>{{ __( 'Admin Commission', 'dokan-lite' )  }}</label>
                <input :value="commission.percentage" @input="updateCommissionValue( $event.target.value, 'percentage', index, 'number' )" type="number" class="dokan-form-input" :placeholder="__( 'Percentage commission', 'dokan-lite' )">
            </div>

        </div>
    </div>
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
    },
}
</script>

<style lang="less" scoped>

    .new_commission_body{
        border-radius: 4px;
        border: 1px solid #8c8f94;
        background-color: #fff;
        padding: 8px;
        margin: 8px 0;

        .new_commission_body_close{
            display: block;
            width: 100%;
            overflow: hidden;

            .dashicons-remove{
                float: right;
                display: block;
                cursor: pointer;

                &:hover{
                    color: #d63638;
                }

                &:active{
                    color: #e2573f;
                }
            }
        }

        .product-price-commission {
                padding: 0;
                margin-bottom: 0;
        }
    }

    .dokan-commission-input{
        display: block;
        min-width: 100%;
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        margin-top: 6px;
        margin-bottom: 16px;
        resize: vertical;
        height: auto;
    }

</style>
