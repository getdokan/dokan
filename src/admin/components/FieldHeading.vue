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
        <p class="field_desc" v-if="fieldData.desc" v-html="fieldData.desc"></p>
        <p class="field_default" v-if="fieldData.type === 'file' && fieldData.restore === true">
            <a href="" v-on:click.prevent="restoreDefaultImage()">{{ __( 'Restore Default', 'dokan-lite' ) }}</a>
        </p>
    </div>
</template>

<script>
    export default {
        name : 'FieldHeading',

        props : ['fieldData'],

        methods: {
            restoreDefaultImage() {
                Swal.fire({
                    icon              : 'warning',
                    html              : this.__( 'Would you like to revert back to the default state?', 'dokan-lite' ),
                    title             : this.__( 'Are you sure?', 'dokan-lite' ),
                    showCancelButton  : true,
                    cancelButtonText  : this.__( 'No, Cancel', 'dokan-lite' ),
                    confirmButtonText : this.__( 'Yes, Reset', 'dokan-lite' ),
                }).then( ( response ) => {
                    if ( response.isConfirmed ) {
                        this.$root.$emit( 'dokanRestoreDefault', this.fieldData );
                        Swal.fire( this.__( 'Success', 'dokan-lite' ), '', 'success' );
                    }
                });
            }
        }
    };
</script>
