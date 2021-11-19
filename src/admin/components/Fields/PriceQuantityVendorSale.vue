<template>
    <td>
        <span>{{ commission_title }}</span>

        <template v-if="'' !== fieldValue[fieldData.name]">
            <div class="new_commission_body" v-for="( commission, key ) in fieldValue[fieldData.name]" v-bind:key="key">
                <div class="new_commission_body_close"><span @click.prevent="removeCommissionFromList(key)" class="dashicons dashicons-remove"></span></div>

                <div>
                    <th scope="row">
                        <label :for="sectionId + '[' + fieldData.fields[id].name +key + ']'">{{ fieldData.fields[id].label }}</label>
                    </th>
                    <td>
                        <input
                            type="number"
                            :min="fieldData.min"
                            class="regular-text"
                            :id="sectionId + '[' + fieldData.fields[id].name +key + ']'"
                            :name="sectionId + '[' + fieldData.fields[id].name +key + ']'"
                            v-model="fieldValue[fieldData.name][key][id]"
                        >
                        <p v-if="currentCommissionError( key, id )" class="dokan-error">
                            {{ currentCommissionError( key, id ) }}
                        </p>
                    </td>
                </div>

                <div>
                    <th scope="row">
                        <label :for="sectionId + '[' + fieldData.fields['rule'].name +key + ']'">{{ fieldData.fields['rule'].label }}</label>
                    </th>
                    <td>
                        <select class="regular-text" :name="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" v-model="fieldValue[fieldData.name][key].rule">
                            <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['rule'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['rule'].options[optionVal]"></option>
                        </select>

                        <p v-if="currentCommissionError( key, 'rule' )" class="dokan-error">
                            {{ currentCommissionError( key, 'rule' ) }}
                        </p>
                    </td>
                </div>

                <div>
                    <th scope="row">
                        <label :for="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'">{{ fieldData.fields['commission_type'].label }}</label>
                    </th>
                    <td>
                        <select class="regular-text" :name="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" v-model="fieldValue[fieldData.name][key].commission_type">
                            <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['commission_type'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['commission_type'].options[optionVal]"></option>
                        </select>
                        <p v-if="currentCommissionError( key, 'commission_type' )" class="dokan-error">
                            {{ currentCommissionError( key, 'commission_type' ) }}
                        </p>
                    </td>
                </div>

                <div>
                    <th scope="row">
                        <label :for="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'">{{ fieldData.fields['admin_commission'].label }}</label>
                    </th>
                    <td>
                        <template v-if="'percentage' === fieldValue[fieldData.name][key].commission_type">
                            <input type="number" :min="fieldData.min" class="regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].percentage">
                            <p v-if="currentCommissionError( key, 'percentage' )" class="dokan-error">
                                {{ currentCommissionError( key, 'percentage' ) }}
                            </p>
                        </template>
                        <template v-else-if="'flat' === fieldValue[fieldData.name][key].commission_type">
                            <input type="number" :min="fieldData.min" class="regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].flat">
                            <p v-if="currentCommissionError( key, 'flat' )" class="dokan-error">
                                {{ currentCommissionError( key, 'flat' ) }}
                            </p>
                        </template>

                        <template v-else>
                            <td class="percent_fee product-price-commission">
                                <input type="text" :min="fieldData.min" class="wc_input_decimal regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].percentage">
                                {{ '%' }}
                            </td>

                            <td class="fixed_fee product-price-commission">
                                {{ '+' }}
                                <input type="text" :min="fieldData.min" class="wc_input_price regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].flat">
                            </td>
                            <p v-if="currentCommissionError( key, 'combine' )" class="dokan-error">
                                {{ currentCommissionError( key, 'combine' ) }}
                            </p>
                        </template>
                    </td>
                </div>

            </div>
        </template>

        <div>
            <button @click.prevent="addNewCommission" type="button">{{ __( 'Add', 'dokan-lite' ) }}</button>
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

</style>
