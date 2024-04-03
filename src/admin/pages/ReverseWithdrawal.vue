<template>
    <div class="dokan-reverse-withdrawal">
        <h1 class="wp-heading-inline">
            {{ __( 'Reverse Withdrawal', 'dokan-lite') }}
        </h1>
        <button @click="addNew()" class="page-title-action">{{ __( 'Add New', 'dokan-lite' ) }}</button>
        <AdminNotice />
        <hr class="wp-header-end">

        <div class="dokan-reverse-withdrawal-fact-card mt-[-20px]">
            <CardFunFact :count="counts.credit" icon="fas fa-comments-dollar" is_currency :title="__('Total Collected', 'dokan-lite')" />
            <CardFunFact :count="counts.balance" icon="fas fa-coins" is_currency :title="__('Remaining Balance', 'dokan-lite')" />
            <CardFunFact :count="counts.total_transactions" icon="fas fa-info"  :title="__( 'Total Transactions', 'dokan-lite' )" />
            <CardFunFact :count="counts.total_vendors" icon="fas fa-users" :title="__( 'Total Vendors', 'dokan-lite' )" />
        </div>

        <div id="dokan_reverse_withdrawal_list_table">
            <list-table
                :columns="columns"
                :loading="loading"
                :rows="transactionData"
                :actions="actions"
                :show-cb=false
                :total-items="totalItems"
                :bulk-actions="bulkActions"
                :total-pages="totalPages"
                :per-page="perPage"
                :current-page="getCurrentPage"
                :not-found="this.__( 'No transaction found.', 'dokan-lite' )"
                :sort-by="getSortBy"
                :sort-order="getSortOrder"
                @sort="doSort"
                @pagination="goToPage">

                <template slot="store_name" slot-scope="data">
                    <strong><a :href="'?page=dokan#/reverse-withdrawal/store/' + data.row.vendor_id">{{ data.row.store_name ? data.row.store_name : __( '(no name)', 'dokan-lite' ) }}</a></strong>
                </template>

                <template slot="balance" slot-scope="data">
                    <div v-if="data.row.balance === ''">--</div>
                    <currency v-else-if="data.row.balance >= 0" :amount="data.row.balance"></currency>
                    <div class="negative-balance" v-else-if="data.row.balance < 0">
                        ( <currency :amount="data.row.balance * -1"></currency> )
                    </div>
                </template>

                <template slot="last_payment_date" slot-scope="data">
                    {{ data.row.last_payment_date }}
                </template>

                <template slot="filters">
                    <div class="dokan-reverse-withdrawal-filters">
                        <span class="form-group">
                    <multiselect
                        @search-change="fetchStoreLists"
                        v-model="filter.selected_store"
                        :placeholder="this.__( 'Filter by store', 'dokan-lite' )"
                        :options="filter.stores"
                        track-by="id"
                        label="name"
                        :internal-search="false"
                        :clear-on-select="false"
                        :allow-empty="false"
                        :multiselect="false"
                        :searchable="true"
                        :showLabels="false" />
                        <button
                            v-if="filter.selected_store.id"
                            type="button"
                            class="button"
                            @click="filter.selected_store = getDefaultStore()[0]"
                            style="line-height: 0; padding: 0 5px; margin-right: 5px;"
                        ><i class="dashicons dashicons-no"></i></button>
                    </span>

                        <span class="form-group">
                        <date-range-picker
                            class="mr-5 ml-5"
                            ref="picker"
                            :locale-data="dateTimePickerFormat()"
                            :singleDatePicker="false"
                            :showDropdowns="true"
                            :autoApply="false"
                            :ranges="this.dateRangePickerRanges"
                            v-model="filter.transaction_date">
                            <template v-slot:input="picker">
                                <span v-if="filter.transaction_date.startDate">{{ filter.transaction_date.startDate | getFormattedDate }} - {{ filter.transaction_date.endDate | getFormattedDate }}</span>
                                <span class="date-range-placeholder" v-if="! filter.transaction_date.startDate">{{ __( 'Filter by expire date', 'dokan-lite' ) }}</span>
                            </template>

                            <!--    footer slot-->
                            <div slot="footer" slot-scope="data" class="drp-buttons">
                                <span class="drp-selected">{{ data.rangeText }}</span>
                                <button @click="setDefaultTransactionDate()" type="button" class="cancelBtn btn btn-sm btn-secondary">{{ __( 'Cancel', 'dokan-lite' ) }}</button>
                                <button @click="data.clickApply" v-if="! data.in_selection" type="button" class="applyBtn btn btn-sm btn-success">{{ __( 'Apply', 'dokan-lite' ) }}</button>
                            </div>
                        </date-range-picker>
                    </span>
                        <span class="form-group">
                        <button class="button action" v-on:click="this.clearFilters">{{ this.__( 'Clear', 'dokan-lite' ) }}</button>
                    </span>
                    </div>
                </template>
            </list-table>
        </div>

        <Transition name="animate">
            <add-reverse-withdraw v-if='loadAddNewModal' v-on:onWithdrawCreate="onCreatedReverseWithdrawal()"/>
        </Transition>
    </div>
</template>

<script>
import $ from 'jquery';
import moment from "moment";
import AddReverseWithdraw from '../components/AddReverseWithdraw.vue'

const ListTable       = dokan_get_lib('ListTable');
const Multiselect     = dokan_get_lib('Multiselect');
const Debounce        = dokan_get_lib('debounce');
const DateRangePicker = dokan_get_lib('DateRangePicker');
const AdminNotice     = dokan_get_lib('AdminNotice');
const Currency        = dokan_get_lib('Currency');
const CardFunFact     = dokan_get_lib('CardFunFact');


const swal = Swal.mixin({
    customClass: {
        confirmButton: 'button button-primary',
        cancelButton: 'button button-secondary'
    },
    buttonsStyling: false
});

export default {

    name: 'ReverseWithdrawal',

    components: {
        Currency,
        ListTable,
        Multiselect,
        Debounce,
        swal,
        DateRangePicker,
        AdminNotice,
        CardFunFact,
        AddReverseWithdraw
    },

    data () {
        return {
            loadAddNewModal: false,
            transactionData: [],
            loading: false,
            clearingFilters: false,
            counts: {
                debit: 0,
                credit: 0,
                balance: 0,
                total_transactions: 0,
                total_vendors: 0,
            },
            dateRangePickerRanges: {
                'Today': [moment().toDate(), moment().toDate()],
                'Last 30 Days': [moment().subtract(29, 'days').toDate(), moment().toDate()],
                'This Month': [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
                'Last Month': [moment().subtract(1, 'month').startOf('month').toDate(), moment().subtract(1, 'month').endOf('month').toDate()],
                'This Year': [moment().month(0).startOf('month').toDate(), moment().month(11).endOf('month').toDate()],
                'Last Year': [moment().month(0).subtract(1, 'year').startOf('month').toDate(), moment().month(11).subtract(1, 'year').endOf('month').toDate()]
            },
            totalPages: 1,
            perPage: 20,
            totalItems: 0,
            showCb: true,
            notFound: this.__( 'No transaction found.', 'dokan-lite' ),
            columns: {
                'store_name': {
                    label: this.__( 'Stores', 'dokan-lite' ),
                },
                'balance': {
                    label: this.__( 'Balance', 'dokan-lite' ),
                },
                'last_payment_date': {
                    label: this.__( 'Last Payment Date', 'dokan-lite' ),
                },
            },
            actions: [],
            filter: {
                stores: this.getDefaultStore(),
                selected_store: this.getDefaultStore()[0],
                transaction_date: {
                    startDate: '',
                    endDate: '',
                },
            }
        }
    },

    created() {
        this.setDefaultTransactionDate();
        this.fetchStoreLists();
        this.fetchBalances();

        // close modal
        this.$root.$on('modalClosed', () => {
            this.loadAddNewModal = false;
        } );
    },

    mounted() {
        this.mountToolTips();
    },

    updated() {
        this.mountToolTips();
    },

    filters: {
        getFormattedDate(date) {
            return date ? $.datepicker.formatDate(dokan_get_i18n_date_format(), new Date(date)) : '';
        },
    },

    computed: {
        getCurrentPage() {
            return this.$route.query.page ? parseInt( this.$route.query.page ) : 1;
        },

        getSortBy() {
            return this.$route.query.orderby ?? 'added';
        },

        getSortOrder() {
            return this.$route.query.order ?? 'desc';
        },

        filterStoreID() {
            return this.filter.selected_store ? this.filter.selected_store.id : 0;
        },

        filterTransactionDate() {
            let data = {
                from: '',
                to: '',
            };
            if ( ! this.filter.transaction_date.startDate || ! this.filter.transaction_date.endDate ) {
                return data;
            }
            data.from = moment( this.filter.transaction_date.startDate ).format( 'YYYY-MM-DD HH:mm:ss' );
            data.to = moment( this.filter.transaction_date.endDate ).format( 'YYYY-MM-DD HH:mm:ss' );
            // fix from param
            if ( data.from === data.to ) {
                data.from = '';
            }
            return data;
        },

        bulkActions() {
            return [];
        },
    },

    watch: {
        '$route.query.page'() {
            this.fetchBalances();
        },

        '$route.query.orderby'() {
            this.fetchBalances();
        },

        '$route.query.order'() {
            this.fetchBalances();
        },

        'filter.selected_store'() {
            // added this condition to avoid multiple fetchBalances call
            if ( ! this.clearingFilters && ! this.loading ) {
                this.fetchBalances();
            }
        },

        'filter.transaction_date.startDate'() {
            // added this condition to avoid multiple fetchBalances call
            if ( ! this.clearingFilters && ! this.loading ) {
                this.fetchBalances();
            }
        },
    },

    methods: {
        addNew() {
            this.loadAddNewModal = true;
        },

        updatedCounts( xhr ) {
            this.counts.debit  = parseFloat( xhr.getResponseHeader('X-Status-Debit') ?? 0 );
            this.counts.credit = parseFloat( xhr.getResponseHeader('X-Status-Credit') ?? 0 );
            this.counts.balance = parseFloat( xhr.getResponseHeader('X-Status-Balance') ?? 0 );
            this.counts.total_transactions = parseInt( xhr.getResponseHeader('X-Status-Total-Transactions') ?? 0 );
            this.counts.total_vendors = parseInt( xhr.getResponseHeader('X-Status-Total-Vendors') ?? 0 );
        },

        updatePagination(xhr) {
            this.totalPages = parseInt( xhr.getResponseHeader('X-WP-TotalPages') ?? 0 );
            this.totalItems = parseInt( xhr.getResponseHeader('X-WP-Total') ?? 0 );
        },

        resetCounts() {
            this.counts.debit  = 0;
            this.counts.credit = 0;
            this.counts.balance = 0;
            this.counts.total_transactions = 0;
            this.counts.total_vendors = 0;
            this.totalPages = 0;
            this.totalItems = 0;
        },

        // clear filter
        clearFilters() {
            this.clearingFilters = true;
            this.filter.selected_store = this.getDefaultStore()[0];
            this.setDefaultTransactionDate();
            this.clearingFilters = false;
            this.fetchBalances();
        },

        getDefaultStore() {
            return [ { id: 0, name: this.__( 'All Stores', 'dokan-lite' ) } ];
        },

        // filter by stores
        fetchStoreLists: Debounce( function( search = '' ) {
            let self = this;
            dokan.api.get('/reverse-withdrawal/stores', {
                paged: 1,
                search: search
            } ).done( ( response ) => {
                self.filter.stores = self.getDefaultStore().concat( response );
            } ).fail( ( jqXHR ) => {
                self.filter.stores = self.getDefaultStore();
            } );
        }, 300 ),

        getDefaultTransactionDate() {
            let today = moment().endOf('today').hour(23).minute(59).second(59).toDate();
            return {
                startDate: today,
                endDate: today,
            }
        },

        setDefaultTransactionDate() {
            let transaction_date = this.getDefaultTransactionDate();
            this.filter.transaction_date.startDate = transaction_date.startDate;
            this.filter.transaction_date.endDate   = transaction_date.endDate;
            if ( this.$refs.picker ) {
                this.$refs.picker.togglePicker(false);
            }
        },

        fetchBalances() {
            this.loading = true;
            let self = this;

            let data = {
                per_page: self.perPage,
                page: self.getCurrentPage,
                orderby: self.getSortBy,
                order: self.getSortOrder,
                trn_date: self.filterTransactionDate,
            };

            if ( self.filterStoreID ) {
                data.vendor_id = self.filterStoreID;
            }

            dokan.api.get('/reverse-withdrawal/stores-balance', data).done( ( response, status, xhr ) => {
                self.transactionData = response;
                self.updatedCounts( xhr );
                self.updatePagination( xhr );
            }).always( () => {
                self.loading = false;
            } ).fail( ( jqXHR ) => {
                self.transactionData = [];
                self.resetCounts();
                let message = self.renderApiError( jqXHR );
                if ( message ) {
                    self.showErrorAlert( message );
                }
            } );
        },

        goToPage(page) {
            this.$router.push({
                name: 'ReverseWithdrawal',
                query: {
                    page: page,
                }
            });
        },

        doSort( column, order ) {
            this.$router.push({
                name: 'ReverseWithdrawal',
                query: {
                    page: 1,
                    orderby: column,
                    order: order
                }
            });
        },

        orderUrl(id) {
            return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
        },

        vendorUrl(id) {
            return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/'+ id;
        },

        productUrl(id) {
            return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
        },

        mountToolTips() {
            $('.tips').tooltip();
        },

        moment(date) {
            return moment(date);
        },

        showErrorAlert( message ) {
            let self = this;
            swal.fire(
                self.__( 'Something went wrong', 'dokan-lite' ),
                message,
                'error'
            );
        },

        renderApiError( jqXHR ) {
            let message = '';
            if ( jqXHR.responseJSON && jqXHR.responseJSON.message ) {
                message = jqXHR.responseJSON.message;
            } else if ( jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message ) {
                message = jqXHR.responseJSON.data.message;
            } else if( jqXHR.responseText ) {
                message = jqXHR.responseText;
            }
            return message;
        },

        onCreatedReverseWithdrawal() {
            this.fetchStoreLists();
            this.fetchBalances();
        },
    }
};
</script>

<style lang="less">

.animate-enter-active {
    animation: animate 150ms;
}
.animate-leave-active {
    animation: animate 150ms reverse;
}
@keyframes animate {
    0% {
        opacity: 0;
    }
    50% {
        opacity: .5;
    }
    100% {
        opacity: 1;
    }
}



.swal2-actions button {
    margin-right: 10px !important;
}

.dokan-reverse-withdrawal {
    .dokan-reverse-withdrawal-fact-card {
        display: flex;
        flex-wrap: wrap;
    }
}

#dokan_reverse_withdrawal_list_table {
    .dokan-reverse-withdrawal-filters {
        display: flex;

        .multiselect {
            .multiselect__select {
                height: 28px;
            }

            .multiselect__tags {
                input.multiselect__input {
                    max-height: 28px;
                }

                span.multiselect__single {
                    margin: 0 auto;
                    min-height: 28px;
                    line-height: 28px;
                }
            }
        }
    }
}

@media only screen and (max-width: 500px) {
    #dokan_reverse_withdrawal_list_table .dokan-reverse-withdrawal-filters {
        flex-direction: column;
    }
}

#dokan_reverse_withdrawal_list_table {
    input.multiselect__input {
        border: none;
    }

    .label {
        display: inline-block;
        padding: 0px 6px;
        color: #fff;
        font-size: 10px;
        font-weight: bold;
        border-radius: 10px;
    }

    .expired {
        background-color: #5cb85c;
    }

    .not_published {
        background-color: #fb7369;
    }

    .search-by-product {
        display: inline;
        margin-left: 5px;

        .search-box #post-search-input {
            border-radius: 3px;
            border: 1px solid #aaaaaa;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-left: 8px !important;
        }

        .search-box #post-search-input::placeholder {
            color: #999 !important;
        }
    }

    div.actions {
        display: flex;
    }
    .multiselect {
        display: inline-block !important;
        width: 250px !important;
        font-size: 12px !important;
        .multiselect__tags {
            font-size: 12px !important;
            min-height: 30px !important;
            max-height: 33px !important;
            padding-top: 0px !important;
        }

        .multiselect__input {
            border: none;
            box-shadow: none;
            &:focus {
                border: none;
                box-shadow: none;
                outline: none;
            }
        }
    }

    //fix column size for subscription table
    .widefat .store {
        width: 15em;
    }

    .widefat .product_title {
        width: 20em;
    }

    //fix negative balance display issue
    .negative-balance>div {
        display: inline;
    }
}
</style>
