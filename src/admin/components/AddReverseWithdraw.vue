<template>
    <div class='dokan-add-new-rw'>
        <modal :title='title' width='1000px' @close='closeModal'>
            <div slot='body' class='dokan-rw-body'>
                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-heading'>
                        <h3>{{ __('Transection type', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <dokan-radio-group
                            @onChange="handleTransectionType"
                            :value="transectionType"
                            :items="transectionTypeItems"
                        />
                    </div>
                </div>
                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-body'>
                        Product / Order / Other
                    </div>
                </div>
            </div>
            <div slot="footer">
                <button class="button button-primary button-hero" @click="addNewWithdraw">{{ __( 'Add New', 'dokan' ) }}</button>
            </div>
        </modal>
    </div>
</template>

<script>

import FieldHeading from 'admin/components/FieldHeading.vue';
import DokanRadioGroup from 'admin/components/DokanRadioGroup.vue'

const Modal   = dokan_get_lib('Modal');
const Loading = dokan_get_lib('Loading');

export default {
    name: 'AddReverseWithdraw',

    components: {
        FieldHeading,
        Modal,
        DokanRadioGroup,
        Loading
    },

    data() {
        return {
            title: this.__( 'Add New Reverse Withdrawal', 'dokan-lite' ),
            transectionType: 'order',
            transectionTypeItems: [
                {
                    label: this.__( 'Ptoduct', 'dokan-lite' ),
                    value: 'product'
                },
                {
                    label: this.__( 'Order', 'dokan-lite' ),
                    value: 'order'
                },
                {
                    label: this.__( 'Other', 'dokan-lite' ),
                    value: 'other'
                }
            ]
        }
    },

    methods:{
        closeModal() {
            this.$root.$emit('modalClosed');
        },

        addNewWithdraw() {
            console.log('creating withdraw...');
        },

        handleTransectionType(newValue) {
            this.transectionType = newValue;
        }
    },

    created() {

    },
}
</script>

<style lang='less'>
.dokan-add-new-reverse-withdraw {
    .dokan-rw-body {
        .dokan-rw-section {

        }
    }
}

.dokan-rw-section {
    .dokan-rw-section-heading {

    }
    .dokan-rw-section-body{

    }
}
</style>
