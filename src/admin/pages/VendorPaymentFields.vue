<template>
    <div :class="{'payment-info': true, 'edit-mode': getId()}">
        <div class="content-header">
            {{__( 'Payment Options', 'dokan-lite' )}}
        </div>

        <div class="content-body">
            <div class="dokan-form-group">
                <div class="column">
                    <label for="account-name">{{ __( 'Account Name', 'dokan-lite') }}</label>
                    <input type="text" id="account-name" class="dokan-form-input" v-model="vendorInfo.payment.bank.ac_name" :placeholder="__( 'Account Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="account-number">{{ __( 'Account Number', 'dokan-lite') }}</label>
                    <input type="text" id="account-number" class="dokan-form-input" v-model="vendorInfo.payment.bank.ac_number" :placeholder="__( '1233456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="account-type">{{ __( 'Account Type', 'dokan-lite') }}</label>
                    <select id="account-type" class="dokan-form-input" v-model="vendorInfo.payment.bank.ac_type" >
                        <option value="">{{__('Please Select...', 'dokan-lite')}}</option>
                        <option value="personal">{{__('Personal', 'dokan-lite')}}</option>
                        <option value="business">{{__('Business', 'dokan-lite')}}</option>
                    </select>
                </div>

                <div class="column">
                    <label for="bank-name">{{ __( 'Bank Name', 'dokan-lite') }}</label>
                    <input type="text" id="bank-name" class="dokan-form-input" v-model="vendorInfo.payment.bank.bank_name" :placeholder="__( 'Bank Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="bank-address">{{ __( 'Bank Address', 'dokan-lite') }}</label>
                    <input type="text" id="bank-address" class="dokan-form-input" v-model="vendorInfo.payment.bank.bank_addr" :placeholder="__( 'Bank Address', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="routing-number">{{ __( 'Routing Number', 'dokan-lite') }}</label>
                    <input type="text" id="routing-number" class="dokan-form-input" v-model="vendorInfo.payment.bank.routing_number" :placeholder="__( '123456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="iban">{{ __( 'IBAN', 'dokan-lite') }}</label>
                    <input type="text" id="iban" class="dokan-form-input" v-model="vendorInfo.payment.bank.iban" :placeholder="__( '123456789', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="swift">{{ __( 'Swift', 'dokan-lite') }}</label>
                    <input type="text" id="swift" class="dokan-form-input" v-model="vendorInfo.payment.bank.swift" :placeholder="__( '123456789', 'dokan-lite')">
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
                    <label for="paypal-email">{{ __( 'PayPal Email', 'dokan-lite') }}</label>
                    <input type="email" id="paypal-email" class="dokan-form-input" v-model="vendorInfo.payment.paypal.email" :placeholder="__( 'store@email.com', 'dokan-lite')">
                </div>

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

                <!-- Add other payment fields here -->
                <component v-for="(component, index) in afterFeaturedCheckbox"
                    :key="index"
                    :is="component"
                    :vendorInfo="vendorInfo"
                />

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
import Switches from 'admin/components/Switches.vue'
import { Multiselect } from 'vue-multiselect';

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
            getBankFields: dokan.hooks.applyFilters( 'getVendorBankFields', [] ),
            getPyamentFields: dokan.hooks.applyFilters( 'AfterPyamentFields', [] ),
            afterFeaturedCheckbox: dokan.hooks.applyFilters( 'afterFeaturedCheckbox', [] ),
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
}
</style>
