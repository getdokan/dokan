<template>
    <fieldset>
        <div class="html_contents">
            <h3 class="field_heading" scope="row">
                {{ fieldData[fieldType].label }}
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </h3>
            <p class="field_desc" v-html="fieldData[fieldType].desc"></p>
        </div>
        <div class="fields" v-bind:class="[fieldType === 'app_code_type' ? 'radio_fields' : '']" v-if="fieldType !== 'app_label'">
            <input
                disabled
                type='text'
                class='regular-text'
                v-if="fieldType === 'app_url'"
                :value='fieldData[fieldType].url'
            >
            <input
                class="regular-text"
                :type="fieldData[fieldType].type"
                v-model="fieldValue[fieldData[fieldType].name]"
                v-if="fieldData[fieldType].type === 'text' && fieldType !== 'app_url'"
            >
            <textarea
                v-model="fieldValue[fieldData[fieldType].name]"
                v-if="fieldData[fieldType].type === 'textarea' && fieldType !== 'app_url'"
            ></textarea>
            <template v-if="fieldType === 'app_code_type'">
                <label v-for="( optionVal, optionKey ) in fieldData[fieldType].options" :class="isSocialOptionChecked( optionKey, fieldType ) ? 'checked' : ''" :key="optionKey">
                    <span class="dashicons dashicons-yes"></span>
                    <input
                        class="radio"
                        :name="optionKey"
                        :value="optionKey"
                        :type="fieldData[fieldType].type"
                        v-model="fieldValue[fieldData[fieldType].name]"
                    >
                    {{ optionVal }}
                </label>
            </template>
        </div>
    </fieldset>
</template>

<script>
    export default {
        props: {
            fieldType: {
                type: String,
                required: true,
            },

            fieldData: {
                type: Object,
                required: true,
            },

            fieldValue: {
                type: Object,
                required: true,
            },
        },

        methods: {
            isSocialOptionChecked( optionKey, fieldName ) {
                if ( 'radio' === this.fieldData[fieldName].type ) {
                    return this.fieldValue[this.fieldData[fieldName].name] === optionKey ? true : false;
                }

                return false;
            },
        },
    }
</script>
