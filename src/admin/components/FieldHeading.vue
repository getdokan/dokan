<template>
    <div class="field_data">
        <h3 class="field_heading" scope="row">
            {{ decodedLabel }}
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
        <p class="field_default" v-if="fieldData.type === 'croppable_image' && fieldData.restore === true">
            <a href="" v-on:click.prevent="restoreDefaultImage()">{{ __( 'Restore Default', 'dokan-lite' ) }}</a>
        </p>
    </div>
</template>

<script>
    export default {
        name : 'FieldHeading',

        props : ['fieldData'],

        computed: {
            decodedLabel() {
                const label = ( this.fieldData && this.fieldData.label ) || '';

                // Early passes if the label not found.
                if ( ! label || typeof document === 'undefined' ) {
                    return label;
                }

                // Decode html entities in the label.
                const el = document.createElement( 'textarea' );
                el.innerHTML = label;
                return el.value;
            }
        },

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
