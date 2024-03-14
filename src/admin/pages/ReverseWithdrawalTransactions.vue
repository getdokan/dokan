<template>
    <div class="dokan-reverse-withdrawal-transactions">
        <h1 class="wp-heading-inline">
            {{ __( 'Reverse Withdrawal', 'dokan-lite') }}
            <a class="button" :href="this.reverseWithdrawalUrl()">&larr; {{ __( 'Go Back', 'dokan-lite' ) }}</a>
        </h1>

        <hr class="wp-header-end">

        <div class="dokan-reverse-withdrawal-fact-card">
            <CardFunFact icon="fas fa-user" :title="storeDetails.store_name ? storeDetails.store_name : ''" />
            <CardFunFact :count="counts.credit" icon="fas fa-comments-dollar" is_currency :title="__('Total Collected', 'dokan-lite')" />
            <CardFunFact :count="counts.balance" icon="fas fa-coins" is_currency :title="__('Remaining Balance', 'dokan-lite')" />
            <CardFunFact :count="counts.total_transactions" icon="fas fa-info"  :title="__( 'Total Transactions', 'dokan-lite' )" />
        </div>

        <div id="dokan_reverse_withdrawal_transactions_list_table">
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

                <template slot="trn_id" slot-scope="data" v-if="data.row.trn_id !== '--'">
                    <a :href="data.row.trn_url" target="_blank">{{ data.row.trn_id }}</a>
                </template>

                <template slot="trn_date" slot-scope="data">
                    {{ data.row.trn_date }}
                </template>

                <template slot="trn_type" slot-scope="data">
                    {{ data.row.trn_type }}
                </template>

                <template slot="note" slot-scope="data">
                    {{ data.row.note }}
                </template>

                <template slot="debit" slot-scope="data">
                    <div v-if="data.row.debit === ''">--</div>
                    <currency v-else-if="data.row.debit >= 0" :amount="data.row.debit"></currency>
                    <div class="negative-balance" v-else-if="data.row.debit < 0">
                        ( <currency :amount="data.row.debit * -1"></currency> )
                    </div>
                </template>

                <template slot="credit" slot-scope="data">
                    <div v-if="data.row.credit === ''">--</div>
                    <currency v-else-if="data.row.credit >= 0" :amount="data.row.credit"></currency>
                    <div class="negative-balance" v-else-if="data.row.credit < 0">
                        ( <currency :amount="data.row.credit * -1"></currency> )
                    </div>
                </template>

                <template slot="balance" slot-scope="data">
                    <div v-if="data.row.balance === ''">--</div>
                    <currency v-else-if="data.row.balance >= 0" :amount="data.row.balance"></currency>
                    <div class="negative-balance" v-else-if="data.row.balance < 0">
                        ( <currency :amount="data.row.balance * -1"></currency> )
                    </div>
                </template>

                <template slot="filters">
                    <span class="form-group">
                        <date-range-picker
                            class="mr-5"
                            ref="picker"
                            :locale-data="dateTimePickerFormat()"
                            :singleDatePicker="false"
                            :timePicker="false"
                            :timePicker24Hour="false"
                            :showWeekNumbers="false"
                            :showDropdowns="true"
                            :autoApply="false"
                            v-model="filter.transaction_date"
                            :ranges="this.dateRangePickerRanges"
                            :linkedCalendars="true"
                            opens="right">
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
                </template>
            </list-table>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import moment from "moment";

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

    name: 'ReverseWithdrawalTransactions',

    components: {
        Currency,
        ListTable,
        Multiselect,
        Debounce,
        swal,
        DateRangePicker,
        AdminNotice,
        CardFunFact
    },

    data () {
        return {
            storeDetails: {},
            transactionData: [],
            loading: false,
            clearingFilters: false,
            counts: {
                debit: 0,
                credit: 0,
                total_transaction: 0
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
            perPage: 100,
            totalItems: 0,
            showCb: true,
            notFound: this.__( 'No transaction found.', 'dokan-lite' ),
            columns: {
                'trn_id': {
                    label: this.__( 'Transaction ID', 'dokan-lite' ),
                },
                'trn_date': {
                    label: this.__( 'Date', 'dokan-lite' ),
                },
                'trn_type': {
                    label: this.__( 'Transaction Type', 'dokan-lite' ),
                },
                'note': {
                    label: this.__( 'Note', 'dokan-lite' )
                },
                'debit': {
                    label: this.__( 'Debit', 'dokan-lite' ),
                },
                'credit': {
                    label: this.__( 'Credit', 'dokan-lite' ),
                },
                'balance': {
                    label: this.__( 'Balance', 'dokan-lite' ),
                },
            },
            actions: [],
            filter: {
                transaction_date: {
                    startDate: '',
                    endDate: '',
                },
            },
        }
    },

    created() {
        this.setDefaultTransactionDate();
        this.fetchTransactions();
    },

    mounted() {
        this.fetchStoreDetails();
        this.mountToolTips();
        this.scrollToTop();
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
        ID() {
            return this.$route.params.store_id;
        },

        getCurrentPage() {
            return this.$route.query.page ? parseInt( this.$route.query.page ) : 1;
        },

        getSortBy() {
            return this.$route.query.orderby ?? 'added';
        },

        getSortOrder() {
            return this.$route.query.order ?? 'desc';
        },

        filterTransactionDate() {
            let data = {};
            if ( ! this.filter.transaction_date.startDate || ! this.filter.transaction_date.endDate ) {
                return data;
            }
            data.from = moment( new Date(this.filter.transaction_date.startDate ) ).format( 'YYYY-MM-DD HH:mm:ss' );
            data.to = moment( new Date(this.filter.transaction_date.endDate ) ).format( 'YYYY-MM-DD HH:mm:ss' );
            return data;
        },

        bulkActions() {
            return [];
        }
    },

    watch: {
        '$route.query.page'() {
            this.fetchTransactions();
        },

        '$route.query.orderby'() {
            this.fetchTransactions();
        },

        '$route.query.order'() {
            this.fetchTransactions();
        },

        'filter.transaction_date.startDate'() {
            // added this condition to avoid multiple fetchBalances call
            if ( ! this.clearingFilters && ! this.loading ) {
                this.fetchTransactions();
            }
        },
    },

    methods: {
        updatedCounts( xhr ) {
            this.counts.debit  = parseFloat( xhr.getResponseHeader('X-Status-Debit') ?? 0 );
            this.counts.credit = parseFloat( xhr.getResponseHeader('X-Status-Credit') ?? 0 );
            this.counts.balance = parseFloat( xhr.getResponseHeader('X-Status-Balance') ?? 0 );
            this.counts.total_transactions = parseInt( xhr.getResponseHeader('X-Status-Total-Transactions') ?? 0 );
        },

        updatePagination(xhr) {
            this.totalPages = parseInt( xhr.getResponseHeader('X-WP-TotalPages') ?? 0 );
            this.totalItems = parseInt( xhr.getResponseHeader('X-WP-Total') ?? 0 );
        },

        resetCounts() {
            this.counts.debit  = 0;
            this.counts.credit = 0;
            this.counts.balance = 0;
            this.counts.total_transaction = 0;
        },

        resetPagination() {
            this.totalPages = 0;
            this.totalItems = 0;
        },

        // clear filter
        clearFilters() {
            this.clearingFilters = true;
            this.setDefaultTransactionDate();
            this.fetchTransactions();
            this.clearingFilters = false;
        },

        getDefaultTransactionDate() {
            return {
                startDate: moment().subtract(29, 'days').hour(0).minute(0).second(0).toDate(),
                endDate: moment().hour(23).minute(59).second(59).toDate(),
            }
        },

        setDefaultTransactionDate() {
            let default_transaction_date = this.getDefaultTransactionDate();
            this.filter.transaction_date.startDate = default_transaction_date.startDate;
            this.filter.transaction_date.endDate   = default_transaction_date.endDate;
            if ( this.$refs.picker ) {
                this.$refs.picker.togglePicker(false);
            }
        },

        goToPage(page) {
            this.$router.push({
                name: 'ReverseWithdrawalTransactions',
                query: {
                    page: page,
                }
            });
        },

        fetchTransactions() {
            this.loading = true;
            let self = this;

            let data = {
                orderby: self.getSortBy,
                order: self.getSortOrder,
                vendor_id: self.ID,
                trn_date: self.filterTransactionDate,
                per_page: -1,
            };

            dokan.api.get('/reverse-withdrawal/transactions/', data)
            .done( ( response, status, xhr ) => {
                self.transactionData = response;
                self.updatedCounts( xhr );
                self.updatePagination( xhr );
            }).always( () => {
                self.loading = false;
            }).fail( ( jqXHR ) => {
                self.transactionData = [];
                self.resetPagination();
                let message = dokan_handle_ajax_error( jqXHR );
                if ( message ) {
                    self.showErrorAlert( message );
                }
            });
        },

        fetchStoreDetails() {
            let self = this;

            dokan.api.get('/stores/' + self.ID).done( ( response, status, xhr ) => {
                self.storeDetails = response;
            }).always( () => {

            } ).fail( ( jqXHR ) => {
                self.storeDetails = {};
                let message = dokan_handle_ajax_error( jqXHR );
                if ( message ) {
                    self.showErrorAlert( message );
                }
            } );
        },

        doSort( column, order ) {
            this.$router.push({
                name: 'ReverseWithdrawalTransactions',
                query: {
                    page: 1,
                    orderby: column,
                    order: order
                }
            });
        },

        reverseWithdrawalUrl(id) {
            return dokan.urls.adminRoot + 'admin.php?page=dokan#/reverse-withdrawal';
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

        scrollToTop() {
            window.scrollTo(0,0);
        },
    }
};
</script>

<style lang="less">
.swal2-actions button {
    margin-right: 10px !important;
}

.dokan-reverse-withdrawal-transactions {
    .dokan-reverse-withdrawal-fact-card {
        display: flex;
        flex-wrap: wrap;
    }
}

#dokan_reverse_withdrawal_transactions_list_table {
    input.multiselect__input {
        border: none;
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
