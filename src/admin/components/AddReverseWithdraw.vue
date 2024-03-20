<template>
    <div class='dokan-add-new-rw'>
        <modal
            :title='title'
            width='800px'
            @close='closeModal'
        >
            <div slot='body' class='dokan-rw-body'>
                <div class='dokan-rw-section mb-4'>
                    <div class='dokan-rw-section-heading mb-[-0.5rem]'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Select vendor', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="form-group dokan-rw-multiselect">
                            <multiselect
                                @search-change="getVendorList"
                                v-model="selectedVendor"
                                :placeholder="this.__( 'Search vendor', 'dokan-lite' )"
                                :options="allVendors"
                                @select="onStoreSelectVendor"
                                track-by="vendorId"
                                label="store_name"
                                :internal-search="false"
                                :clear-on-select="false"
                                :allow-empty="false"
                                :multiselect="false"
                                :searchable="true"
                                :showLabels="false"
                                :class="'dokan-rw-multiselect-container'"
                            />
                        </div>
                        <span v-if="errors.vendorId" class='dokan-error'>{{ __( 'Please select a vendor', 'dokan-lite' ) }}</span>
                    </div>
                </div>

                <div class='dokan-rw-section mb-4'>
                    <div class='dokan-rw-section-heading mb-1'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Transaction Type', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <dokan-radio-group
                            @onChange="handleTransectionType"
                            :value="transectionType"
                            :items="transectionTypeItems"
                            :id="'rw-transaction-type'"
                        />
                    </div>
                </div>

                <div class='dokan-rw-section mb-4' v-if="'manual_product' === transectionType">
                    <div class='dokan-rw-section-heading mb-[-0.5rem]'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Select Product', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="form-group dokan-rw-multiselect">
                            <multiselect
                                @search-change="getProducts"
                                v-model="selectedProduct"
                                :placeholder="this.__( 'Search product', 'dokan-lite' )"
                                :options="allProducts"
                                track-by="id"
                                label="name"
                                :internal-search="false"
                                :clear-on-select="false"
                                :allow-empty="false"
                                :multiselect="false"
                                :searchable="true"
                                :showLabels="false"
                                :disabled="isProductSelectDisabled || ! selectedVendor.vendorId"
                            />
                            <span v-if="errors.trId" class='dokan-error'>{{ __( 'Please select a product', 'dokan-lite' ) }}</span>
                        </div>
                    </div>
                </div>

                <div class='dokan-rw-section mb-4' v-if="'manual_order' === transectionType">
                    <div class='dokan-rw-section-heading mb-1'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Select Order', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="form-group dokan-rw-multiselect">
                            <multiselect
                                @search-change="getOrders"
                                v-model="selectedOrder"
                                :placeholder="this.__( 'Search order', 'dokan-lite' )"
                                :options="allOrders"
                                track-by="id"
                                label="name"
                                :internal-search="false"
                                :clear-on-select="false"
                                :allow-empty="false"
                                :multiselect="false"
                                :searchable="true"
                                :showLabels="false"
                            />
                            <span v-if="errors.trId" class='dokan-error'>{{ __( 'Please select a order', 'dokan-lite' ) }}</span>
                        </div>

                    </div>
                </div>

                <div class='dokan-rw-section mb-4'>
                    <div class='dokan-rw-section-heading mb-1'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Withdrawal Balance Type', 'dokan-lite') }}</h3>
                        <i
                            class="dashicons dashicons-editor-help tips"
                            :title="__( 'Adjust Balance by Creating a New Reverse Withdrawal Entry', 'dokan-lite' )"
                            v-tooltip="__( 'Adjust Balance by Creating a New Reverse Withdrawal Entry', 'dokan-lite' )"
                        ></i>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <dokan-radio-group
                            @onChange="handleWithdrawalType"
                            :value="withdrawalType"
                            :items="withdrawalTypeItems"
                            :id="'rw-withdrawal-balance'"
                        />
                    </div>
                </div>

                <div class='dokan-rw-section mb-4'>
                    <div class='dokan-rw-section-heading mb-1'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Reverse Withdrawal Amount', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="dokan-rw-input">
                            <input
                                v-model='withdrawalAmount'
                                type='text'
                                class='regular-text wc_input_decimal'
                                :placeholder="__( 'Enter amount', 'dokan-lite' )"
                            />
                        </div>
                        <span v-if="errors.withdrawalAmount" class='dokan-error'>{{ __( 'Kindly provide the withdrawal amount', 'dokan-lite' ) }}</span>
                    </div>
                </div>

                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-heading mb-1'>
                        <h3 class='font-bold text-[1.3em]'>{{ __('Notes', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="dokan-rw-note-area">
                            <textarea v-model="withdrawalNote" :placeholder="__( 'Write reverse withdrawal note', 'dokan-lite' )"/>
                        </div>
                        <span v-if="errors.withdrawalNote" class='dokan-error'>{{ __( 'Please write reverse withdrawal note', 'dokan-lite' ) }}</span>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <div class="dokan-rw-footer">
                    <button
                        class="button button-primary dokan-rw-footer-btn"
                        @click="addNewWithdraw"
                        :disabled="loading"
                    >
                        <img :src="loader" alt='' :class="loading ? 'is-loading' : 'not-loading'">
                        {{ __( 'Save', 'dokan' ) }}
                    </button>
                </div>
            </div>
        </modal>
    </div>
</template>

<script>
import FieldHeading from 'admin/components/FieldHeading.vue';
import DokanRadioGroup from 'admin/components/DokanRadioGroup.vue'

const Modal       = dokan_get_lib('Modal');
const Loading     = dokan_get_lib('Loading');
const Multiselect = dokan_get_lib('Multiselect');
const Debounce    = dokan_get_lib('debounce');

const swal = Swal.mixin({
    showCloseButton: true,
    showCancelButton: false,
    focusConfirm: false,
    showConfirmButton: false,
    timer: 5000
});

export default {
    name: 'AddReverseWithdraw',

    components: {
        FieldHeading,
        Modal,
        DokanRadioGroup,
        Loading,
        Multiselect,
        Debounce,
        swal
    },

    data() {
        return {
            loader: window.dokan.ajax_loader,
            title: this.__( 'Add New Reverse Withdrawal', 'dokan-lite' ),
            transectionType: 'manual_product',
            withdrawalType: 'debit',
            transectionTypeItems: [
                {
                    label: this.__( 'Product', 'dokan-lite' ),
                    value: 'manual_product'
                },
                {
                    label: this.__( 'Order', 'dokan-lite' ),
                    value: 'manual_order'
                },
                {
                    label: this.__( 'Other', 'dokan-lite' ),
                    value: 'other'
                }
            ],
            withdrawalTypeItems: [
                {
                    label: this.__( 'Debit', 'dokan-lite' ),
                    value: 'debit'
                },
                {
                    label: this.__( 'Credit', 'dokan-lite' ),
                    value: 'credit'
                },
            ],
            allVendors: [],
            allProducts: [],
            allOrders: [],
            selectedVendor: '',
            selectedProduct: '',
            selectedOrder: '',
            withdrawalAmount: '',
            withdrawalNote: '',
            isProductSelectDisabled: false,
            loading: false,
            errors: {

            }
        }
    },

    methods:{
        closeModal() {
            this.$root.$emit('modalClosed');
        },

        validateData() {
            let debit  = 0,
                credit = 0,
                trn_id = 0;
            this.errors = {};

            if( ! this.selectedVendor.vendorId ) {
                this.errors.vendorId = true;
            }

            if ( ('manual_product' === this.transectionType && ! this.selectedProduct.id) || ('manual_order' === this.transectionType && ! this.selectedOrder.id) ) {
                this.errors.trId = true;
            }


            if ( ! this.withdrawalAmount ) {
                this.errors.withdrawalAmount = true;
            }


            if( ! this.withdrawalNote ) {
                this.errors.withdrawalNote = true;
            }

            if (Object.keys(this.errors).length) {
                return '';
            }

            debit = 'debit' === this.withdrawalType ? this.withdrawalAmount : 0;
            credit ='credit' === this.withdrawalType ? this.withdrawalAmount : 0;

            if ( 'manual_product' === this.transectionType ) {
                trn_id = this.selectedProduct.id ?? 0;
            } else if ( 'manual_order' === this.transectionType ) {
                trn_id = this.selectedOrder.id ?? 0;
            }

            return {
                trn_id,
                trn_type: this.transectionType,
                vendor_id: this.selectedVendor.vendorId ?? '',
                note: this.withdrawalNote,
                debit,
                credit,
            };
        },

        addNewWithdraw() {
            let data = this.validateData();

            if ( ! data ) {
                return;
            }

            this.loading = true;

            dokan.api.post('/reverse-withdrawal/transactions', data ).done( ( response ) => {
                this.closeModal();
                this.$notify({
                    title: this.__( 'Success!', 'dokan-lite' ),
                    type: 'success',
                    text: this.__( 'Reverse withdrawal created successfully.', 'dokan-lite' ),
                });
                this.$emit( 'onWithdrawCreate' )
            } ).fail( ( jqXHR ) => {
                swal.fire(
                    '',
                    dokan_handle_ajax_error(jqXHR),
                    'error'
                );
            } ).always(() => {
                this.loading = false;
            })
        },

        handleTransectionType(newValue) {
            this.transectionType = newValue;

            if( 'manual_product' === newValue ) {
                this.getProducts();
            } else if ( 'manual_order' === newValue ) {
                this.getOrders();
            }
        },

        handleWithdrawalType(newValue) {
            this.withdrawalType = newValue;
        },

        onStoreSelectVendor( option ) {
            this.selectedOrder = '';
            this.selectedProduct = '';

            if ( 'manual_product' === this.transectionType ) {
                this.getProducts();
            } else if ( 'manual_order' === this.transectionType ) {
                this.getOrders();
            }
        },

        getVendorList: Debounce( function( search = '' ) {
            let self = this;
            dokan.api.get('/stores', {
                paged: 1,
                search: search
            } ).done( ( response ) => {
                self.allVendors = [ { vendorId: 0, store_name: self.__( 'Select vendor', 'dokan' ) } ].concat( response.map((item) => {
                    return {
                        vendorId: item.id,
                        store_name: item.store_name
                    };
                }) );
            } ).fail( ( jqXHR ) => {
                swal.fire(
                    '',
                    dokan_handle_ajax_error(jqXHR),
                    'error'
                );
            } );
        }, 300 ),

        getProducts: Debounce( function( search = '' ) {
            let self = this;

            if ( ! this.selectedVendor.vendorId ) {
                return;
            }

            dokan.api.get('/products', {
                paged: 1,
                id: self.selectedVendor.vendorId,
                search: search,
                post_status: 'publish'
            } ).done( ( response ) => {
                self.allProducts = response.map((product) => {
                    return {
                        id: product.id,
                        name: product.name
                    };
                });
            } ).fail( ( jqXHR ) => {
                swal.fire(
                    '',
                    dokan_handle_ajax_error(jqXHR),
                    'error'
                );
            } );
        }, 300 ),

        getOrders: Debounce( function( search = '' ) {
            let self = this;

            if ( ! this.selectedVendor.vendorId ) {
                return;
            }

            dokan.api.get(`/orders?seller_id=${this.selectedVendor.vendorId}`, {} ).done( ( response ) => {
                self.allOrders = response.map((item) => {
                    return {
                        id: item.id,
                        name: `#${item.id}`
                    };
                });
            } ).fail( ( jqXHR ) => {
                swal.fire(
                    '',
                    dokan_handle_ajax_error(jqXHR),
                    'error'
                );
            } );
        }, 300 ),
    },

    created() {

    },

    mounted() {
        this.getVendorList();
    },
}
</script>

<style lang='less'>
.dokan-rw-footer {
    display: flex;
    flex-direction: row-reverse;
    .dokan-rw-footer-btn {
        display: flex;
        align-items: center;

        img {
            &.not-loading {
                height: 0px;
                transition: height 200ms;
            }
            &.is-loading {
                height: 20px;
                margin-right: 10px;
                transition: height 200ms;
            }
        }
    }
}

.dokan-rw-multiselect-container {
    .multiselect {
        .multiselect__tags {
            border: 1px solid #b0a7a7;

            .multiselect__placeholder {
                color: #b0a7a7;
            }
        }
    }
}

.dokan-rw-section {
    .dokan-rw-section-heading {
        display: flex;
        align-items: center;
        column-gap: 5px;
    }

    .dokan-rw-section-body {
        .dokan-rw-note-area {
            textarea {
                width: 100%;
                padding: .2rem;
                border: 1px solid #b0a7a7;
                min-height: 100px;
                padding-left: .2rem;
                padding-right: .2rem;

                &:focus {
                    border-color: #b0a7a7;
                    box-shadow: 0 0 0 0px #b0a7a7;
                    outline: none;
                }

                &::placeholder {
                    color: #b0a7a7;
                }
            }
        }
    }
}

.dokan-rw-multiselect {
    margin-top: 1rem;
    input {
        padding: 0;
        line-height: 0;
        min-height: 0;
        box-shadow: none;
        border-radius: 0;
        border: none;

        &:focus {
            border-color: transparent;
            box-shadow: none;
            outline: none;
        }
    }
}

.dokan-rw-input {
    input {
        width: 100%;
        padding: .2rem;
        border: 1px solid #b0a7a7;

        &:focus {
            border-color: #b0a7a7;
            box-shadow: 0 0 0 0px #b0a7a7;
            outline: none;
        }

        &::placeholder {
            color: #b0a7a7;
        }
    }
}

@media only screen and (max-width: 800px) {
    .dokan-add-new-rw .dokan-modal-content {
        width: 80% !important;
    }
}

@media only screen and (max-width: 500px) {
    .dokan-add-new-rw .dokan-modal-content {
        width: 400px !important;
        top: 50% !important;
    }
}

@media only screen and (max-width: 376px) {
    .dokan-add-new-rw .dokan-modal-content {
        width: 90% !important;
    }
}

.dokan-add-new-rw .dokan-modal-content {
    height: 70% !important;
    overflow: scroll;
}

.dokan-add-new-rw .modal-footer {
    bottom: -55px;
    position: relative;
}

.dokan-add-new-rw .modal-body {
    overflow-y: hidden !important;
}
</style>
