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
            <input
                disabled
                type='text'
                class='regular-text large'
                v-if="fieldData.url"
                :value='fieldData.url' />
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

        methods: {
            isSocialOptionChecked( optionKey ) {
                if ( 'radio' === this.fieldData.type ) {
                    return this.fieldValue[this.fieldData.name] === optionKey ? true : false;
                }

                return false;
            },
        },
    }
</script>
