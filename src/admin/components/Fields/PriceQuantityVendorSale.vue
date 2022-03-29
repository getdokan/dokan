<template>
    <td class="new-commission-holder">
        <template v-if="'' !== fieldValue[fieldData.name]">
            <SinglePriceQuantityVendorSale
                :allCommission="fieldValue[fieldData.name]"
                :selectedCommissionName="fieldData.commission_title"
                :selectedCommissionLabel="fieldData.type"
                v-on:updateCommissionState="updateCommissionState"
                v-on:removeCommissionFromList="removeCommissionFromList"
                v-on:generateNextRow="generateNextRow"
            />
        </template>
    </td>
</template>

<script>
import SinglePriceQuantityVendorSale from './SinglePriceQuantityVendorSale.vue';

export default {
    name : 'PriceQuantityVendorSale',
    components  :{
        SinglePriceQuantityVendorSale
    },
    props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors'],
    methods: {

            addNewCommission( value ) {
                const dummyData = this.getDummyData( value );

                const commissions = '' === this.fieldValue[this.id] ? [] : this.fieldValue[this.id];

                commissions.push( dummyData );
                this.fieldValue[this.id] = commissions;
            },

            getDummyData( value ) {
                const allFields = this.fieldData.fields;

                if ( undefined === allFields ) {
                    return {};
                }

                const dummyData = {};
                Object.keys(allFields).forEach(element => {
                    if ( 'admin_commission' === element ) {
                        dummyData.flat = allFields[element].options.flat.default;
                        dummyData.percentage = allFields[element].options.percentage.default;
                    } else {
                        'from' == element ? dummyData[element] = Number(value)+1 : dummyData[element] = allFields[element].default;
                    }
                });

                return dummyData;
            },

            updateCommissionState( obj ) {
                let { value, field, index, type  } = obj;
                this.fieldValue[this.fieldData.name][index][field] = type === 'number' ? Number( value ) : String( value );

                if ( 'to' == field && this.fieldValue[this.fieldData.name][index+1] ) {
                    this.fieldValue[this.fieldData.name][index+1].from = Number( value ) + 1;
                    // this.fieldValue[this.fieldData.name][index+1].to = 0;
                }
            },

            removeCommissionFromList( index ) {
                let all_commissions = JSON.stringify([...this.fieldValue[this.fieldData.name]]);
                all_commissions = JSON.parse(all_commissions);
                if ( all_commissions[index+1] ) {
                    all_commissions[index+1].from = all_commissions[index].from;
                    // all_commissions[index+1].to = all_commissions[index+1].to;
                }
                all_commissions.splice( index, 1 );
                this.fieldValue[this.fieldData.name] = all_commissions;
            },

            generateNextRow( data ) {
                let { value, index } = data;

                let newData = [ ...this.fieldValue[this.fieldData.name] ];

                if ( newData[index] && value !== '' && value <= newData[index].to - 2 ) {
                    return;
                }
                newData[index].to = '';

                newData.splice(index+1, 9e9);
                this.fieldValue[this.fieldData.name] = newData;

                if ( value && 0 != value ) {
                    ! this.fieldValue[this.fieldData.name][index] ? this.addNewCommission( value ) : '';
                } else {
                    this.removeCommissionFromList(index);
                }
            },
    },

    computed: {
        get_currency_symbol() {
            return undefined !== dokan.currency.symbol ? dokan.currency.symbol : '';
        },
    }
}
</script>

<style lang="less" scoped>
    .dokan-hide{
        display: none !important;
    }
    .new-commission-holder{
        line-height: 2 !important;
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
            right: 0%;
            z-index: 9;

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
                    top: 60%;
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
        top: 60%;
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
