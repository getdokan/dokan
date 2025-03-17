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
            <secret-input
                v-model="fieldData.url"
                :type="'text'"
                v-if="fieldData.url"
                :copy-btn="true"
                :disabled="true"
                :is-secret="false"
            />
            <secret-input
                :value="fieldValue[fieldData.name]"
                @input="event => inputValueHandler( event )"
                :type='fieldData.type'
                v-if="fieldData.type === 'text'"
            />
            <textarea
                class="large"
                :value="fieldValue[fieldData.name]"
                @input="event => inputValueHandler( event.target.value )"
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
    import SecretInput from './SecretInput.vue';

    export default {
        components: {
            SecretInput
        },
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
            isSocialOptionChecked( optionKey ) {
                if ( 'radio' === this.fieldData.type ) {
                    return this.fieldValue[this.fieldData.name] === optionKey ? true : false;
                }

                return false;
            },

            inputValueHandler( value ) {
                let data = dokan.hooks.applyFilters(
                    'dokanFieldComponentInputValue',
                    value,
                    this.fieldValue[this.fieldData.name],
                    this.fieldData.name,
                    this.fieldData.is_lite ?? false
                );

                this.$set( this.fieldValue, this.fieldData.name, data );
            },
        },
    }
</script>
