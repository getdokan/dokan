<template>
    <fieldset>
        <div class="html_contents">
            <h3 class="field_heading" scope="row">
                {{ fieldData.label }}
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </h3>
            <p class="field_desc" v-html="fieldData.desc"></p>
        </div>
        <div class="fields" v-bind:class="[fieldData.type === 'radio' ? 'radio_fields' : '']" v-if="fieldData.url || fieldData.type !== 'html'">
            <div v-if="fieldData.url" class="disabled-input">
                <input
                    disabled
                    type='text'
                    class='regular-text large'
                    :value='fieldData.url'
                />

                <div :title="'Copy to clipboard'" v-tooltip="'Copy to clipboard'">
                    <button type='button'>
                        <i v-if="copied" class="fa fa-check" aria-hidden="true"></i>
                        <i v-else class="fa fa-clipboard" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <input
                class="regular-text large"
                :type="fieldData.type"
                v-model="fieldValue[fieldData.name]"
                v-if="fieldData.type === 'text'" />
            <textarea
                class="large"
                v-model="fieldValue[fieldData.name]"
                v-if="fieldData.type === 'textarea'"
            ></textarea>
            <template v-if="fieldData.type === 'radio'">
                <label v-for="( optionVal, optionKey ) in fieldData.options" :class="isSocialOptionChecked( optionKey ) ? 'checked' : ''" :key="optionKey">
                    <span class="dashicons dashicons-yes"></span>
                    <input
                        class="radio"
                        :name="optionKey"
                        :value="optionKey"
                        :type="fieldData.type"
                        v-model="fieldValue[fieldData.name]" />
                    {{ optionVal }}
                </label>
            </template>
        </div>
    </fieldset>
</template>

<script>
    import __ from 'lodash/fp/__';

    export default {
        props: {
            fieldData: {
                type: Object,
                required: true,
            },

            fieldValue: {
                type: Object,
                required: true,
            },
        },

        data() {
            return {
                copied: false,
            }
        },

        methods: {
            __,
            isSocialOptionChecked( optionKey ) {
                if ( 'radio' === this.fieldData.type ) {
                    return this.fieldValue[this.fieldData.name] === optionKey ? true : false;
                }

                return false;
            },
        },
    }
</script>

<style lang='less' scoped>
.disabled-input {
    display: flex;

    div {
        button {
            cursor: pointer;
            height: 20px;
            min-height: 32px;
            min-width: 32px;
            border: 0.957434px solid #686666;
            box-shadow: 0px 3.82974px 3.82974px rgba(0, 0, 0, 0.1);
            border-radius: 5px;
            background: white;
            color: #686666;
        }
    }
}
</style>
