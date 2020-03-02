<template>
    <div class="dokan-vendor-edit">
        <modal :title="title" width="800px" @close="closeModal">
            <div slot="body">
                <div class="tab-header">
                    <ul class="tab-list">
                        <li v-for="(tab, index) in tabs" :key="index" :class="{'tab-title': true, 'active': currentTab === tab.name, 'last': tab.name === 'VendorPaymentFields'}">
                            <div class="tab-link">
                                <a href="#" @click.prevent="currentTab = tab.name" :class="{'first': tab.name === 'VendorAccountFields'}">
                                    <span :class="[ tab.icon ]"></span>
                                    {{tab.label}}
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="tab-contents" v-if="currentTab">

                    <div class="loading" v-if="isLoading">
                        <loading></loading>
                    </div>

                    <transition name="component-fade" mode="out-in" v-if="! isLoading">
                        <component :vendorInfo="store" :is="currentTab" :errors="errors" />
                    </transition>
                </div>
            </div>

            <div slot="footer">
                <button class="button button-primary button-hero" @click="createVendor">{{ 'VendorPaymentFields' === currentTab ? __( 'Create Vendor', 'dokan-lite' ) : this.nextBtn }}</button>
            </div>
        </modal>
    </div>
</template>

<script>

const Modal   = dokan_get_lib('Modal');
const Loading = dokan_get_lib('Loading');

import VendorAccountFields from './VendorAccountFields.vue';
import VendorAddressFields from './VendorAddressFields.vue';
import VendorPaymentFields from './VendorPaymentFields.vue';

export default {

    name: 'AddVendor',

    props: ['vendorId'],

    components: {
        Modal,
        Loading,
        VendorAccountFields,
        VendorAddressFields,
        VendorPaymentFields
    },

    data() {
        return {
            isLoading: false,
            storeId: '',
            nextBtn: this.__( 'Next', 'dokan-lite' ),
            title: this.__( 'Add New Vendor', 'dokan-lite' ),
            tabs: {
                VendorAccountFields: {
                    label: this.__( 'Account Info', 'dokan-lite' ),
                    name: 'VendorAccountFields',
                    icon: 'dashicons dashicons-admin-users',
                },
                VendorAddressFields: {
                    label: this.__( 'Address', 'dokan-lite' ),
                    name: 'VendorAddressFields',
                    icon: 'dashicons dashicons-admin-home',
                },
                VendorPaymentFields: {
                    label: this.__( 'Payment Options', 'dokan-lite' ),
                    name: 'VendorPaymentFields',
                    icon: 'dashicons dashicons-money',
                }
            },
            currentTab: 'VendorAccountFields',
            store: {
                store_name: '',
                user_pass: '',
                store_url: '',
                user_login: '',
                email: '',
                user_nicename: '',
                notify_vendor: true,
                phone: '',
                banner: '',
                banner_id: '',
                gravatar: '',
                gravatar_id: '',
                social: {
                    fb: '',
                    gplus: '',
                    youtube: '',
                    twitter: '',
                    linkedin: '',
                    pinterest: '',
                    instagram: '',
                },
                payment: {
                    bank: {
                        ac_name: '',
                        ac_number: '',
                        bank_name: '',
                        bank_addr: '',
                        routing_number: '',
                        iban: '',
                        swift: ''
                    },
                    paypal: {
                        email: ''
                    }
                },
                address: {
                    street_1: '',
                    street_2: '',
                    city: '',
                    zip: '',
                    state: '',
                    country: ''
                }
            },
            requiredFields: [
                'store_name',
                'user_login',
                'email'
            ],
            errors: [],
            storeAvailable: false,
            userNameAvailable: false,
            emailAvailable: false,
            hasPro: dokan.hasPro
        };
    },

    created() {
        this.$root.$on( 'vendorInfoChecked', ( payload ) => {
            this.storeAvailable    = payload.storeAvailable;
            this.userNameAvailable = payload.userNameAvailable;
            this.emailAvailable    = payload.emailAvailable;
        } );
    },

    methods: {
        getId() {
            return this.$route.params.id;
        },

        showAlert( $title, $des, $status ) {
            this.$swal( $title, $des, $status );
        },

        createVendor() {

            if ( ! this.formIsValid() ) {
                return;
            }

            if ( 'VendorPaymentFields' === this.currentTab ) {
                this.isLoading = true;

                dokan.api.post( '/stores/', this.store )
                .done( ( response ) => {
                    this.$root.$emit( 'vendorAdded', response );

                    this.$swal( {
                        type: 'success',
                        title: this.__( 'Vendor Created', 'dokan-lite' ),
                        text: this.__( 'A vendor has been created successfully!', 'dokan-lite' ),
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: this.__( 'Add Another', 'dokan-lite' ),
                        cancelButtonText: this.__( 'Edit Vendor', 'dokan-lite' ),
                        focusConfirm: false
                    } )
                    .then( ( result ) => {
                        if ( result.value ) {
                            this.$root.$emit( 'addAnotherVendor' );
                        } else if ( result.dismiss === this.$swal.DismissReason.cancel ) {

                            if ( this.hasPro ) {
                                this.$router.push( { path: 'vendors/' + response.id, query:{ edit: 'true' } } );
                            } else {
                                window.location.replace( `${dokan.urls.adminRoot}user-edit.php?user_id=${response.id}` );
                            }
                        }
                    } );
                } )
                .fail( ( response ) => {
                    this.showAlert( this.__( response.responseJSON.message, 'dokan-lite' ), '', 'error' );
                } )
                .always( () => {
                    this.$root.$emit('modalClosed');
                } )
            }

            // move next tab
            this.currentTab = 'VendorPaymentFields' === this.currentTab ? 'VendorPaymentFields' : this.nextTab(this.tabs, this.currentTab);
        },

        nextTab(tabs, currentTab) {
            let keys      = Object.keys(tabs);
            let nextIndex = keys.indexOf(currentTab) +1;
            let nextTab  =  keys[nextIndex];

            return nextTab;
        },

        closeModal() {
            this.$root.$emit('modalClosed');
        },

        formIsValid() {
            let requiredFields = this.requiredFields;
            let allFields = this.store;

            // empty the errors array on new form submit
            this.errors = [];

            requiredFields.forEach( ( field ) => {
                if ( field in allFields && allFields[field].length < 1 ) {
                    this.errors.push( field );
                }
            } );

            // if no error && store_slug & username is available, return true
            if ( this.errors.length < 1 && this.storeAvailable && this.userNameAvailable && this.emailAvailable ) {
                return true;
            }

            // go back to first tab, if there are errors
            this.currentTab = 'VendorAccountFields';

            return false;
        }
    }
};
</script>

<style lang="less">
.swal2-container {
    z-index: 9999999 !important;

    .swal2-popup .swal2-title {
        line-height: 35px;
        font-size: 30px;
        font-weight: 400;
    }
}

.dokan-vendor-edit {
    h1 {
        font-size: 23px;
        font-weight: 400;
    }

    .tab-header {

        .tab-list {
            overflow: hidden;
            display: flex;
            justify-content: space-between;

            .tab-title {
                // float: left;
                // margin-left: 0;
                // width: auto;
                height: 50px;
                list-style-type: none;
                // padding: 5px 20px 5px 38px;; /* padding around text, last should include arrow width */
                // border-right: 10px solid white; /* width: gap between arrows, color: background of document */
                position: relative;
                background-color: #1a9ed4;
                display: flex;
                justify-content: center;
                align-items: center;

                .icon {
                    position: relative;
                    top: 1px;
                }

                a {
                    color: #fff;
                    text-decoration: none;
                    padding: 75px;
                    // margin: -17px;

                    &:active, &:focus {
                        outline: none;
                        outline-style: none;
                        border-color: transparent;
                        box-shadow: none;
                    }

                    span {
                        position: relative;
                        top: -1px;
                        left: -3px;
                    }
                }

                &:first-child {
                    padding-left: 5px;
                }

                &:nth-child(n+2)::before {
                    position: absolute;
                    top:0;
                    left:0;
                    display: block;
                    border-left: 25px solid white; /* width: arrow width, color: background of document */
                    border-top: 25px solid transparent; /* width: half height */
                    border-bottom: 25px solid transparent; /* width: half height */
                    width: 0;
                    height: 0;
                    content: " ";
                }

                &:after {
                    z-index: 1; /* need to bring this above the next item */
                    position: absolute;
                    top: 0;
                    right: -25px; /* arrow width (negated) */
                    display: block;
                    border-left: 25px solid #f5f5f5; /* width: arrow width */
                    border-top: 25px solid transparent; /* width: half height */
                    border-bottom: 25px solid transparent; /* width: half height */
                    width:0;
                    height:0;
                    content: " ";
                    border-left-color: #1a9ed4;
                }
            }
            .tab-title.active {
                background-color: #2C70A3;

                a {
                    color: #fff;
                }

                &:after {
                    border-left-color: #2C70A3;
                }
            }

            // remove arrow for last element
            .tab-title.last {
                &:after {
                    border-left: 0;
                }
            }

            .tab-title.active ~.tab-title {
                background-color: #f5f5f5;

                &:after {
                    border-left-color: #f5f5f5;
                }

                a {
                    color: #000;
                }
            }

        }
    }

    .tab-contents {
        border: 1px solid #e5e5e5;
        border-radius: 3px;
        min-height: 400px;

        .loading {
            position: relative;
            left: 46%;
            top: 160px;
        }

        .content-header {
            background: #F9F9F9;
            margin: 0;
            padding: 10px;
        }

        .content-body {
            padding-top: 20px;
            padding-bottom: 20px;

            .dokan-form-group {
                margin: 0 10px;
                overflow: hidden;

                &:after,
                &:before {
                    display: table;
                    content: " ";
                }

                .column {
                    float: left;
                    width: 50%;
                    padding: 0 10px;

                    .store-avaibility-info {
                        display: flex;
                        justify-content: space-between;

                        .store-url, span {
                            margin: 0;
                            padding: 0;
                            position: relative;
                            bottom: 10px;
                            font-style: italic;
                            color: #a09f9f;
                            font-size: 12px;
                        }

                        .is-available {
                            color: green;
                        }

                        .not-available {
                            color: red;
                        }
                    }

                    .password-generator {
                        margin-top: 6px;

                        .regen-button {
                            margin-right: 5px;

                            span {
                                line-height: 26px;
                            }
                        }
                    }

                    .checkbox-left.notify-vendor {
                        margin-top: 6px;
                    }

                    .multiselect {
                        margin-top: 5px;
                    }

                    .multiselect__option--highlight {
                        background: #3c9fd4;
                    }

                    .multiselect__tags {
                        min-height: 45px;
                    }

                    .multiselect__single {
                        padding-top: 3px;
                    }

                    .multiselect__select {
                        &:before {
                            top: 70%;
                        }
                    }

                    .multiselect__input {
                        &:focus {
                            box-shadow: none;
                            border: none;
                            outline: none;
                        }
                    }
                }

                .bank-info {
                    padding-left: 10px;
                }
            }

            .dokan-form-input {
                width: 100%; /* Full width */
                padding: 7px 12px; /* Some padding */
                border: 1px solid #ccc; /* Gray border */
                border-radius: 4px; /* Rounded borders */
                box-sizing: border-box; /* Make sure that padding and width stays in place */
                margin-top: 6px; /* Add a top margin */
                margin-bottom: 16px; /* Bottom margin */
                resize: vertical; /* Allow the user to vertically resize the textarea (not horizontally) */
                height: auto
            }

            .dokan-form-input::placeholder {
                color: #bcbcbc;
            }

            .dokan-form-input.has-error::placeholder {
                color: red;
            }

            .vendor-image {
                display: flex;
                // align-items: flex-start;
                padding-bottom: 20px;

                .picture {
                    background: #fcfcfc;
                    border-radius: 3px;
                    padding: 5px 10px;
                    border: 2px dashed #d2d2d2;
                    text-align: center;
                    flex-grow: 1;
                    width: 150px;
                    margin-left: 20px;

                    .profile-image {
                        max-width: 100px;
                        margin: 0 auto;

                        img {
                            border: 1px solid #E5E5E5;
                            padding: 15px 10px 0;
                            cursor: pointer;
                            width: 100%;
                            padding: 5px;
                        }
                    }
                }
                .picture.banner {
                    padding: 0;
                    flex-grow: 10;
                    margin-right: 20px;
                    height: 228px;
                    padding-top: 5%;

                    .banner-image {
                        img {
                            width: 100%;
                            height: 223px;
                            padding: 0;
                        }

                        button {
                            background: #007cba;
                            color: white;
                            padding: 10px 15px;
                            border-radius: 3px;
                            margin: 20px 0;
                            cursor: pointer;
                        }
                    }
                }

                .picture.banner.has-banner {
                    padding-top: 0;
                }

                .picture-footer {
                    color: #808080;
                    font-weight: 300;
                }
            }
        }
    }

    .dokan-btn {
        background: #1a9ed4;
        padding: 10px 20px;
        color: white;
        border-radius: 3px;
        cursor: pointer;

        &:active, &:focus {
            outline: none;
            outline-style: none;
            border-color: transparent;
            box-shadow: none;
        }
    }

    .dokan-modal {
        .dokan-modal-content {
            height: 640px !important;

            .modal-body {
                max-height: 500px;
                min-height: 200px;
            }

            .modal-footer {
                padding: 15px;
                bottom: 0;
                border-top: none;
                box-shadow: none;
            }
        }
    }

    .component-fade-enter-active, .component-fade-leave-active {
      transition: opacity .2s ease;
    }

    .component-fade-enter, .component-fade-leave-to {
      opacity: 0;
    }

    @media only screen and ( max-width: 600px ) {
        .dokan-modal {
            .dokan-modal-content {
                height: 400px;

                .modal-body {
                    max-height: 300px;
                }
            }
        }
    }

    @media only screen and ( max-width: 500px ) {
        .tab-list {
            .tab-title {
                .tab-link {
                    display: flex;
                    a {
                        padding: 12px;
                        margin-left: 17px;

                        span {
                            display: block;
                            margin: 0 auto;
                        }
                    }
                }
            }
        }
        .tab-contents p, .tab-contents input, .tab-contents button {
            font-size: 13px;
        }

        .tab-contents {
            .vendor-image {
                display: block !important;
                .picture {
                    margin-right: 20px !important;
                    width: auto !important;
                }
                .picture.banner {
                    margin-top: 15px;
                }
            }
        }
    }

    @media only screen and ( max-width: 375px ) {
        .tab-list {
            .tab-title {
                .tab-link {
                    display: flex;
                    a {
                        padding: 5px;
                        margin-left: 20px;
                        font-size: 12px;
                    }
                }
            }
        }
        .tab-contents p, .tab-contents input, .tab-contents button {
            font-size: 12px;
        }
    }

    @media only screen and ( max-width: 320px ) {
        .tab-list {
            .tab-title {
                .tab-link {
                    display: flex;
                    a {
                        padding: 2px;
                        margin-left: 20px;
                        font-size: 10px;
                    }
                }
            }
        }
    }

}
</style>