<template>
    <div class='dokan-add-new-rw'>
        <modal :title='title' width='800px' @close='closeModal'>
            <div slot='body' class='dokan-rw-body'>
                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-heading'>
                        <h3>{{ __('Vendor', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="form-group dokan-rw-multiselect">
                            <multiselect
                                @search-change="getVendorList"
                                v-model="selectedVendor"
                                :placeholder="this.__( 'Select vendor', 'dokan-lite' )"
                                :options="allVendors"
                                @select="onStoreSelectVendor"
                                track-by="vendor_id"
                                label="store_name"
                                :internal-search="false"
                                :clear-on-select="false"
                                :allow-empty="false"
                                :multiselect="false"
                                :searchable="true"
                                :showLabels="false"
                            />
                        </div>
                    </div>
                </div>

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

                        <div class="form-group dokan-rw-multiselect" v-if="'product' === transectionType">
                            <multiselect
                                @search-change="getProducts"
                                v-model="selectedProduct"
                                :placeholder="this.__( 'Select product', 'dokan-lite' )"
                                :options="allProducts"
                                track-by="id"
                                label="name"
                                :internal-search="false"
                                :clear-on-select="false"
                                :allow-empty="false"
                                :multiselect="false"
                                :searchable="true"
                                :showLabels="false"
                                :disabled="isProductSelectDisabled || ! selectedVendor.vendor_id"
                            />
                        </div>

                        <Transition>
                        <div class="form-group dokan-rw-multiselect" v-if="'order' === transectionType">
                            <multiselect
                                @search-change="getOrders"
                                v-model="selectedOrder"
                                :placeholder="this.__( 'Select order', 'dokan-lite' )"
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
                        </div>
                        </Transition>
                    </div>
                </div>

                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-heading'>
                        <h3>{{ __('Withdrawal amount', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <dokan-radio-group
                            @onChange="handleWithdrawalType"
                            :value="withdrawalType"
                            :items="withdrawalTypeItems"
                        />
                        <div class="dokan-rw-input">
                            <input
                                v-model='withdrawalAmount'
                                type='number'
                                class='regular-text'
                                :placeholder="__( 'Enter withdrawal amount', 'dokan-lite' )"
                            />
                        </div>
                    </div>
                </div>

                <div class='dokan-rw-section'>
                    <div class='dokan-rw-section-heading'>
                        <h3>{{ __('Withdrawal note', 'dokan-lite') }}</h3>
                    </div>
                    <div class='dokan-rw-section-body'>
                        <div class="dokan-rw-note-area">
                            <textarea v-model="withdrawalNote" :placeholder="__( 'Write withdrawal note', 'dokan-lite' )"/>
                        </div>
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

const Modal   = dokan_get_lib('Modal');
const Loading = dokan_get_lib('Loading');
const Multiselect     = dokan_get_lib('Multiselect');
const Debounce        = dokan_get_lib('debounce');

export default {
    name: 'AddReverseWithdraw',

    components: {
        FieldHeading,
        Modal,
        DokanRadioGroup,
        Loading,
        Multiselect,
        Debounce
    },

    data() {
        return {
            loader: window.dokan.ajax_loader,
            title: this.__( 'Add new reverse withdrawal', 'dokan-lite' ),
            transectionType: 'product',
            withdrawalType: 'debit',
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
            loading: false
        }
    },

    methods:{
        closeModal() {
            this.$root.$emit('modalClosed');
        },

        addNewWithdraw() {
            let data = {
                store: this.selectedVendor.vendor_id ?? '',
                transectionType: this.transectionType,
                orderId: this.selectedOrder.id ?? '',
                productId: this.selectedProduct.id ?? '',
                type: this.withdrawalType,
                amount: this.withdrawalAmount,
                note: this.withdrawalNote
            }

            console.log(data);
            this.loading = true;
            setTimeout(()=>{
                this.loading = false;
            }, 3000);
        },

        handleTransectionType(newValue) {
            this.transectionType = newValue;

            if( 'product' === newValue ) {
                this.getProducts();
            } else if ( 'order' === newValue ) {
                this.getOrders();
            }
        },

        handleWithdrawalType(newValue) {
            this.withdrawalType = newValue;
        },

        onStoreSelectVendor( option ) {
            this.selectedOrder = '';
            this.selectedProduct = '';

            if ( 'product' === this.transectionType ) {
                this.getProducts();
            } else if ( 'order' === this.transectionType ) {
                this.getOrders();
            }
        },

        getVendorList: Debounce( function( search = '' ) {
            let self = this;
            dokan.api.get('/stores', {
                paged: 1,
                search: search
            } ).done( ( response ) => {
                self.allVendors = [ { vendor_id: 0, store_name: self.__( 'Select vendor', 'dokan' ) } ].concat( response.map((item) => {
                    return {
                        vendor_id: item.id,
                        store_name: item.store_name
                    };
                }) );
            } ).fail( ( jqXHR ) => {
                self.allVendors = [ { vendor_id: 0, store_name: self.__( 'Select vendor', 'dokan' ) } ];
            } );
        }, 300 ),

        getProducts: Debounce( function( search = '' ) {
            let self = this;

            if ( ! this.selectedVendor.vendor_id ) {
                return;
            }

            dokan.api.get('/products', {
                paged: 1,
                id: self.selectedVendor.vendor_id,
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
                self.filter.stores = [ { id: 0, name: self.__( 'No product found', 'dokan' ) } ];
            } );
        }, 300 ),

        getOrders: Debounce( function( search = '' ) {
            let self = this;

            if ( ! this.selectedVendor.vendor_id ) {
                return;
            }

            dokan.api.get(`/orders?seller_id=${this.selectedVendor.vendor_id}`, {} ).done( ( response ) => {
                self.allOrders = response.map((item) => {
                    return {
                        id: item.id,
                        name: `#${item.id}`
                    };
                });
            } ).fail( ( jqXHR ) => {
                self.filter.stores = [ { id: 0, name: self.__( 'No orders found', 'dokan' ) } ];
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

.multiselect {
    .multiselect__tags {
        border: 1px solid #b0a7a7;

        .multiselect__placeholder {
            color: #b0a7a7;
        }
    }
}

.dokan-rw-section {
    .dokan-rw-section-body{
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
        margin-top: 1rem;
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
</style>
