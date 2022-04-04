<template>
    <div class="dokan-reverse-withdrawal-single">
        <h1 class="wp-heading-inline">
            {{ __( 'Reverse Withdrawal', 'dokan-lite') }}
            <a class="button" href="javascript:history.go(-1)">&larr; {{ __( 'Go Back', 'dokan' ) }}</a>
        </h1>
        <AdminNotice />
        <hr class="wp-header-end">

        <div class="dokan-reverse-withdrawal-fact-card">
            <CardFunFact count="1000" icon="fas fa-comments-dollar" is_currency :title="__('Total Collected', 'dokan-lite')" />
            <CardFunFact count="1000" icon="fas fa-coins" is_currency :title="__('Remaining Balance', 'dokan-lite')" />
            <CardFunFact count="1000" icon="fas fa-info"  :title="__( 'Total Transactions', 'dokan-lite' )" />
        </div>

        <div id="dokan_reverse_withdrawal_single_list_table">
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
                    <currency :amount="data.row.debit"></currency>
                </template>

                <template slot="credit" slot-scope="data">
                    <currency :amount="data.row.credit"></currency>
                </template>

                <template slot="balance" slot-scope="data">
                    <currency :amount="data.row.balance"></currency>
                </template>

                <template slot="filters">
                    <span class="form-group">
                    <multiselect
                        v-model="filter.selected_transaction_type"
                        :placeholder="this.__( 'Filter by Transaction Type', 'dokan-lite' )"
                        :options="filter.transaction_types"
                        track-by="id"
                        label="title"
                        :internal-search="false"
                        :clear-on-select="false"
                        :allow-empty="false"
                        :multiselect="false"
                        :searchable="false"
                        :showLabels="false" />
                        <button
                            v-if="filter.selected_transaction_type.id"
                            type="button"
                            class="button"
                            @click="filter.selected_transaction_type = getDefaultTransactionType()[0]"
                            style="line-height: 0; padding: 0 5px; margin-right: 5px;"
                        ><i class="dashicons dashicons-no"></i></button>
                    </span>

                    <span class="form-group">
                        <date-range-picker
                            class="mr-5"
                            ref="picker"
                            :locale-data="this.dateTimePickerFormat"
                            :singleDatePicker="false"
                            :timePicker="false"
                            :timePicker24Hour="false"
                            :showWeekNumbers="false"
                            :showDropdowns="true"
                            :autoApply="false"
                            v-model="filter.transaction_date"
                            :linkedCalendars="true"
                        >
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
                        <button
                            v-if="filter.transaction_date.startDate !== getDefaultTransactionDate().startDate && filter.transaction_date.endDate !== getDefaultTransactionDate().endDate"
                            type="button"
                            class="button"
                            @click="setDefaultTransactionDate()"
                            style="line-height: 0; padding: 0 5px; margin-right: 5px;"
                        ><i class="dashicons dashicons-no"></i></button>
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

    name: 'ReverseWithdrawalSingle',

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
            transactionData: [],
            loading: false,
            counts: {
                debit: 0,
                credit: 0,
                total_transaction: 0
            },
            dateTimePickerFormat: {
                format: dokan_get_daterange_picker_format().toLowerCase(),
                ...dokan_helper.daterange_picker_local,
            },
            totalPages: 1,
            perPage: 20,
            totalItems: 0,
            showCb: true,
            notFound: this.__( 'No transaction found.', 'dokan-lite' ),
            columns: {
                'trn_id': {
                    label: this.__( 'Transaction ID', 'dokan-lite' ),
                    sortable: true,
                },
                'trn_date': {
                    label: this.__( 'Date', 'dokan-lite' ),
                },
                'trn_type': {
                    label: this.__( 'Transaction Type', 'dokan-lite' ),
                    sortable: true,
                },
                'note': {
                    label: this.__( 'Note', 'dokan-lite' )
                },
                'debit': {
                    label: this.__( 'Debit', 'dokan-lite' ),
                    sortable: true,
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
                transaction_types:   this.getDefaultTransactionType(),
                selected_transaction_type: this.getDefaultTransactionType()[0],
                transaction_date: {
                    startDate: moment().startOf('month').format('YYYY-MM-DD 00:00:00'),
                    endDate: moment().endOf('month').format('YYYY-MM-DD 23:59:59'),
                },
            },
        }
    },

    created() {
        this.fetchTransactions();
    },

    mounted() {
        this.fetchTransactionTypes();
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
            data.from = $.datepicker.formatDate('yy-mm-dd', new Date(this.filter.transaction_date.startDate));
            data.to = $.datepicker.formatDate('yy-mm-dd', new Date(this.filter.transaction_date.endDate));
            return data;
        },

        filterTransactionType() {
            return this.filter.selected_transaction_type.id;
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

        'filter.selected_transaction_type.id'() {
            this.fetchTransactions();
        },

        'filter.transaction_date.startDate'() {
            this.fetchTransactions();
        },
    },

    methods: {
        updatedCounts( xhr ) {
            this.counts.debit  = parseInt( xhr.getResponseHeader('X-Status-Debit') ?? 0 );
            this.counts.credit = parseInt( xhr.getResponseHeader('X-Status-Credit') ?? 0 );
        },

        updatePagination(xhr) {
            this.totalPages = parseInt( xhr.getResponseHeader('X-WP-TotalPages') ?? 0 );
            this.totalItems = parseInt( xhr.getResponseHeader('X-WP-Total') ?? 0 );
        },

        resetCounts() {
            this.counts.debit  = 0;
            this.counts.credit = 0;
            this.totalPages = 0;
            this.totalItems = 0;
        },

        // clear filter
        clearFilters() {
            this.setDefaultTransactionDate();
            this.setDefaultTransactionType();
            this.fetchTransactions();
        },

        getDefaultTransactionType() {
            return [ { id: '', title: this.__( 'Transaction Type', 'dokan-lite' ) } ];
        },

        setDefaultTransactionType() {
            this.filter.selected_transaction_type = this.getDefaultTransactionType()[0];
        },

        // fetch transaction types
        fetchTransactionTypes() {
            let self = this;
            dokan.api.get('/reverse_withdrawal/transaction_types' ).done( ( response ) => {
                self.filter.transaction_types = self.getDefaultTransactionType().concat( response );
            } ).fail( ( jqXHR ) => {
                self.filter.transaction_types = self.getDefaultTransactionType();
            } );
        },

        getDefaultTransactionDate() {
            return {
                startDate: moment().startOf('month').format('YYYY-MM-DD 00:00:00'),
                endDate: moment().endOf('month').format('YYYY-MM-DD 23:59:59'),
            }
        },

        setDefaultTransactionDate() {
            this.filter.transaction_date.startDate = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
            this.filter.transaction_date.endDate   = moment().endOf('month').format('YYYY-MM-DD 23:59:59');
            this.$refs.picker.togglePicker(false);
        },

        goToPage(page) {
            this.$router.push({
                name: 'ReverseWithdrawalSingle',
                query: {
                    page: page,
                }
            });
        },

        fetchTransactions() {
            this.loading = true;
            let self = this;

            let data = {
                per_page: self.perPage,
                page: self.getCurrentPage,
                orderby: self.getSortBy,
                order: self.getSortOrder,
                vendor_id: self.ID,
                trn_date: self.filterTransactionDate,
            };
            if ( self.filterTransactionType ) {
                data.trn_type = self.filterTransactionType;
            }

            dokan.api.get('/reverse_withdrawal/transactions/' + self.ID, data).done( ( response, status, xhr ) => {
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

        doSort( column, order ) {
            this.$router.push({
                name: 'ReverseWithdrawalSingle',
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
        }
    }
};
</script>

<style lang="less">
.swal2-actions button {
    margin-right: 10px !important;
}

.dokan-reverse-withdrawal-single {
    .dokan-reverse-withdrawal-fact-card {
        margin: 0px -10px;
        display: flex;
        flex-wrap: wrap;
    }
}

#dokan_reverse_withdrawal_single_list_table {
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
}
</style>
