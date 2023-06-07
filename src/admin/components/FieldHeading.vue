<template>
    <div class="field_data">
        <h3 class="field_heading" scope="row">
            {{ fieldData.label }}
            <span v-if="fieldData.icon_class">
            </span>
            <span v-if="( fieldData.tooltip || fieldData.field_icon )">
                <i class="tips"
                    :title="fieldData.tooltip ? fieldData.tooltip : fieldData.field_icon"
                    v-tooltip="fieldData.tooltip ? fieldData.tooltip : fieldData.field_icon"
                    :class="[ { 'dashicons dashicons-editor-help': fieldData.tooltip }, { 'fas fa-exclamation-triangle': fieldData.field_icon } ]"
                ></i>
            </span>
        </h3>
        <p class="field_desc" v-html="fieldData.desc"></p>
    </div>
</template>

<script>
    export default {
        name : 'FieldHeading',

        props : ['fieldData'],
    };
</script>
