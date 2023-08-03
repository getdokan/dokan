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
                    <div class="wm-charges">
                        <combine-input
                            :value="charges[ optionKey ] ?? {}"
                            v-on:change='data => chargeChangeHandler( data, optionKey )'
                        />
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
                fixed: '',
                percentage: ''
            },
            showItems: {}
        };
    },
    components: { FieldHeading, CombineInput, Switches },
    props: [ 'sectionId', 'fieldData', 'fieldValue' ],
    methods: {
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
            this.fieldValue[ this.fieldData.name ][ field ] = data;
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
