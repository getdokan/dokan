<template>
    <td>
        <span>{{ commission_title }}</span>

        <template v-if="'' !== fieldValue[fieldData.name]">
            <fieldset class="new_commission_fields dokan-commission-wrapper" v-for="( commission, key ) in fieldValue[fieldData.name]" v-bind:key="key">
                <span @click.prevent="removeCommissionFromList(key)" class="dashicons dashicons-no remove-vpq-commission"></span>
                <div class="commission-content-container">
                    <div class="commission-inner-type-select">
                        <label :for="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'">{{ fieldData.fields['commission_type'].label }}</label>
                        <select :name="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" v-model="fieldValue[fieldData.name][key].commission_type">
                            <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['commission_type'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['commission_type'].options[optionVal]"></option>
                        </select>
                        <p v-if="currentCommissionError( key, 'commission_type' )" class="dokan-error">
                            {{ currentCommissionError( key, 'commission_type' ) }}
                        </p>
                    </div>

                    <div class="commission-inner-types">
                        <div class="commission-inner-type-middle"><span class="commission-inner-type-middle-text">as</span></div>

                        <div
                            class="commission-inner-type-percentage"
                            v-if="'combine' === fieldValue[fieldData.name][key].commission_type || 'percentage' === fieldValue[fieldData.name][key].commission_type"
                        >
                            <label >{{ __( 'Percentage', 'dokan' ) }}</label>
                            <input type="number" :min="fieldData.min" class="dokan-commission-value" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].percentage">
                            <p v-if="currentCommissionError( key, 'percentage' )" class="dokan-error">
                                {{ currentCommissionError( key, 'percentage' ) }}
                            </p>
                            <span class="commisson-indecator">%</span>
                        </div>

                        <div class="commission-inner-type-middle" v-if="'combine' === fieldValue[fieldData.name][key].commission_type"><span class="commission-inner-type-middle-text">+</span></div>

                        <div
                            class="commission-inner-type-flat"
                            v-if="'combine' === fieldValue[fieldData.name][key].commission_type || 'flat' === fieldValue[fieldData.name][key].commission_type"
                        >
                            <label >{{ __( 'Flat', 'dokan' ) }}</label>
                            <input type="number" :min="fieldData.min" class="dokan-commission-value" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].flat">
                            <span class="commisson-indecator" v-html="fieldData.currency_symbol"></span>
                            <p v-if="currentCommissionError( key, 'flat' )" class="dokan-error">
                                {{ currentCommissionError( key, 'flat' ) }}
                            </p>
                            <p v-if="currentCommissionError( key, 'combine' )" class="dokan-error">
                                {{ currentCommissionError( key, 'combine' ) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="commission-content-container">
                    <div class="commission-inner-type-select">
                        <label :for="sectionId + '[' + fieldData.fields['rule'].name +key + ']'">{{ __( 'When', 'dokan' ) }} {{ fieldData.fields['rule'].label }}</label>
                        <select :name="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" v-model="fieldValue[fieldData.name][key].rule">
                            <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['rule'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['rule'].options[optionVal]"></option>
                        </select>

                        <p v-if="currentCommissionError( key, 'rule' )" class="dokan-error">
                            {{ currentCommissionError( key, 'rule' ) }}
                        </p>
                    </div>
                    <div class="admin-commission-amount">
                        <label :for="sectionId + '[' + fieldData.fields[id].name +key + ']'">{{ fieldData.fields[id].label }}</label>
                        <input
                            type="number"
                            :min="fieldData.min"
                            class="sectionId + '[' + fieldData.fields[id].name +key + ']'"
                            :id="sectionId + '[' + fieldData.fields[id].name +key + ']'"
                            :name="sectionId + '[' + fieldData.fields[id].name +key + ']'"
                            v-model="fieldValue[fieldData.name][key][id]"
                        >
                        <p v-if="currentCommissionError( key, id )" class="dokan-error">
                            {{ currentCommissionError( key, id ) }}
                        </p>
                    </div>
                </div>

            </fieldset>
        </template>

        <div>
            <button class="add_new_commission_set" @click.prevent="addNewCommission" type="button">{{ __( 'Add', 'dokan-lite' ) }}</button>
        </div>
    </td>
</template>

<script>
export default {
    name : 'PriceQuantityVendorSale',
    props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors', 'commission_title'],
    methods: {

            addNewCommission() {
                const dummyData = this.getDummyData();

                const commissions = '' === this.fieldValue[this.id] ? dummyData : this.fieldValue[this.id];

                commissions.push( dummyData );
                this.fieldValue[this.id] = commissions;
            },

            removeCommissionFromList( key ) {
                this.fieldValue[this.id].splice( key, 1 );
            },

            currentCommissionError( index, field ) {
                let allErrors = this.errors;

                let result = false;

                if ( 'object' === typeof allErrors ) {
                    Object.keys( allErrors ).forEach( item => {
                        if ( undefined !== allErrors[item][this.id] ) {
                            let productQuantityCommissionErrors = allErrors[item][this.id];
                            Object.keys( productQuantityCommissionErrors ).forEach( ( element, itemIndex ) => {
                                let errorObj = productQuantityCommissionErrors[element];

                                if ( errorObj.index === index && errorObj.field === field  ) {
                                    result = errorObj.msg;
                                }
                            });
                        }
                    } );
                }

                return result;
            },

            getDummyData() {
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
                        dummyData[element] = allFields[element].default;
                    }
                });

                return dummyData;
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
