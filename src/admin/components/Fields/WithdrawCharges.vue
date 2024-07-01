<template>
    <div
        class="field_contents"
        v-bind:class="[
            fieldData.content_class ? fieldData.content_class : '',
        ]"
    >
        <fieldset class="wm-box-container">
            <FieldHeading :field-data="fieldData" />
            <div class="wm-methods-box-container">
                <div
                    v-for="(optionVal, optionKey) in fieldData.options"
                    class="wm-methods-box"
                    :key="optionKey"
                    v-if="showItems[optionKey] === optionKey"
                >
                    <div class="wm-method">
                        <h4 class="field_heading">{{ optionVal }}</h4>
                    </div>
                    <div class="wm-charges" v-if="fieldData.chargeable_methods?.[optionKey]">
                        <combine-input
                            :value="charges[ optionKey ] ?? defaultVal"
                            v-on:change='data => chargeChangeHandler( data, optionKey )'
                        />
                    </div>
                    <div v-else class='wm-charges'>
                        <span class='wm-automated'>{{ __( 'Automated', 'dokan-lite' ) }}</span>
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
</template>

<script>
import Switches from 'admin/components/Switches.vue';
import CombineInput from 'admin/components/CombineInput.vue';
import FieldHeading from 'admin/components/FieldHeading.vue';

export default {
    name: 'WithdrawCharges',
    data() {
        return {
            charges: {},
            defaultVal: {
                fixed: 0,
                percentage: 0
            },
            showItems: {}
        };
    },
    components: { FieldHeading, CombineInput, Switches },
    props: [ 'sectionId', 'fieldData', 'fieldValue' ],
    methods: {
        formatValue( data ) {
            return {
                fixed: Math.abs( data.fixed ) ? Math.abs( data.fixed ) : 0,
                percentage: Math.abs( data.percentage ) ? Math.abs( data.percentage ) : 0
            };
        },
        formatPositiveValue( data ) {
            return {
                fixed: accounting.formatNumber( data.fixed, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal ),
                percentage: accounting.formatNumber( data.percentage, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal )
            };
        },
        unFormatValue( data ) {
            return {
                fixed: Math.abs( accounting.unformat( data.fixed , dokan.currency.decimal ) ),
                percentage: Math.abs( accounting.unformat( data.percentage , dokan.currency.decimal  ) )
            }
        },
        isSwitchOptionChecked( optionKey ) {
            return (
                this.fieldValue[ this.fieldData.name ] &&
                this.fieldValue[ this.fieldData.name ][ optionKey ] ===
                optionKey
            );
        },
        setCheckedValue( checked, value ) {
            this.fieldValue[ this.fieldData.name ][ value ] = checked
                ? value
                : '';
        },
        chargeChangeHandler( data, field ) {
            let fixedCommission = this.fieldValue[ this.fieldData.name ][ field ];
            if (isNaN( data.fixed )) {
                data.fixed = fixedCommission.fixed ?? '';
            }
            if (isNaN( data.percentage )) {
                data.percentage = fixedCommission.percentage ?? '';
            }

            let positiveValue = this.unFormatValue(data);
            let formatedData = this.formatPositiveValue( positiveValue );

            this.fieldValue[ this.fieldData.name ][ field ] = dokan.hooks.applyFilters(
              'dokanFieldComponentInputValue',
              formatedData,
              this.fieldValue[ this.fieldData.name ][ field ],
              this.fieldData.name,
              this.fieldData.is_lite ?? false
            );
        },
        validateCombineInputData( data ) {
            if ( 'object' !== typeof data ) {
                return this.getDefaultDataSet();
            }

            return data;
        },
        getDefaultDataSet() {
            let charges = {};

            Object.keys( this.fieldData.options ).forEach( item => {
                charges[item] = this.defaultVal;
            } );

            return charges;
        },

        itemsShowIf() {
            if ( ! this.fieldData['items_show_if'] || ! this.fieldData['items_show_if']['key'] || ! this.fieldData['items_show_if']['condition'] ) {
                return true;
            }

            let showIf = this.fieldData.items_show_if;
            let self = this;

            switch ( showIf.condition ) {
                case 'contains-key-value':
                    let data = {};
                    Object.keys( this.fieldData.options ).forEach(item => {
                        data[item] = self.fieldValue[showIf.key][item] ?? false;
                    });

                    self.showItems = data;
                    break
            }
        },
    },

    watch: {
        $props: {
            handler() {
                this.itemsShowIf();
            },
            deep: true,
        }
    },

    beforeMount() {
        let options_inputs_key = this.fieldData.name;
        let self = this;

        if ( this.fieldValue[ options_inputs_key ] ) {
            this.charges = this.validateCombineInputData( this.fieldValue[ options_inputs_key ] );
        } else  {
            this.charges = this.getDefaultDataSet();
        }

        this.itemsShowIf();
    },
};
</script>

<style scoped lang="less">
.wm-box-container {
    display: flex;
    flex-direction: column;

    .wm-methods-box-container {
        margin-top: 15px;

        .wm-methods-box {
            border-bottom: 1px solid #f3f4f6;
            padding: 0 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &:last-child {
                border-bottom: 0;
            }

            .wm-method {
                display: flex;
                align-items: center;
            }
            .wm-charges {
                display: flex;
                align-items: center;

                .wm-automated {
                    border: 1px solid #dbdbdb;
                    color: #838181;
                    padding: 5px 8px;
                    border-radius: 12px;
                    background: #f5f5f6;;
                }
            }
        }
    }
}

@media only screen and ( max-width: 782px ) {
    .wm-box-container {

        .wm-methods-box-container {

            .wm-methods-box {
                flex-direction: column;
                justify-content: start;
                align-items: start;

                .wm-method {

                }
                .wm-charges {
                    margin-left: -20px;
                    margin-bottom: 20px;
                }
            }
        }
    }
}
</style>
