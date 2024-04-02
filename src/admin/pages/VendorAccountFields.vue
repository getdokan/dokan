<template>
    <form class="account-info">
        <div class="content-header">
            {{__( 'Account Info', 'dokan-lite' )}}
        </div>

        <div class="content-body">
            <div class="vendor-image" v-if="! getId()">
                <div class="picture flex flex-col justify-center">
                    <p class="picture-header mb-4">{{ __( 'Vendor Picture', 'dokan-lite' ) }}</p>

                    <div class="profile-image">
                        <upload-image @uploadedImage="uploadGravatar" :croppingWidth="150" :croppingHeight="150" />
                    </div>

                    <p class="picture-footer mt-4"
                        v-html="sprintf( __( 'You can change your profile picture on %s', 'dokan-lite' ), '<a href=\'https://gravatar.com/\' target=\'_blank\'>Gravatar</a>' )"
                    />
                </div>

                <div class='!pt-0 !flex !flex-col !justify-center !items-center' :class="['picture banner', {'has-banner': vendorInfo.banner_id}]">
                    <div class="banner-image">
                        <upload-image @uploadedImage="uploadBanner" :showButton="showButton" :buttonLabel="__( 'Upload Banner', 'dokan-lite' )" />
                    </div>

                    <p v-if="showButton" class="picture-footer">{{ getUploadBannerText() }}</p>
                </div>
            </div>

            <div class="dokan-form-group">

                <div class="column">
                    <label for="first-name">{{ __( 'First Name', 'dokan-lite') }}</label>
                    <input type="email" id="first-name" class="dokan-form-input" v-model="vendorInfo.first_name" :placeholder="__( 'First Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="last-name">{{ __( 'Last Name', 'dokan-lite') }}</label>
                    <input type="email" id="last-name" class="dokan-form-input" v-model="vendorInfo.last_name" :placeholder="__( 'Last Name', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="store-name">{{ __( 'Store Name', 'dokan-lite') }}</label>
                    <span v-if="! getId()" class="required-field">*</span>

                    <input type="text"
                        id="store-name"
                        v-model="vendorInfo.store_name"
                        :class="{'dokan-form-input': true, 'has-error': getError('store_name')}"
                        :placeholder="getError( 'store_name' ) ? __( 'Store Name is required', 'dokan-lite' ) : __( 'Store Name', 'dokan-lite' )">
                </div>
                <div v-if="this.vendorInfo.categories" class="column">
                    <label for="store-category">{{ __( 'Store Category', 'dokan-lite' ) }}</label>
                    <StoreCategory
                        :categories=vendorInfo.categories
                        @categories='( categories ) => vendorInfo.categories = categories'
                    />
                </div>
                <div class="column" v-if="! getId()">
                    <label for="user-nicename">{{ __( 'Store URL', 'dokan-lite') }}</label>
                    <input type="text" id="user-nicename" class="dokan-form-input" v-model="vendorInfo.user_nicename" :placeholder="__( 'Store Url', 'dokan-lite')">

                    <div class="store-avaibility-info">
                        <p class="store-url" v-if="showStoreUrl">{{ storeUrl }}</p>
                        <p class="store-url" v-else>{{ otherStoreUrl }}</p>
                        <span :class="{'is-available': storeAvailable, 'not-available': !storeAvailable}">{{ storeAvailabilityText }}</span>
                    </div>
                </div>

                <div class="column">
                    <label for="store-phone">{{ __( 'Phone Number', 'dokan-lite') }}</label>
                    <input type="text" id="store-phone" class="dokan-form-input" v-model="vendorInfo.phone" @input.prevent="validatePhoneInput" :placeholder="__( '+123456789', 'dokan-lite' )">
                </div>

                <div class="column">
                    <label for="store-email">{{ __( 'Email', 'dokan-lite') }}</label>
                    <span v-if="! getId()" class="required-field">*</span>

                    <input type="email"
                        id="store-email"
                        v-model="vendorInfo.email"
                        :class="{'dokan-form-input': true, 'has-error': getError('email')}"
                        :placeholder="getError( 'email' ) ? __( 'Email is required', 'dokan-lite' ) : __( 'store@email.com', 'dokan-lite' )"
                    >

                    <div class="store-avaibility-info">
                        <span :class="{'is-available': emailAvailable, 'not-available': !emailAvailable}">{{ emailAvailabilityText }}</span>
                    </div>
                </div>

                <template v-if="! getId()">
                    <div class="column">
                        <label for="user-login">{{ __( 'Username', 'dokan-lite') }}</label><span class="required-field">*</span>
                        <input type="text" class="dokan-form-input"
                            id="user-login"
                            v-model="vendorInfo.user_login"
                            :class="{'dokan-form-input': true, 'has-error': getError('user_login')}"
                            :placeholder="getError( 'user_login' ) ? __( 'Username is required', 'dokan-lite' ) : __( 'Username', 'dokan-lite' )">

                            <div class="store-avaibility-info">
                                <span :class="{'is-available': userNameAvailable, 'not-available': !userNameAvailable}">{{ userNameAvailabilityText }}</span>
                            </div>


                        <div class="checkbox-left notify-vendor">
                            <switches
                                @input="sendEmail"
                                :enabled="true === vendorInfo.notify_vendor"
                                value="notify_vendor"
                            ></switches>
                            <span class="desc">{{ __( 'Send the vendor an email about their account.', 'dokan-lite' ) }}</span>
                        </div>
                    </div>

                    <div class="column">
                        <label for="store-password">{{ __( 'Password', 'dokan-lite') }}</label>
                        <input
                            id="store-password"
                            v-if="showPassword"
                            type="text"
                            v-model="vendorInfo.user_pass"
                            class="dokan-form-input"
                            placeholder="********"
                        >

                        <password-generator
                            @passwordGenerated="setPassword"
                            :title="__('Generate Password', 'dokan-lite')"
                        />

                    </div>
                </template>

                <!-- Add other account fields here -->
                <component v-for="(component, index) in getAccountFields"
                    :key="index"
                    :is="component"
                    :vendorInfo="vendorInfo"
                />
            </div>

        </div>
    </form>

</template>

<script>
import { debounce } from "debounce";
import Switches from "admin/components/Switches.vue";
import UploadImage from "admin/components/UploadImage.vue";
import PasswordGenerator from "admin/components/PasswordGenerator.vue";
import StoreCategory from 'admin/components/StoreCategory.vue';

export default {
    name: 'VendorAccountFields',

    components: {
        StoreCategory,
        Switches,
        UploadImage,
        PasswordGenerator,
    },

    props: {
        vendorInfo: {
            type: Object
        },
        errors: {
            type: Array,
            required: false
        }
    },

    data() {
        return {
            showStoreUrl: true,
            showPassword: false,
            otherStoreUrl: null,
            banner: '',
            defaultUrl: dokan.urls.siteUrl + dokan.urls.storePrefix + '/',
            showButton: true,
            placeholderData: '',
            delay: 500,
            storeAvailable: null,
            userNameAvailable: null,
            emailAvailable: null,
            storeAvailabilityText: '',
            userNameAvailabilityText: '',
            emailAvailabilityText: '',
            getAccountFields: dokan.hooks.applyFilters( 'getVendorAccountFields', [] ),
        }
    },

    watch: {
        'vendorInfo.store_name'( value ) {
            this.showStoreUrl = true;
        },

        'vendorInfo.user_nicename'( newValue ) {
            if ( typeof newValue !== 'undefined' ) {
                this.showStoreUrl = false;
                this.otherStoreUrl = this.defaultUrl + newValue.trim().split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace( /-+/g, '-' );
                this.vendorInfo.user_nicename = newValue.split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace( /-+/g, '-' );

                // check if the typed url is available
                this.checkStoreName();
            }
        },

        'vendorInfo.user_login'( value ) {
            this.checkUsername();
        },

        'vendorInfo.email'( value ) {
            this.checkEmail();
        },
    },

    computed: {
        storeUrl() {
            let storeUrl = this.vendorInfo.store_name.trim().split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace( /-+/g, '-' );
            this.vendorInfo.user_nicename = storeUrl;
            this.otherStoreUrl = this.defaultUrl + storeUrl;
            return this.defaultUrl + storeUrl;
        }
    },

    created() {
        this.checkStoreName = debounce( this.checkStore, this.delay );
        this.checkUsername = debounce( this.searchUsername, this.delay );
        this.checkEmail = debounce( this.searchEmail, this.delay );
        this.$root.$on( 'passwordCancelled', () => {
            this.showPassword = false;
        } );
    },

    methods: {
        uploadBanner( image ) {
            this.vendorInfo.banner_id = image.id;

            // hide button and footer text after uploading banner
            this.showButton = false;
        },

        uploadGravatar( image ) {
            this.vendorInfo.gravatar_id = image.id;
        },

        // getId function has been used to identify whether is it vendor edit page or not
        getId() {
            return this.$route.params.id;
        },

        onSelectBanner( image ) {
            this.banner = image.url;
            this.vendorInfo.banner_id = image.id;
        },

        getError( key ) {
            let errors = this.errors;

            if ( ! errors || typeof errors === 'undefined' ) {
                return false;
            }

            if ( errors.length < 1 ) {
                return false;
            }

            if ( errors.includes( key ) ) {
                return key;
            }
        },

        checkStore() {
            const storeName = this.vendorInfo.user_nicename;

            if ( ! storeName ) {
                return;
            }

            this.storeAvailabilityText = this.__( 'Searching...', 'dokan-lite' );

            dokan.api.get( `/stores/check`, {
                store_slug: storeName
            } ).then( ( response ) => {
                if ( response.available ) {
                    this.storeAvailable = true;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.storeAvailabilityText = this.__( 'Available', 'dokan-lite' )
                } else {
                    this.storeAvailable = false;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.storeAvailabilityText = this.__( 'Not Available', 'dokan-lite' );
                }
            } );
        },

        searchUsername() {
            const userName = this.vendorInfo.user_login;

            if ( ! userName ) {
                return;
            }

            this.userNameAvailabilityText = this.__( 'Searching...', 'dokan-lite' );

            dokan.api.get( `/stores/check`, {
                username: userName
            } ).then( ( response ) => {
                if ( response.available ) {
                    this.userNameAvailable = true;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.userNameAvailabilityText = this.__( 'Available', 'dokan-lite' )
                } else {
                    this.userNameAvailable = false;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.userNameAvailabilityText = this.__( 'Not Available', 'dokan-lite' );
                }
            } );
        },

        searchEmail() {
            const userEmail = this.vendorInfo.email;

            if ( ! userEmail ) {
                return;
            }

            this.emailAvailabilityText = this.__( 'Searching...', 'dokan-lite' );

            dokan.api.get( `/stores/check`, {
                email: userEmail
            } ).then( ( response ) => {
                if ( response.available ) {
                    this.emailAvailable = true;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.emailAvailabilityText = this.__( 'Available', 'dokan-lite' )
                } else {
                    this.emailAvailable = false;
                    this.$root.$emit( 'vendorInfoChecked', {
                        userNameAvailable: this.userNameAvailable,
                        storeAvailable: this.storeAvailable,
                        emailAvailable: this.emailAvailable
                    } );
                    this.emailAvailabilityText = response.message ? response.message : this.__( 'This email is already registered, please choose another one.', 'dokan-lite' );
                }
            } );
        },

        setPassword( password ) {
            this.showPassword = true;
            this.vendorInfo.user_pass = password;
        },

        sendEmail( status, key ) {
            if ( 'notify_vendor' !== key ) {
                return;
            }

            this.vendorInfo.notify_vendor = status;
        },

        getUploadBannerText() {
            let width  = dokan.store_banner_dimension.width;
            let height = dokan.store_banner_dimension.height;

            return this.__( `Upload banner for your store. Banner size is (${width}x${height}) pixels.`, 'dokan-lite' );
        },

        validatePhoneInput( event ) {
            this.vendorInfo.phone = this.vendorInfo.phone.replace( /[^0-9\\.\-\_\(\)\+]+/g, '' );
        }
    }
};
</script>
