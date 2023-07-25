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
                >
                    <div class="wm-method">
                        <div class='wm-method-switch'>
                            <Switches
                                @input="setCheckedValue"
                                :enabled="isSwitchOptionChecked( optionKey )"
                                :value="optionKey"
                            />
                        </div>
                        <h4 class="field_heading">{{ optionVal }}</h4>
                    </div>
                    <div class="wm-charges">
                        <combine-input
                            v-model="charges[ optionKey ]"
                            v-on:change='chargeChangeHandler'
                        />
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
</template>

<script>
import Switches from 'admin/components/Switches.vue';
import CombineInput from 'admin/components/Fields/CombineInput.vue';
import FieldHeading from 'admin/components/FieldHeading.vue';

export default {
    name: 'WithdrawMethods',
    data() {
        return {
            charges: {},
            defaultVal: {
                fixed: '',
                percentage: ''
            }
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
        chargeChangeHandler() {
            let options_inputs_key = this.fieldData.options_inputs_key ?? 'withdraw_charges';
            this.fieldValue[ options_inputs_key ] = this.charges;
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
                self.charges[item] = this.defaultVal;
            } );

            return charges;
        },
    },
    beforeMount() {
        let options_inputs_key = this.fieldData.options_inputs_key ?? 'withdraw_charges';
        let self = this;

        if ( this.fieldValue[ options_inputs_key ] ) {
            this.charges = this.validateCombineInputData( this.fieldValue[ options_inputs_key ] );
        } else  {
            this.charges = this.getDefaultDataSet();
        }
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
            border: 1px solid #b0a7a787;
            padding: 0 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &:not( :last-child ) {
                border-bottom: 0;
            }

            .wm-method {
                display: flex;
                align-items: center;
                .wm-method-switch {
                    margin-right: 1em;
                }
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

                    .wm-method-switch {
                    }
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
