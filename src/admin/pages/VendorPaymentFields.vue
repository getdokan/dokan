<template>
    <div :class="{'payment-info': true, 'edit-mode': getId()}">
        <div class="content-header">
            {{__( 'Payment Options', 'dokan-lite' )}}
        </div>

        <div class="content-body">
            <div class="dokan-form-group">
                <div class="column">
                    <label for="account-name">{{ __( 'Account Name', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.ac_name" :placeholder="__( 'Account Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="account-number">{{ __( 'Account Number', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.ac_number" :placeholder="__( '1233456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="bank-name">{{ __( 'Bank Name', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.bank_name" :placeholder="__( 'Bank Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="bank-address">{{ __( 'Bank Address', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.bank_addr" :placeholder="__( 'Bank Address', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="routing-number">{{ __( 'Routing Number', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.routing_number" :placeholder="__( '123456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="iban">{{ __( 'IBAN', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.iban" :placeholder="__( '123456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="swift">{{ __( 'Swift', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.payment.bank.swift" :placeholder="__( '123456789', 'dokan-lite')">
                </div>

                <!-- Add other bank fields here -->
                <component v-for="(component, index) in getBankFields"
                    :key="index"
                    :is="component"
                    :vendorInfo="vendorInfo"
                />
            </div>

            <div class="dokan-form-group">

                <div :class="{'column': getId(), 'checkbox-group': ! getId()}">
                    <label for="account-name">{{ __( 'PayPal Email', 'dokan-lite') }}</label>
                    <input type="email" class="dokan-form-input" v-model="vendorInfo.payment.paypal.email" :placeholder="__( 'store@email.com', 'dokan-lite')">
                </div>

                <!-- Admin commission only load on vendor edit page -->
                <template v-if="getId()">
                    <div class="column">
                        <div class="column">
                            <label>{{ __( 'Admin Commission Type', 'dokan-lite' ) }}</label>
                            <Multiselect @input="saveCommissionType" v-model="selectedCommissionType" :options="commissionTypes" :multiselect="false" :searchable="false" :showLabels="false" />
                        </div>
                    </div>

                    <div class="column combine-commission" v-if="'Combine' === selectedCommissionType">
                        <label>{{ __( 'Admin Commission', 'dokan-lite' )  }}</label>
                        <div class="combine-commission-field">
                            <input type="number" class="dokan-form-input percent_fee" v-model="vendorInfo.admin_commission">
                            {{ '% &nbsp;&nbsp; +' }}
                            <input type="number" class="dokan-form-input fixed_fee" v-model="vendorInfo.admin_additional_fee">
                        </div>
                    </div>

                    <div class="column" v-else>
                        <label>{{ __( 'Admin Commission', 'dokan-lite' )  }}</label>
                        <input type="number" class="dokan-form-input" v-model="vendorInfo.admin_commission">
                    </div>
                </template>

                <div class="checkbox-group">
                    <div class="checkbox-left">
                        <switches @input="setValue" :enabled="enabled" value="enabled"></switches>
                        <span class="desc">{{ __( 'Enable Selling', 'dokan-lite' ) }}</span>
                    </div>
                </div>

                <div class="checkbox-group">
                    <div class="checkbox-left">
                        <switches @input="setValue" :enabled="trusted" value="trusted"></switches>
                        <span class="desc">{{ __( 'Publish Product Directly', 'dokan-lite' ) }}</span>
                    </div>
                </div>

                <div class="checkbox-group">
                    <div class="checkbox-left">
                        <switches @input="setValue" :enabled="featured" value="featured"></switches>
                        <span class="desc">{{ __( 'Make Vendor Featured', 'dokan-lite' ) }}</span>
                    </div>
                </div>

            </div>

            <!-- Add other payment fields here -->
            <component v-for="(component, index) in getPyamentFields"
                :key="index"
                :is="component"
                :vendorInfo="vendorInfo"
            />
        </div>
    </div>
</template>

<script>
import Switches from "admin/components/Switches.vue"
import { Multiselect } from "vue-multiselect";

export default {
    name: 'VendorPaymentFields',

    components: {
        Switches,
        Multiselect
    },

    props: {
        vendorInfo: {
            type: Object
        },
    },

    data() {
        return {
            enabled: false,
            trusted: false,
            featured: false,
            commissionTypes: [
                this.__( 'Flat', 'dokan-lite' ),
                this.__( 'Percentage', 'dokan-lite' ),
                this.__( 'Combine', 'dokan-lite' )
            ],
            selectedCommissionType: this.__( 'Flat', 'dokan-lite' ),
            getBankFields: dokan.hooks.applyFilters( 'getVendorBankFields', [] ),
            getPyamentFields: dokan.hooks.applyFilters( 'AfterPyamentFields', [] ),
        }
    },

    created() {
        if ( this.vendorInfo.enabled ) {
            this.enabled = true;
            this.vendorInfo.enabled = true;
        }

        if ( this.vendorInfo.trusted ) {
            this.trusted = true;
            this.vendorInfo.trusted = true;
        }

        if ( this.vendorInfo.featured ) {
            this.featured = true;
            this.vendorInfo.featured = true
        }

        let commissionType = this.vendorInfo.admin_commission_type;

        if ( commissionType ) {
            this.selectedCommissionType = commissionType.charAt( 0 ).toUpperCase() + commissionType.slice( 1 );
        }
    },

    methods: {
        setValue( status, key ) {
            if ( 'enabled' === key ) {
                if ( status ) {
                    this.vendorInfo.enabled = true;
                } else {
                    this.vendorInfo.enabled = false;
                }
            }

            if ( 'trusted' === key ) {
                if ( status ) {
                    this.vendorInfo.trusted = true;
                } else {
                    this.vendorInfo.trusted = false;
                }
            }

            if ( 'featured' === key ) {
                if ( status ) {
                    this.vendorInfo.featured = true;
                } else {
                    this.vendorInfo.featured = false;
                }
            }
        },

        getId() {
            return this.$route.params.id;
        },

        saveCommissionType( value ) {
            if ( ! value ) {
                this.vendorInfo.admin_commission_type = 'flat';
            }

            this.vendorInfo.admin_commission_type = value.toLowerCase();
        }

    }

};
</script>

<style lang="less">
.checkbox-group {
    margin-top: 20px;
    padding: 0 10px;

    .checkbox-left {
        display: inline-block;
    }

    .checkbox-left {
        .switch {
            margin-right: 10px;
            display: inline-block;
        }
    }
}
.payment-info.edit-mode {
    .checkbox-group {
        padding: 0;
    }

    .dokan-form-select {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .combine-commission-field {
        .dokan-form-input.percent_fee, .dokan-form-input.fixed_fee {
            width: 40%;
        }
    }
}
</style>