<template>
    <div class="dokan-vendor-single">
        <h2></h2>
        <AdminNotice></AdminNotice>

        <div style="margin-bottom: 10px">
            <a class="button" href="javascript:history.go(-1)">&larr; {{ __( 'Go Back', 'dokan' ) }}</a>
        </div>

        <div class="dokan-hide">
            {{store}}
        </div>

        <modal
            :title="__( 'Send Email', 'dokan' )"
            v-if="showDialog"
            @close="showDialog = false"
        >
            <template slot="body">
                <div class="form-row">
                    <label for="mailto">{{ __( 'To', 'dokan' ) }}</label>
                    <input type="text" id="mailto" disabled="disabled" :value="mailTo">
                </div>

                <div class="form-row">
                    <label for="replyto">{{ __( 'Reply-To', 'dokan' ) }}</label>
                    <input type="email" id="replyto" v-model="mail.replyto">
                </div>

                <div class="form-row">
                    <label for="subject">{{ __( 'Subject', 'dokan' ) }}</label>
                    <input type="text" id="subject" v-model="mail.subject">
                </div>

                <div class="form-row">
                    <label for="message">{{ __( 'Message', 'dokan' ) }}</label>
                    <textarea id="message" rows="5" cols="60" v-model="mail.body"></textarea>
                </div>
            </template>

            <template slot="footer">
                <button class="button button-primary button-large" @click="sendEmail()">{{ __( 'Send Email', 'dokan' ) }}</button>
            </template>
        </modal>

        <div class="vendor-profile" v-if="store.id">
            <section class="vendor-header">
                <div class="profile-info">

                    <div class="featured-vendor" v-if="store.featured">
                        <span title="Featured Vendor" class="dashicons dashicons-star-filled"></span>
                    </div>

                    <div :class="{'profile-icon': true, 'edit-mode': editMode}">
                        <template v-if="editMode">
                            <upload-image @uploadedImage="uploadGravatar" :croppingWidth="625" :croppingHeight="625" :src="store.gravatar_id && store.gravatar ? store.gravatar : getDefaultPic()">
                                <template v-slot:imagePlaceholder>
                                    <span class="edit-photo" v-if="editMode" :style="{color: ! store.gravatar_id ? 'black' : '' }">
                                        {{ __( 'Change Store Photo', 'dokan' ) }}
                                    </span>
                                </template>
                            </upload-image>
                        </template>
                        <template v-else>
                            <img :src="store.gravatar ? store.gravatar : getDefaultPic()" :alt="store.store_name">
                        </template>
                    </div>

                    <div :class="{'store-info': true, 'edit-mode': editMode}">
                        <template v-if="! editMode">
                            <h2 class="store-name">{{ store.store_name ? store.store_name : __( '(No Name)', 'dokan' ) }}</h2>
                        </template>

                        <div class="star-rating" v-if="! editMode">
                            <span v-for="i in 5" :class="['dashicons', i <= store.rating.rating ? 'active' : '' ]"></span>
                        </div>

                        <template v-if="editMode">
                            <VendorAccountFields :vendorInfo="store" />
                        </template>


                        <template v-if="categories.length && ! editMode">
                            <template v-if="! editingCategories">
                                <template v-if="! store.categories.length">
                                    <a
                                        class="store-categoy-names"
                                        href="#edit-categories"
                                        v-html="isCategoryMultiple ? __( 'Add Categories', 'dokan' ) : __( 'Add Category', 'dokan' )"
                                        @click.prevent="editCategory"
                                    />
                                </template>
                                <template v-else>
                                    <a
                                        class="store-categoy-names"
                                        href="#edit-categories"
                                        v-html="store.categories.map( category => category.name ).join( ', ' )"
                                        @click.prevent="editCategory"
                                    />
                                </template>
                            </template>
                            <template v-else>
                                <div class="store-categories-editing">
                                    <h4>{{ isCategoryMultiple ? __( 'Set Store Categories', 'dokan' ) : __( 'Set Store Category', 'dokan' ) }}</h4>
                                    <fieldset :disabled="isUpdating">
                                        <select multiple="multiple"
                                                id="store-categories"
                                                style="width: 100%"
                                                :data-placeholder="__( 'Select Category', 'dokan' )">
                                        </select>
                                        <p>
                                            <button
                                                class="button button-primary button-small"
                                                v-text="__( 'Done', 'dokan' )"
                                                @click="updateStore"
                                            />
                                            <button
                                                class="button button-link button-small"
                                                v-text="__( 'Cancel', 'dokan' )"
                                                @click="editingCategories = false"
                                            />
                                        </p>
                                    </fieldset>
                                </div>
                            </template>
                        </template>

                        <ul :class="{'store-details': true, 'edit-mode': editMode}" v-if="! editMode">
                            <li class="address">
                                <span class="street_1" v-if="store.address.street_1">{{ store.address.street_1 }}, </span>
                                <span class="street_2" v-if="store.address.street_2">{{ store.address.street_2 }}, </span>
                                <span class="city" v-if="store.address.city">{{ store.address.city }}, </span>
                                <span class="state-zip" v-if="store.address.state">{{ store.address.state }} {{ store.address.zip }}</span>
                                <span class="country" v-if="store.address.country">{{ store.address.country }}</span>
                            </li>
                            <li class="phone">
                                {{ store.phone ? store.phone : '—' }}
                            </li>
                        </ul>

                        <div class="actions" v-if="! editMode">
                            <button v-if="hasPro" class="button message" @click="messageDialog()"><span class="dashicons dashicons-email"></span> {{ __( 'Send Email', 'dokan' ) }}</button>
                            <button :class="['button', 'status', store.enabled ? 'enabled' : 'disabled']"><span class="dashicons"></span> {{ store.enabled ? __( 'Enabled', 'dokan' ) : __( 'Disabled', 'dokan' ) }}</button>
                        </div>
                    </div>
                </div>

                <div :class="{'profile-banner': true, 'edit-mode': editMode}">
                    <div class="banner-wrap">
                        <template v-if="editMode">
                            <upload-image @uploadedImage="uploadBanner" :src="store.banner">
                                <template v-slot:imagePlaceholder>
                                        <span class="edit-banner" v-if="editMode">
                                            <i class="change-banner dashicons dashicons-format-image"></i>
                                            {{ __( 'Change Store Banner', 'dokan' ) }}
                                        </span>
                                </template>
                            </upload-image>
                        </template>

                        <template v-else>
                            <img v-if="store.banner" :src="store.banner" :alt="store.store_name">
                        </template>
                    </div>
                    <div :class="{'action-links': true, 'edit-mode': editMode}">
                        <template v-if="editMode">
                            <button @click="editMode = false" class="button">{{ __( 'Cancel', 'dokan' ) }}</button>
                            <button @click="updateStore" class="button button-primary">{{ saveBtn }}</button>
                        </template>

                        <template v-else>
                            <a :href="store.shop_url" target="_blank" class="button visit-store">{{ __( 'Visit Store', 'dokan' ) }} <span class="dashicons dashicons-arrow-right-alt"></span></a>
                            <router-link :to="id" class="button" @click.native="editMode = true">
                                <span class="dashicons dashicons-edit"></span>
                            </router-link>
                        </template>
                    </div>
                </div>
            </section>

            <section class="vendor-summary" v-if="stats !== null && !editMode">
                <!-- Add other component here -->
                <component v-for="(dokanSingleVendorSummarySection, index) in dokanSingleVendorSummarySectionStart"
                           :key="index"
                           :is="dokanSingleVendorSummarySection"
                           :vendor_id = parseInt($route.params.id)
                />
                <div class="summary-wrap products-revenue">
                    <div class="stat-summary products">
                        <h3>{{ __( 'Products', 'dokan' ) }}</h3>

                        <ul class="counts">
                            <li class="products">
                                <span class="count"><a :href="productUrl()">{{ stats.products.total }}</a></span>
                                <span class="subhead">{{ __( 'Total Products', 'dokan' ) }}</span>
                            </li>
                            <li class="items">
                                <span class="count">{{ stats.products.sold }}</span>
                                <span class="subhead">{{ __( 'Items Sold', 'dokan' ) }}</span>
                            </li>
                            <li class="visitors">
                                <span class="count">{{ stats.products.visitor }}</span>
                                <span class="subhead">{{ __( 'Store Visitors', 'dokan' ) }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="stat-summary revenue">
                        <h3>{{ __( 'Revenue', 'dokan' ) }}</h3>

                        <ul class="counts">
                            <li class="orders">
                                <span class="count"><a :href="ordersUrl()">{{ stats.revenue.orders }}</a></span>
                                <span class="subhead">{{ __( 'Orders Processed', 'dokan' ) }}</span>
                            </li>
                            <li class="gross">
                                <span class="count">
                                    <currency :amount="stats.revenue.sales"></currency>
                                </span>
                                <span class="subhead">{{ __( 'Gross Sales', 'dokan' ) }}</span>
                            </li>
                            <li class="earning">
                                <span class="count">
                                    <currency :amount="stats.revenue.earning"></currency>
                                </span>
                                <span class="subhead">{{ __( 'Total Earning', 'dokan' ) }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="stat-summary others">
                        <h3>{{ __( 'Others', 'dokan' ) }}</h3>

                        <ul class="counts">
                            <li class="commision">
                                <span class="count" v-html="getEearningRate"></span>
                                <span class="subhead">{{ __( 'Admin Commission Rate', 'dokan' ) }}</span>
                            </li>
                            <li class="balance">
                                <span class="count">
                                    <currency :amount="stats.others.balance"></currency>
                                </span>
                                <span class="subhead">{{ __( 'Current Balance', 'dokan' ) }}</span>
                            </li>
                            <li class="reviews">
                                <span class="count">{{ stats.others.reviews }}</span>
                                <span class="subhead">{{ __( 'Reviews', 'dokan' ) }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="vendor-info">
                    <ul>
                        <li class="registered">
                            <div class="subhead">{{ __( 'Registered Since', 'dokan' ) }}</div>
                            <span class="date">
                                {{ moment(store.registered).format('MMM D, YYYY') }}
                                ({{ moment(store.registered).toNow(true) }})
                            </span>
                        </li>
                        <li class="social-profiles">
                            <div class="subhead">{{ __( 'Social Profiles', 'dokan' ) }}</div>

                            <div class="profiles">
                                <a :class="{ active: isSocialActive('fb') }" :href="store.social.fb" target="_blank"><i class="fab fa-facebook-square"></i></a>
                                <a :class="{ active: isSocialActive('flickr') }" :href="store.social.flickr" target="_blank"><i class="fab fa-flickr"></i></a>
                                <a :class="{ active: isSocialActive('twitter') }" :href="store.social.twitter" target="_blank"><i class="fab fa-twitter"></i></a>
                                <a :class="{ active: isSocialActive('instagram') }" :href="store.social.instagram" target="_blank"><i class="fab fa-instagram"></i></a>
                                <a :class="{ active: isSocialActive('youtube') }" :href="store.social.youtube" target="_blank"><i class="fab fa-youtube"></i></a>
                                <a :class="{ active: isSocialActive('linkedin') }" :href="store.social.linkedin" target="_blank"><i class="fab fa-linkedin"></i></a>
                                <a :class="{ active: isSocialActive('pinterest') }" :href="store.social.pinterest" target="_blank"><i class="fab fa-pinterest-square"></i></a>
                            </div>
                        </li>
                        <li class="payments">
                            <div class="subhead">{{ __( 'Payment Methods', 'dokan' ) }}</div>

                            <div class="payment-methods">
                                <span class='payment-chip' v-if='hasPayment( "paypal" )' :class="[ hasPaymentEmail('paypal') ? 'active' : '']" v-tooltip :title="__( 'PayPal', 'dokan' )">
                                    <img src='../../../assets/images/payments/paypal.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "dokan-paypal-marketplace" )' :class="[ isActivePayment('dokan-paypal-marketplace') ? 'active' : '']" v-tooltip :title="__( 'Dokan PayPal Marketplace', 'dokan' )">
                                    <img src='../../../assets/images/payments/d-paypal.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "dokan_stripe_express" )' :class="[ isActivePayment( 'stripe_express' ) ? 'active' : '']" v-tooltip :title="__( 'Stripe Express', 'dokan' )">
                                    <img src='../../../assets/images/payments/stripe.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "dokan-stripe-connect" )' :class="[ isActivePayment('stripe') ? 'active' : '']" v-tooltip :title="__( 'Dokan Stripe Connect', 'dokan' )">
                                    <img src='../../../assets/images/payments/d-stripe.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "bank" )' :class="[isBankActive ? 'active': '' ]" v-tooltip :title="__( 'Bank Payment', 'dokan' )">
                                    <img src='../../../assets/images/payments/bank.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "skrill" )' :class="[hasPaymentEmail('skrill') ? 'active' : '' ]" v-tooltip :title="__( 'Skrill', 'dokan' )">
                                    <img src='../../../assets/images/payments/skrill.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "dokan_razorpay" )' :class="[ isActivePayment('dokan_razorpay') ? 'active' : '']" v-tooltip :title="__( 'Dokan Razorpay', 'dokan' )">
                                    <img src='../../../assets/images/payments/razorpay.svg' alt=''>
                                </span>
                                <span class='payment-chip' v-if='hasPayment( "dokan_mangopay" )' :class="[ isActivePayment('dokan_mangopay') ? 'active' : '']" v-tooltip :title="__( 'Dokan MangoPay', 'dokan' )">
                                    <img src='../../../assets/images/payments/mangopay.svg' alt=''>
                                </span>
                                <span class='dokan-custom-payment payment-chip' v-tooltip :title="__( 'Custom Payment', 'dokan' )" v-if='hasPayment( "dokan_custom" )' :class="[ isActiveCustomPayment() ? 'active' : '']">
                                    <img src='../../../assets/images/payments/payment-bag.svg' alt=''>
                                    <span>{{ custom_withdraw_method }}</span>
                                </span>
                            </div>
                        </li>
                        <li class="publishing">
                            <div class="subhead">{{ __( 'Product Publishing', 'dokan' ) }}</div>

                            <span v-if="store.trusted"><span class="dashicons dashicons-shield"></span> {{ __( 'Direct', 'dokan' ) }}</span>
                            <span v-else><span class="dashicons dashicons-backup"></span> {{ __( 'Requires Review', 'dokan' ) }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <section class="vendor-other-info" v-if="editMode">
                <div class="address-social-info">
                    <VendorAddressFields :vendorInfo="store" />
                    <VendorSocialFields :vendorInfo="store" />
                </div>
                <div class="payment-info">
                    <VendorPaymentFields :vendorInfo="store" />
                </div>
                <div class="commission-info">
                    <vendor-commission-fields :vendorInfo="store"/>
                </div>
            </section>

            <div :class="{'action-links': true, 'footer': true, 'edit-mode': editMode}">
                <template v-if="editMode">
                    <button @click="editMode = false" class="button">{{ __( 'Cancel', 'dokan' ) }}</button>
                    <button @click="updateStore" class="button button-primary">{{ saveBtn }}</button>
                </template>
            </div>

        </div>
        <vcl-twitch v-else height="300" primary="#ffffff"></vcl-twitch>
    </div>
</template>

<script>
import $ from 'jquery';
import VendorCommissionFields from "admin/components/VendorCommissionFields.vue";

let ContentLoading      = dokan_get_lib('ContentLoading');
let Modal               = dokan_get_lib('Modal');
let Currency            = dokan_get_lib('Currency');
let UploadImage         = dokan_get_lib('UploadImage');
let VendorAccountFields = dokan_get_lib('VendorAccountFields');
let VendorPaymentFields = dokan_get_lib('VendorPaymentFields');
let VendorSocialFields  = dokan_get_lib('VendorSocialFields');
let VendorAddressFields = dokan_get_lib('VendorAddressFields');
let AdminNotice         = dokan_get_lib('AdminNotice');

let VclTwitch = ContentLoading.VclTwitch;

export default {
    name: 'VendorSingle',

    components: {
      VendorCommissionFields,
        Modal,
        Currency,
        VclTwitch,
        UploadImage,
        VendorPaymentFields,
        VendorSocialFields,
        VendorAccountFields,
        VendorAddressFields,
        AdminNotice,
    },

    data () {
        return {
            showDialog: false,
            hasPro: dokan.hasPro,
            stats: null,
            mail: {
                subject: '',
                body: '',
                replyto: ''
            },
            user: {
                user_login: '',
                email: '',
                first_name: '',
                last_name: '',
                display_name: '',
            },
            editMode: false,
            isUpdating: false,
            categories: [],
            isCategoryMultiple: false,
            editingCategories: false,
            store: {
                store_name: '',
                user_pass: '',
                store_url: '',
                email: '',
                user_nicename: '',
                phone: '',
                banner: '',
                banner_id: '',
                gravatar: '',
                gravatar_id: '',
                social: {
                    fb: '',
                    youtube: '',
                    twitter: '',
                    linkedin: '',
                    pinterest: '',
                    instagram: '',
                },
                payment: {
                    bank: {
                        ac_name: '',
                        ac_type: '',
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
            fakeStore: {},
            showStoreUrl: true,
            otherStoreUrl: null,
            dokanSingleVendorSummarySectionStart: dokan.hooks.applyFilters( 'dokanSingleVendorSummarySectionStart', [] ),
            settings: {},
            custom_withdraw_method: this.__( 'Custom', 'dokan-pro' )
        };
    },

    computed: {
        id() {
            return this.$route.params.id;
        },

        mailTo() {
            return this.store.store_name + ' <' + this.store.email + '>';
        },

        replyTo() {
            this.mail.replyto = this.user.email;
            return this.user.email;
        },

        isBankActive() {
            let self = this;

            for (const tesultKey in this.settings.bank_payment_required_fields) {
                if ( _.isEmpty( self.store.payment.bank[ tesultKey ] ) ) {
                    return false;
                }
            }

            return true;
        },

        categoriesFlattened() {
            const categories = {};
            let i = 0;

            for ( i = 0; i < this.categories.length; i++ ) {
                const category = this.categories[ i ];

                categories[ category.id ] = {
                    id: category.id,
                    name: category.name,
                    slug: category.slug
                };
            }

            return categories;
        },

        getEearningRate() {
            let commissionRate = this.stats.others.commission_rate ? this.stats.others.commission_rate : 0;
            let additionalFee  = this.stats.others.additional_fee ? this.stats.others.additional_fee : 0;
            let commissionType = this.stats.others.commission_type;

            if ( '' === this.store.admin_commission ) {
                return this.__( 'Not Set', 'dokan' );
            }

            if ( commissionType === 'flat' ) {
                return accounting.formatMoney( commissionRate, dokan.currency.symbol, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal, dokan.currency.format );
            } else if ( commissionType === 'percentage' ) {
                return `${commissionRate}%`;
            } else {
                return `${(commissionRate)}% &nbsp; + ${accounting.formatMoney( additionalFee, dokan.currency.symbol, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal, dokan.currency.format )}`;
            }
        },

        saveBtn() {
            return this.isUpdating ? this.__( 'Saving...', 'dokan' ) : this.__( 'Save Changes', 'dokan' )
        },
    },

    watch: {
        '$route.params.id'() {
            this.fetch();
            this.fetchStats();
        },
    },

    created() {
        this.fetch();
        this.fetchStats();

        if ( this.$route.query.edit && this.$route.query.edit === 'true' ) {
            this.editMode = true;
        }
    },

    methods: {
        fetch() {
            const self = this;
            dokan.api.get( '/settings' )
                .done( ( settings ) => {
                    self.settings = settings;
                } );

            dokan.api.get('/stores/' + self.id )
                .done( ( response ) => {
                    Object.assign( self.fakeStore, self.store );
                    Object.assign( self.store, response );
                    self.transformer(response);
                } );

            if ( ! this.hasPro ) {
              return;
            }

            dokan.api.get( '/store-categories', {per_page: 50} )
                .done( ( response, status, xhr ) => {
                    self.categories = response;
                    self.isCategoryMultiple = ( 'multiple' === xhr.getResponseHeader( 'X-WP-Store-Category-Type' ) );
                } );

            dokan.api.get( '/stores/current-visitor' )
                .done( response => {
                    self.user = response.user;
                    self.mail.replyto = response.user.email;
                } );
        },

        // map response props to store props
        transformer(response) {
            for ( let res in response ) {

                if ( Array.isArray(response[res]) && 0 === response[res].length ) {
                    this.store[res] = this.fakeStore[res];
                }
            }

            // set default bank paymet object if it's not found in the API response
            if ( response.payment && typeof response.payment.bank === 'undefined' || typeof response.payment.bank.ac_number === 'undefined' ) {
                this.store.payment.bank = this.fakeStore.payment.bank;
            }

            // set default paypal paymet object if it's not found in the API response
            if ( response.payment && typeof response.payment.paypal === 'undefined' || typeof response.payment.paypal.email === 'undefined' ) {
                this.store.payment.paypal = this.fakeStore.payment.paypal;
            }

            if ( 'shop_url' in response ) {
                this.store.user_nicename = this.getStoreName(response.shop_url);
            }

            if ( ! response.admin_commission_type ) {
                this.store.admin_commission_type = 'flat';
            }

            this.store.admin_additional_fee = accounting.formatNumber( this.store.admin_additional_fee, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal, dokan.currency.format );

            /**
             * if admin commission type is flat and no admin commission is set then it will not not set
             *
             * if admin commission type is flat and admin commission is set to 0 then it will show 0
             *
             * blank string is for not set
             */
            if (this.store.admin_commission_type === 'flat' && this.store.admin_commission !== '') {
                this.store.admin_commission = accounting.formatNumber( this.store.admin_commission, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal, dokan.currency.format );
            }
        },

        // get sotre name from url
        getStoreName(url) {
            let storeName = url.split('/').filter((value) => {
                return value !== '';
            });

            return storeName[storeName.length - 1];
        },

        fetchStats() {
            if ( ! this.hasPro ) {
              return;
            }

            dokan.api.get('/stores/' + this.id + '/stats' )
                .done(response => this.stats = response);
        },

        isSocialActive(profile) {
            if ( this.store.social.hasOwnProperty(profile) && this.store.social[profile] !== '' ) {
                return true;
            }

            return false;
        },

        hasPaymentEmail(method) {
            if ( this.store.payment.hasOwnProperty(method) && this.store.payment[method].email !== '' ) {
                return true;
            }

            return false;
        },

        hasPayment( key ) {
            if ( ! this.settings.active_payment_methods ) {
                return false;
            }

            let activePaymentMethods = this.settings.active_payment_methods;

            return activePaymentMethods.hasOwnProperty( key );
        },

        isActivePayment( key ) {
            return this.store.payment.hasOwnProperty( key ) && this.store.payment[ key ];
        },

        isActiveCustomPayment() {
            if ( this.store.payment[ 'dokan_custom' ] && this.store.payment[ 'dokan_custom' ][ 'withdraw_method_name' ] ) {
                this.custom_withdraw_method = this.store.payment[ 'dokan_custom' ][ 'withdraw_method_name' ];
            }

            return Boolean( this.store.payment[ 'dokan_custom' ] && this.store.payment[ 'dokan_custom' ][ 'value' ] );
        },

        messageDialog() {
            this.showDialog = true;
        },

        sendEmail() {
            this.showDialog = false;

            dokan.api.post('/stores/' + this.id + '/email', {
                subject: this.mail.subject,
                body: this.mail.body,
                replyto: this.mail.replyto
            } ).done(response => {
                this.$notify({
                    title: this.__( 'Success!', 'dokan' ),
                    type: 'success',
                    text: this.__( 'Email has been sent successfully.', 'dokan' )
                });
            });

            this.mail = {
                subject: '',
                body: '',
                replyto: this.replyTo
            };
        },

        moment(date) {
            return moment(date);
        },

        productUrl() {
            return dokan.urls.adminRoot + 'edit.php?post_type=product&author=' + this.store.id;
        },

        ordersUrl() {
            return dokan.urls.adminRoot + 'edit.php?post_type=shop_order&vendor_id=' + this.store.id;
        },

        editUrl() {
            return dokan.urls.adminRoot + 'user-edit.php?user_id=' + this.store.id;
        },

        updateStore() {
            const self = this;

            self.isUpdating = true;

            console.log(self.store);

            dokan.api.put( `/stores/${self.store.id}`, self.store )
                .done( ( response ) => {
                    self.editMode = false;
                    self.store = response;
                    self.isUpdating = false;
                    self.editingCategories = false;

                    this.updateCommissonRate();

                    this.showAlert(
                        this.__( 'Vendor Updated', 'dokan' ),
                        this.__( 'Vendor Updated Successfully!', 'dokan' ),
                        'success'
                    );

                } )
                .fail((response) => {
                    this.showAlert( this.__( response.responseJSON.message, 'dokan' ), '', 'error' );
                } )
                .always( () => {
                    this.$router.push( {
                        query: {edit: false}
                    } ).catch(()=>{});
                } );
        },

        uploadGravatar( image ) {
            this.store.gravatar_id = image.id;
        },

        uploadBanner( image ) {
            this.store.banner_id = image.id
        },

        showAlert( $title, $des, $status ) {
            Swal.fire( $title, $des, $status );
        },

        getDefaultPic() {
            return dokan.urls.assetsUrl + '/images/store-pic.png';
        },

        updateCommissonRate() {
            if ( ! this.hasPro ) {
                return;
            }

            this.stats.others.commission_rate = this.store.admin_commission;
            this.stats.others.additional_fee = this.store.admin_additional_fee;
            this.stats.others.commission_type = this.store.admin_commission_type;
        },

        setStoreCategories() {
            let self = this;
            let storeCategories = $( '#store-categories' );

            storeCategories.selectWoo( {
                multiple: self.isCategoryMultiple ? true : false,
                ajax: {
                    delay: 800,
                    url: `${dokan.rest.root}dokan/v1/store-categories?per_page=50`,
                    dataType: 'json',
                    headers: {
                        "X-WP-Nonce" : dokan.rest.nonce
                    },
                    data(params) {
                        return {
                            search: params.term
                        };
                    },
                    processResults(data) {
                        return {
                            results: data.map( (cat) => {
                                return {
                                    id: cat.id,
                                    text: cat.name,
                                    slug: cat.slug
                                };
                            })
                        }
                        cache: true
                    }
                }
            } );

            self.store.categories.forEach( ( category ) => {
                let option = new Option( category.name, category.id, true, true );
                storeCategories.append( option ).trigger( 'change' );
            });

            $( '#store-categories' ).on( 'select2:select', (e) => {
                if ( self.isCategoryMultiple ) {
                    self.store.categories.push( {
                        id: e.params.data.id,
                        name: e.params.data.text,
                        slug: e.params.data.slug
                    } );
                } else {
                    self.store.categories[0] = {
                        id: e.params.data.id,
                        name: e.params.data.text,
                        slug: e.params.data.slug
                    }
                }
            } );

            $( '#store-categories' ).on( 'select2:unselect', (e) => {
                let catId = e.params.data.id;
                self.store.categories.forEach( (cat, index) => {
                    if ( parseInt( cat.id ) === parseInt( catId ) ) {
                        $( `#store-categories option[value=${catId}]` ).remove();
                        self.store.categories.splice( index, 1 );
                    }
                });
            });
        },

        async editCategory() {
            this.editingCategories = true;
            await this.$nextTick();
            this.setStoreCategories();
        },

    },
};
</script>

<style lang="less">
.dokan-vendor-single {
    .dokan-hide {
        display: none;
    }

    .vendor-profile {
        .action-links.edit-mode {
            .button span {
                line-height: 27px
            }
        }
        .action-links.footer.edit-mode {
            float: right;
            margin-top: 20px;
        }
    }

    .dokan-form-input {
        width: 100%;
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        margin-top: 6px;
        margin-bottom: 16px;
        resize: vertical;
        height: auto;
    }

    .dokan-form-input::placeholder {
        color: #bcbcbc;
    }


    * {
        box-sizing: border-box;
    }

    .modal-body {
        min-height: 150px;
        max-height: 350px;

        .form-row {
            padding-bottom: 10px;

            input {
                width: 90%;
            }
        }

        label {
            display: block;
            padding-bottom: 3px;
        }
    }

    .vendor-header {
        display: flex;

        .profile-info {
            background: #fff;
            border: 1px solid #D9E4E7;
            padding: 20px;
            width: 285px;
            margin-right: 30px;
            border-radius: 3px;
            position: relative;

            .featured-vendor {
                position: absolute;
                top: 10px;
                right: 15px;
                color: #FF9800;
            }
        }

        .profile-banner {
            position: relative;
            width: ~"calc(100% - 285px + 30px)";
            // max-width: 850px;
            height: 350px;
            border: 1px solid #dfdfdf;
            background: #496a94;
            overflow: hidden;

            img {
                height: 350px;
                width: 100%;
            }

            .action-links {
                position: absolute;
                right: 20px;
                top: 20px;

                .button {
                    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
                }

                .button.visit-store {
                    background: #0085ba;
                    border-color: #0085ba;
                    color: #fff;

                    &:hover {
                        background: #008ec2;
                        border-color: #006799;
                    }

                    .dashicons {
                        font-size: 17px;
                        margin-top: 5px;
                    }
                }

                .button.edit-store {
                    color: #B8BAC2;
                    background: #fff;
                    border-color: #fff;
                    margin-left: 5px;

                    &:hover {
                        background: #eee;
                        border-color: #eee;
                    }

                    .dashicons {
                        margin-top: 3px;
                    }
                }
            }
        }

        .profile-icon {
            position: relative;
            text-align: center;
            margin: 0 auto;

            .edit-photo {
                position: absolute;
                left: 33%;
                top: 46px;
                color: white;
                width: 80px;
                cursor: pointer;
            }

            img {
                height: 120px;
                width: 120px;
                border-radius: 50%
            }
        }

        .profile-icon.edit-mode {
            .dokan-upload-image {
                max-width: 120px;
                margin: 0 auto;

                .dokan-upload-image-container:hover img {
                    padding: 5px;
                    background-color: #f1f1f1;
                    transition: padding .2s;
                }
            }

            img {
                border: 5px solid #1a9ed4;

                cursor: pointer;
                opacity: .8;
            }
        }

        .profile-banner.edit-mode {
            cursor: pointer;

            .banner-wrap {
                display: flex;
                justify-content: center;

                img {
                    border: 5px solid #5ca9d3;
                    opacity: .5;

                    &:hover {
                        padding: 5px;
                        transition: padding .2s;
                    }
                }

                .edit-banner {
                    position: absolute;
                    left: 33%;
                    top: 50%;
                    font-size: 30px;
                    font-weight: 400;
                    color: white;

                    i.change-banner {
                        font-size: 50px;
                        margin-top: -70px;
                        position: relative;
                        left: 140px;
                    }
                }

            }
        }

        .store-info {

            .star-rating {
                text-align: center;

                span {
                    &:before {
                        content: "\f154";
                        color: #999;
                    }

                    &.active:before {
                        content: "\f155";
                        color: #FF9800;
                    }
                }
            }

            h2 {
                text-align: center;
                font-size: 2em;
                margin-bottom: .5em;
            }

            .store-details {
                color: #AEB0B3;

                .dashicons {
                    color: #BABCC3;
                }

                li {
                    margin-bottom: 8px;
                    padding-left: 30px;

                    &:before {
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        font-size: 20px;
                        line-height: 1;
                        font-family: dashicons;
                        text-decoration: inherit;
                        font-weight: 400;
                        font-style: normal;
                        vertical-align: top;
                        text-align: center;
                        transition: color .1s ease-in 0;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        margin-left: -30px;
                        width: 30px;
                    }
                }

                li.address:before {
                    content: "\f230";
                }

                li.phone {

                    &:before {
                        content: "\f525";
                        transform: scale(-1, 1);
                    }
                }
            }

            .store-details.edit-mode {
                .content-header {
                    display: none;
                }

                li {
                    padding-left: 0;
                }
            }

            .actions {
                margin-top: 25px;
                text-align: center;

                .dashicons {
                    color: #fff;
                    border-radius: 50%;
                    font-size: 16px;
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                    margin-top: -2px;
                }

                .message {
                    background: #1FB18A;
                    border-color: #1FB18A;
                    color: #fff;
                    box-shadow: none;
                    font-size: 0.9em;
                    margin-right: 7px;

                    &:hover {
                        background: darken(#1FB18A, 5%);
                        border-color: darken(#1FB18A, 5%);
                    }
                }

                .status {
                    background-color: #fff;
                    box-shadow: none;
                    font-size: 0.9em;
                    border-color: #ddd;

                    &:hover {
                        background-color: #eee;
                    }

                    &.enabled .dashicons {
                        background-color: #19c11f;

                        &:before {
                            content: "\f147";
                            margin-left: -2px;
                        }
                    }

                    &.disabled .dashicons {
                        background-color: #f44336;

                        &:before {
                            content: "\f158";
                        }
                    }
                }
            }

            a.store-categoy-names {
                text-align: center;
                font-weight: 500;
                font-size: 14px;
                margin: 8px 0 14px;
                color: #444;
                text-decoration: none;
                display: block;
                line-height: 1.6;

                &:hover {
                    color: #0073aa;
                }
            }

            .store-categories-editing {

                h4 {
                    font-size: 15px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }

                .button-link {
                    text-decoration: none;
                }
            }
        }

        .store-info.edit-mode {
            .account-info {
                .content-header {
                    display: none;
                }

                .column {
                    // display: flex;
                    label {
                        float: left;
                        clear: both;
                        margin-top: 10px;
                        margin-left: -4px;
                    }
                    .dokan-form-input {
                        width: 60%;
                        padding: 5px;
                        float: right;
                        margin-right: -4px;
                    }
                    .store-url {
                        margin: 0;
                        padding: 0;
                        bottom: 10px;
                        font-style: italic;
                        color: #a09f9f;
                        font-size: 12px;
                    }
                }
            }
        }
    }

    .vendor-summary {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;

        .summary-wrap {
            width: 72%;
            background: #fff;
            border: 1px solid #D9E4E7;
            border-radius: 3px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            margin: 0 15px;
        }

        .stat-summary {
            width: 32%;

            h3 {
                margin: 0 0 1em 0;
            }

            ul.counts {
                border: 1px solid #dfdfdf;
                margin-bottom: 0;

                li {
                    margin-bottom: 10px;
                    border-top: 1px solid #dfdfdf;
                    position: relative;
                    padding: 15px 10px 5px 75px;

                    &:first-child {
                        border-top: none;
                    }

                    .count {
                        font-size: 1.5em;
                        line-height: 130%;

                        a {
                            text-decoration: none;
                        }
                    }

                    .subhead {
                        color: #999;
                        display: block;
                        margin-top: 3px;
                    }

                    &:after {
                        display: inline-block;
                        width: 22px;
                        height: 22px;
                        font-size: 22px;
                        line-height: 1;
                        font-family: dashicons;
                        text-decoration: inherit;
                        font-weight: 400;
                        font-style: normal;
                        vertical-align: top;
                        text-align: center;
                        transition: color .1s ease-in 0;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        left: 31px;
                        top: 26px;
                        color: #fff;
                        position: absolute;
                    }

                    &:before {
                        position: absolute;
                        width: 41px;
                        height: 41px;
                        border-radius: 50%;
                        left: 20px;
                        top: 18px;
                        content: " ";
                    }

                    &.products {
                        color: #FB094C;

                        a { color: #FB094C; }
                        &:before { background-color: #FB094C; }
                        &:after {
                            font-family: WooCommerce!important;
                            content: '\e006';
                        }
                    }

                    &.items {
                        color: #2CC55E;

                        &:before { background-color: #2CC55E; }
                        &:after { content: "\f233"; }
                    }

                    &.visitors{
                        color: #0F72F9;

                        &:before { background-color: #0F72F9; }
                        &:after { content: "\f307"; }
                    }

                    &.orders {
                        color: #323ABF;

                        a { color: #323ABF; }
                        &:before { background-color: #323ABF; }
                        &:after { content: "\f174"; }
                    }

                    &.gross {
                        color: darken(#99E412, 8%);

                        &:before { background-color: #99E412; }
                        &:after { content: "\f239"; }
                    }

                    &.earning {
                        color: #8740A7;

                        &:before { background-color: #8740A7; }
                        &:after { content: "\f524"; }
                    }

                    &.commision {
                        color: #FB0A4C;

                        &:before { background-color: #FB0A4C; }
                        &:after { content: "\f524"; }
                    }

                    &.balance {
                        color: #FD553B;

                        &:before { background-color: #FD553B; }
                        &:after { content: "\f184"; }
                    }

                    &.reviews {
                        color: #EE8A12;

                        &:before { background-color: #EE8A12; }
                        &:after { content: "\f125"; }
                    }
                }
            }
        }
        .badge-info{
            background: #fff;
            border: 1px solid #D9E4E7;
            border-radius: 3px;
            width: 25%;
        }

        .vendor-info {
            background: #fff;
            border: 1px solid #D9E4E7;
            border-radius: 3px;
            padding: 20px;
            width: 27%;

            .subhead {
                color: #999;
                display: block;
                margin-bottom: 10px;
            }

            ul {
                margin: 0;
            }

            li {
                border-top: 1px solid #dfdfdf;
                padding: 10px 15px;

                &:first-child {
                    border-top: none;
                }
            }

            li.registered {
                padding-top: 15px;
            }

            .social-profiles {
                .profiles {
                    a {
                        text-decoration: none;
                        color: #ddd;
                        margin-right: 5px;
                        font-size: 21px;
                    }

                    a.active {
                        .fa-facebook-square { color: #3C5998; }
                        .fa-twitter { color: #1496F1; }
                        .fa-youtube { color: #CD2120; }
                        .fa-instagram { color: #B6224A; }
                        .fa-linkedin { color: #0C61A8; }
                        .fa-pinterest-square { color: #BD091E; }
                        .fa-flickr { color: #FB0072; }
                    }
                }
            }

            li.payments {
                .payment-methods {
                    font-size: 35px;
                    //margin-right: 8px;
                    color: #ddd;
                    display: flex;
                    flex-flow: row wrap;
                    gap: 10px;

                    .tooltip {
                        font-size: 12px;
                    }

                    .payment-chip {
                        filter: grayscale(1);
                        opacity: .5;
                        //margin-bottom: 8px;
                        display: inline-block;
                        font-size: 1em;
                    }
                    .payment-chip.active {
                        filter: grayscale(0);
                        opacity: 1;
                    }

                    .dokan-custom-payment {
                        display: flex;
                        align-items: center;
                        padding: 0 10px;
                        height: 26px;
                        background: #FFF2FF;
                        border-radius: 3px;

                        span {
                            color: #7C327C;
                            font-size: 10px;
                            font-weight: 600;
                            line-height: 14.34px;
                            margin-left: 5px;
                        }
                    }
                }
            }
        }
    }

    .vendor-other-info {
        .content-header {
            font-size: 14px !important;
            font-weight: 600 !important;
            padding-left: 12px !important;
        }

        .address-social-info {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;

            .content-header {
                font-size: 18px;
                margin: 0;
                padding: 10px;
                border-bottom: 1px solid #f1f1f1;
            }

            .social-info, .account-info {
                width: 48%;
                background-color: white;

                .content-body {
                    padding: 10px 20px;
                }
            }

            .account-info {
                .store-url {
                    margin: 0;
                    padding: 0;
                    position: relative;
                    bottom: 10px;
                    font-style: italic;
                    color: #a09f9f;
                    font-size: 12px;
                }
            }
        }

        .payment-info {
            background-color: white;
            margin-top: 30px;

            .content-header {
                font-size: 18px;
                margin: 0;
                padding: 10px;
                border-bottom: 1px solid #f1f1f1;
            }

            .content-body {
                display: flex;
                justify-content: space-between;

                .dokan-form-group {
                    width: 48%;
                    padding: 10px 20px;
                }
            }
        }

        .commission-info {
            background-color: white;
            margin-top: 30px;

            .content-header {
                font-size: 18px;
                margin: 0;
                padding: 10px;
                border-bottom: 1px solid #f1f1f1;
            }

            .content-body {
                display: flex;
                justify-content: space-between;
            }
        }

        .multiselect {
            margin-top: 5px;
        }

        .multiselect__select {
            &:before {
                top: 55%;
            }
        }

        .multiselect__tags {
            min-height: 34px;
        }

        .multiselect__single {
            font-size: 14px;
            padding-left: 0px;
            margin-bottom: 4px;
            margin-top: -2px;
        }

        .multiselect__input {
            &:focus {
                box-shadow: none;
                border: none;
                outline: none;
            }
        }

    }
}

@media only screen and (max-width: 600px) {
    .dokan-vendor-single {
        .vendor-profile {
            .vendor-header {
                display: block;

                .profile-info {
                    width: 100% !important;
                    margin-bottom: 10px;
                    padding: 0;

                    .profile-icon {
                        padding: 10px 0 20px;
                    }
                }

                .profile-banner {
                    width: 100% !important;

                    .banner-wrap {
                        .dokan-upload-image {
                            .dokan-upload-image-container {
                                span.edit-banner {
                                    width: 100%;
                                    left: 0;
                                    text-align: center;
                                }
                            }
                        }
                    }
                }
            }

            .vendor-summary {
                display: block;

                .summary-wrap {
                    display: block;
                    width: 100% !important;

                    .stat-summary {
                        width: 100% !important;
                        padding-bottom: 20px;
                    }
                }

                .vendor-info {
                    width: 100% !important;
                    margin-top: 20px;
                }
            }

            .vendor-other-info {
                .address-social-info {
                    flex-flow: column wrap;

                    .account-info {
                        width: 100%;
                        margin: 0 auto 30px;
                    }

                    .social-info {
                        width: 100%;
                        margin: 0 auto 30px;
                    }
                }

                .payment-info {
                    .content-body {
                        flex-flow: column wrap;

                        .dokan-form-group {
                            width: 100%;
                            margin: 0 auto 20px;

                            .column {
                                label {
                                    display: block;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
