<template>
    <div>
        <div class="withdraw-requests">
            <h1>{{ __( 'Withdraw Requests', 'dokan-lite' ) }}</h1>
            <AdminNotice></AdminNotice>
            <UpgradeBanner v-if="! hasPro"></UpgradeBanner>

            <modal
                :title="__( 'Update Note', 'dokan-lite' )"
                v-if="showModal"
                @close="showModal = false"
            >
                <template slot="body">
                    <textarea class='p-2' v-model="editing.note" rows="3"></textarea>
                </template>

                <template slot="footer">
                    <button class="button button-primary button-large" @click="updateNote()">{{ __( 'Update Note', 'dokan-lite' ) }}</button>
                </template>
            </modal>

            <ul class="subsubsub">
                <li><router-link :class="{current: currentStatus === 'pending'}" :to="{ name: 'Withdraw', query: { status: 'pending' }}" >{{ __( 'Pending', 'dokan-lite' ) }} <span class="count">{{ counts.pending }}</span></router-link> | </li>
                <li><router-link :class="{current: currentStatus === 'approved'}" :to="{ name: 'Withdraw', query: { status: 'approved' }}">{{ __( 'Approved', 'dokan-lite' ) }} <span class="count">{{ counts.approved }}</span></router-link> | </li>
                <li><router-link :class="{current: currentStatus === 'cancelled'}" :to="{ name: 'Withdraw', query: { status: 'cancelled' }}" >{{ __( 'Cancelled', 'dokan-lite' ) }} <span class="count">{{ counts.cancelled }}</span></router-link> | </li>
            </ul>

            <list-table
                :columns="columns"
                :rows="requests"
                :loading="loading"
                :action-column="actionColumn"
                :actions="actions"
                :show-cb="showCb"
                :bulk-actions="bulkActions"
                :not-found="notFound"
                :total-pages="totalPages"
                :total-items="totalItems"
                :per-page="perPage"
                :current-page="currentPage"
                :text="$root.listTableTexts()"
                @pagination="goToPage"
                @action:click="onActionClick"
                @bulk:click="onBulkAction"
            >
                <template slot="seller" slot-scope="data">
                    <img :src="data.row.user.gravatar" :alt="data.row.user.store_name" width="50">
                    <strong><a :href="vendorUrl(data.row.user.id)">{{ data.row.user.store_name ? data.row.user.store_name : __( '(no name)', 'dokan-lite' ) }}</a></strong>
                </template>

                <template slot="vendor" slot-scope="{ row }">
                    <router-link :to="'/vendors/' + row.vendor.id">
                        {{ row.vendor.name ? row.vendor.name : __('(no name)', 'dokan-lite') }}
                    </router-link>
                </template>

                <template slot="amount" slot-scope="data">
                    <currency :amount="data.row.amount"></currency>
                </template>

                <template slot="status" slot-scope="data">
                    <span :class="data.row.status">{{ data.row.status | capitalize }}</span>
                </template>

                <template slot="created" slot-scope="data">
                    {{ moment(data.row.created).format('MMM D, YYYY') }}
                </template>

                <template slot="method_title" slot-scope="data">
                    <div class="method_title_inner" v-html="getPaymentTitle(data.row.method, data.row)"></div>
                </template>

                <template slot="charge" slot-scope="data">
                    <currency :amount="data.row.charge"></currency>
                </template>

                <template slot="payable" slot-scope="data">
                    <currency :amount="data.row.receivable"></currency>
                </template>

                <template slot="method_details" slot-scope="data">
                    <div class="method_details_inner" v-html="getPaymentDetails(data.row.method, data.row.details)"></div>
                </template>

                <template slot="filters">
                    <select
                        id="filter-vendors"
                        style="width: 190px;"
                        :data-placeholder="__( 'Filter by Vendor', 'dokan-lite' )"
                    />

                    <select
                        id="filter-payment-methods"
                        :data-placeholder="__( 'Filter by Payment Methods', 'dokan-lite' )"
                    />

                    <date-range-picker
                        class="mr-5"
                        ref="picker"
                        :locale-data="this.dateTimePickerFormat"
                        :singleDatePicker="false"
                        :showDropdowns="true"
                        :autoApply="false"
                        :ranges="this.dateRangePickerRanges"
                        v-model="filter.transaction_date">

                        <!--    Date Selection Slot-->
                        <template v-slot:input="picker">
                            <span v-if="filter.transaction_date.startDate">{{ filter.transaction_date.startDate | getFormattedDate }} - {{ filter.transaction_date.endDate | getFormattedDate }}</span>
                            <span class="date-range-placeholder" v-if="! filter.transaction_date.startDate">{{ __( 'Filter by Date', 'dokan-lite' ) }}</span>
                        </template>

                        <!--    Footer Slot-->
                        <div slot="footer" slot-scope="data" class="drp-buttons">
                            <span class="drp-selected">{{ data.rangeText }}</span>
                            <button @click="setDefaultTransactionDate()" type="button" class="cancelBtn btn btn-sm btn-secondary">{{ __( 'Cancel', 'dokan-lite' ) }}</button>
                            <button @click="data.clickApply" v-if="! data.in_selection" type="button" class="applyBtn btn btn-sm btn-success">{{ __( 'Apply', 'dokan-lite' ) }}</button>
                        </div>
                    </date-range-picker>

                    <a @click="clearAllFiltering()" id="clear-all-filtering" class="button router-link-active">
                        {{ __( 'Clear', 'dokan-lite' ) }}
                    </a>

                    <a @click="exportAllLogs()" id="export-all-logs" class="button router-link-active">
                        {{ __( 'Export', 'dokan-lite' ) }}
                    </a>
                </template>

                <template slot="actions" slot-scope="data">
                    <template v-if="data.row.status === 'pending'">
                        <div class="button-group">
                            <button class="button button-small" @click.prevent="changeStatus('approved', data.row.id)" :title="__( 'Approve Request', 'dokan-lite' )"><span class="dashicons dashicons-yes"></span></button>
                            <button class="button button-small" @click.prevent="openNoteModal(data.row.note, data.row.id)" :title="__( 'Add Note', 'dokan-lite' )"><span class="dashicons dashicons-testimonial"></span></button>
                        </div>
                    </template>
                    <template v-else-if="data.row.status === 'approved'">
                        <div class="button-group">
                            <button class="button button-small" @click.prevent="openNoteModal(data.row.note, data.row.id)" :title="__( 'Add Note', 'dokan-lite' )"><span class="dashicons dashicons-testimonial"></span></button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="button-group">
                            <button class="button button-small" @click.prevent="changeStatus('pending', data.row.id)" :title="__( 'Mark as Pending', 'dokan-lite' )"><span class="dashicons dashicons-backup"></span></button>
                            <button class="button button-small" @click.prevent="openNoteModal(data.row.note, data.row.id)" :title="__( 'Add Note', 'dokan-lite' )"><span class="dashicons dashicons-testimonial"></span></button>
                        </div>
                    </template>
                </template>
            </list-table>
        </div>
    </div>
</template>

<script>
import moment from 'moment/moment';

let ListTable         = dokan_get_lib('ListTable');
let Modal             = dokan_get_lib('Modal');
let Currency          = dokan_get_lib('Currency');
let AdminNotice       = dokan_get_lib('AdminNotice');
const DateRangePicker = dokan_get_lib('DateRangePicker');

import $ from 'jquery';
import UpgradeBanner from "admin/components/UpgradeBanner.vue";

export default {

    name: 'Withdraw',

    components: {
        ListTable,
        Modal,
        Currency,
        UpgradeBanner,
        AdminNotice,
        DateRangePicker,
    },

    data () {
        return {
            showModal: false,
            editing: {
                id: null,
                note: null
            },
            dateTimePickerFormat: {
                format: dokan_get_daterange_picker_format().toLowerCase(),
                ...dokan_helper.daterange_picker_local,
            },
            dateRangePickerRanges: {
                'Today': [moment().toDate(), moment().toDate()],
                'Last 30 Days': [moment().subtract(29, 'days').toDate(), moment().toDate()],
                'This Month': [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
                'Last Month': [moment().subtract(1, 'month').startOf('month').toDate(), moment().subtract(1, 'month').endOf('month').toDate()],
                'This Year': [moment().month(0).startOf('month').toDate(), moment().month(11).endOf('month').toDate()],
                'Last Year': [moment().month(0).subtract(1, 'year').startOf('month').toDate(), moment().month(11).subtract(1, 'year').endOf('month').toDate()]
            },
            progressbar: {
                value: 0,
                isActive: false,
            },
            paymentMethods: [],
            totalPages: 1,
            perPage: 10,
            totalItems: 0,
            filter: {
                user_id: 0,
                payment_method: {
                    id: '',
                    title: '',
                },
                transaction_date: {
                    startDate: '',
                    endDate: '',
                }
            },
            counts: {
                pending: 0,
                approved: 0,
                cancelled: 0
            },
            notFound: this.__( 'No requests found.', 'dokan-lite' ),
            massPayment: this.__( 'Paypal Mass Payment File is Generated.', 'dokan-lite' ),
            showCb: true,
            loading: false,
            columns: {
                'seller': { label: this.__( 'Vendor', 'dokan-lite' ) },
                'amount': { label: this.__( 'Amount', 'dokan-lite' ) },
                'status': { label: this.__( 'Status', 'dokan-lite' ) },
                'method_title': { label: this.__( 'Method', 'dokan-lite' ) },
                'charge': { label: this.__( 'Charge', 'dokan-lite' ) },
                'payable': { label: this.__( 'Payable', 'dokan-lite' ) },
                'method_details': { label: this.__( 'Details', 'dokan-lite' ) },
                'note': { label: this.__( 'Note', 'dokan-lite' ) },
                'created': { label: this.__( 'Date', 'dokan-lite' ) },
                'actions': { label: this.__( 'Actions', 'dokan-lite' ) },
            },
            requests: [],
            actionColumn: 'seller',
            hasPro: dokan.hasPro ? true : false
        };
    },

    watch: {
        '$route.query.status'() {
            this.fetchRequests();
        },

        '$route.query.page'() {
            this.fetchRequests();
        },

        '$route.query.user_id'() {
            this.fetchRequests();
        },

        '$route.query.payment_method'() {
            this.fetchRequests();
        },

        'filter.user_id'(user_id) {
            if (user_id === 0) {
                this.clearSelection('#filter-vendors');
            }

            this.goTo(this.query);
        },

        'filter.payment_method.id'( id ) {
            if ( ! id ) {
                this.clearSelection( '#filter-payment-methods' );
            }

            this.goTo( this.query );
        },

        'filter.transaction_date.startDate'() {
            this.fetchRequests();
        }
    },

    computed: {

        currentStatus() {
            return this.$route.query.status || 'pending';
        },

        currentPage() {
            let page = this.$route.query.page || 1;

            return parseInt( page );
        },

        actions() {
            if ( 'pending' == this.currentStatus ) {
                return [
                    {
                        key: 'trash',
                        label: this.__( 'Delete', 'dokan-lite' )
                    },
                    {
                        key: 'cancel',
                        label: this.__( 'Cancel', 'dokan-lite' )
                    }
                ];
            } else if ( 'cancelled' == this.currentStatus ) {
                return [
                    {
                        key: 'trash',
                        label: this.__( 'Delete', 'dokan-lite' )
                    },
                    {
                        key: 'pending',
                        label: this.__( 'Pending', 'dokan-lite' )
                    }
                ];
            } else {
                return [];
            }
        },

        bulkActions() {
            if ( 'pending' == this.currentStatus ) {
                return [
                    {
                        key: 'approved',
                        label: this.__( 'Approve', 'dokan-lite' )
                    },
                    {
                        key: 'cancelled',
                        label: this.__( 'Cancel', 'dokan-lite' )
                    },
                    {
                        key: 'delete',
                        label: this.__( 'Delete', 'dokan-lite' )
                    },
                    {
                        key: 'paypal',
                        label: this.__( 'Download PayPal mass payment file', 'dokan-lite' )
                    },
                ];
            } else if ( 'cancelled' == this.currentStatus ) {
                return [
                    {
                        key: 'pending',
                        label: this.__( 'Pending', 'dokan-lite' )
                    },
                    {
                        key: 'delete',
                        label: this.__( 'Delete', 'dokan-lite' )
                    },
                    {
                        key: 'paypal',
                        label: this.__( 'Download PayPal mass payment file', 'dokan-lite' )
                    },
                ];
            } else {
                return [
                    {
                        key: 'paypal',
                        label: this.__( 'Download PayPal mass payment file', 'dokan-lite' )
                    },
                ];
            }
        },

        filterTransactionDate() {
            let data = {
                start_date: '',
                end_date: '',
            };

            if ( ! this.filter.transaction_date.startDate || ! this.filter.transaction_date.endDate ) {
                return data;
            }

            data.start_date = moment( this.filter.transaction_date.startDate ).format( 'YYYY-MM-DD HH:mm:ss' );
            data.end_date   = moment( this.filter.transaction_date.endDate ).format( 'YYYY-MM-DD HH:mm:ss' );

            return data;
        }
    },

    created() {
        this.fetchRequests();
    },

    mounted() {
        const self = this;

        self.getPaymentMethodSelector();

        $('#filter-vendors').selectWoo({
            ajax: {
                url: "".concat(dokan.rest.root, "dokan/v1/stores"),
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
                        results: data.map((store) => {
                            return {
                                id: store.id,
                                text: store.store_name
                            };
                        })
                    };
                }
            }
        });

        $('#filter-vendors').on('select2:select', (e) => {
            self.filter.user_id = e.params.data.id;
        });

        $( '#filter-payment-methods' ).on( 'select2:select', ( e ) => {
            self.filter.payment_method.id    = e.params.data.id;
            self.filter.payment_method.title = e.params.data.text;
        } );

        $( '#filter-payment-methods' ).on( 'select2:clear', ( e ) => {
            self.filter.payment_method.id = "";
        } );
    },

    filters: {
        getFormattedDate( date ) {
            return date ? $.datepicker.formatDate( dokan_get_i18n_date_format(), new Date( date ) ) : '';
        }
    },

    methods: {
        async getPaymentMethodSelector() {
            await dokan.api.get( '/withdraw/payment_methods' )
                .done( ( response ) => {
                    this.paymentMethods = [ { id: '', text: '' } ].concat( response.map( payment_method => {
                        return {
                            id: payment_method.id,
                            text: payment_method.title
                        }
                    } ) );

                    jQuery( '#filter-payment-methods' ).select2( {
                        data: this.paymentMethods,
                    } ).val( this.filter.payment_method ).trigger( 'change' );
                } ).fail( ( jqXHR ) => {
                    this.paymentMethods = [ { id: '', text: '' } ];
                    let message = dokan_handle_ajax_error( jqXHR );

                    if ( message ) {
                        this.showErrorAlert( message );
                    }
                } );
        },

        updatedCounts(xhr) {
            this.counts.pending   = parseInt( xhr.getResponseHeader('X-Status-Pending') );
            this.counts.approved  = parseInt( xhr.getResponseHeader('X-Status-Completed') );
            this.counts.cancelled = parseInt( xhr.getResponseHeader('X-Status-Cancelled') );
        },

        updatePagination(xhr) {
            this.totalPages = parseInt( xhr.getResponseHeader('X-WP-TotalPages') );
            this.totalItems = parseInt( xhr.getResponseHeader('X-WP-Total') );
        },

        vendorUrl(id) {
            if ( window.dokan.hasPro === '1' ) {
                return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/' + id;
            }

            return dokan.urls.adminRoot + 'user-edit.php?user_id=' + id;
        },

        getDefaultTransactionDate() {
            return {
                startDate: '',
                endDate: '',
            }
        },

        setDefaultTransactionDate() {
            let transaction_date = this.getDefaultTransactionDate();

            this.filter.transaction_date.startDate = transaction_date.startDate;
            this.filter.transaction_date.endDate   = transaction_date.endDate;

            if ( this.$refs.picker ) {
                this.$refs.picker.togglePicker( false );
            }
        },

        fetchRequests() {
            this.loading       = true;
            let user_id        = '';
            let payment_method = '';

            if (parseInt(this.filter.user_id) > 0) {
                user_id = this.filter.user_id;
            }

            if ( this.filter.payment_method.id ) {
                payment_method = this.filter.payment_method.id;
            }

            const data = {
                per_page: this.perPage,
                page: this.currentPage,
                status: this.currentStatus,
                user_id: user_id,
                payment_method: payment_method,
                start_date: this.filterTransactionDate.start_date,
                end_date: this.filterTransactionDate.end_date
            };
            dokan.api.get('/withdraw', data)
            .done((response, status, xhr) => {
                this.requests = response;
                this.loading = false;

                this.updatedCounts(xhr);
                this.updatePagination(xhr);
            });
        },

        goToPage(page) {
            this.$router.push({
                name: 'Withdraw',
                query: {
                    status: this.currentStatus,
                    user_id: this.filter.user_id,
                    payment_method: this.filter.payment_method.id,
                    page: page
                }
            });
        },

        goTo(page) {
            this.$router.push({
                name: 'Withdraw',
                query: {
                    status: this.currentStatus,
                    user_id: this.filter.user_id,
                    payment_method: this.filter.payment_method.id
                }
            });
        },

        updateItem(id, value) {
            let index = this.requests.findIndex(x => x.id == id);

            this.$set(this.requests, index, value);
        },

        changeStatus(status, id) {
            this.loading = true;

            dokan.api.put('/withdraw/' + id, { status: status })
            .done(response => {
                this.fetchRequests();
            }).catch( (response, status, xhr) => {
                let message = dokan_handle_ajax_error(response);

                dokan_sweetalert(
                    '',
                    {
                        toast: true,
                        icon: 'error',
                        title: message,
                        position: 'bottom-right',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: ( toast ) => {
                            toast.addEventListener( 'mouseenter', Swal.stopTimer )
                            toast.addEventListener( 'mouseleave', Swal.resumeTimer )
                        }
                    }
                );
            } ).always( () => {
                this.loading = false;
            } );
        },

        onActionClick(action, row) {
            if ( 'cancel' === action ) {
                this.changeStatus('cancelled', row.id);
            }

            if ( 'pending' === action ) {
                this.changeStatus('pending', row.id);
            }

            if ( 'trash' === action ) {
                if ( confirm( this.__( 'Are you sure?', 'dokan-lite' ) ) ) {
                    this.loading = true;

                    dokan.api.delete('/withdraw/' + row.id)
                    .done(response => {
                        this.loading = false;
                        this.fetchRequests();
                    });
                }
            }
        },

        getPaymentTitle(method, data) {
            let title = data.method_title;

            if ( data.details[method] !== undefined && 'dokan_custom' === method  ) {
                title = data.details[method].method ?? '';
            }

            return dokan.hooks.applyFilters( 'dokan_get_payment_title', title, method, data );
        },

        getPaymentDetails(method, data) {
            let details = '—';

            if ( data[method] !== undefined ) {
                if ( 'paypal' === method || 'skrill' === method ) {
                    details = data[method].email || '';

                } else if ( 'bank' === method ) {
                    if ( data.bank.hasOwnProperty('ac_name') ) {
                        details = '<p>' + this.sprintf( this.__( 'Account Name: %s', 'dokan-lite' ), data.bank.ac_name ) + '</p>';
                    }

                    if ( data.bank.hasOwnProperty('ac_number') ) {
                        details += '<p>' + this.sprintf( this.__( 'Account Number: %s', 'dokan-lite' ), data.bank.ac_number ) + '</p>';
                    }

                    if ( data.bank.hasOwnProperty('bank_name') ) {
                        details += '<p>' + this.sprintf( this.__( 'Bank Name: %s', 'dokan-lite' ), data.bank.bank_name ) + '</p>';
                    }

                    if ( data.bank.hasOwnProperty('iban') ) {
                        details += '<p>' + this.sprintf( this.__( 'IBAN: %s', 'dokan-lite' ), data.bank.iban ) + '</p>';
                    }

                    if ( data.bank.hasOwnProperty('routing_number') ) {
                        details += '<p>' + this.sprintf( this.__( 'Routing Number: %s', 'dokan-lite' ), data.bank.routing_number ) + '</p>';
                    }

                    if ( data.bank.hasOwnProperty('swift') ) {
                        details += '<p>' + this.sprintf( this.__( 'Swift Code: %s', 'dokan-lite' ), data.bank.swift ) + '</p>';
                    }
                } else if ( 'dokan_custom' === method ) {
                    details = data[method].value ?? '';
                }
            }

            return dokan.hooks.applyFilters( 'dokan_get_payment_details', details, method, data );
        },

        recursiveWriteLogsToFile( page = 1 ) {
            this.loading = true;
            let self     = this;
            let user_id  = '';

            if ( parseInt( this.filter.user_id ) > 0 ) {
                user_id = this.filter.user_id;
            }

            const args = {
                is_export: true,
                per_page: self.perPage,
                page: self.currentPage,
                status: self.currentStatus,
                user_id: user_id,
                payment_method: self.paymentMethods.id,
                start_date: self.filterTransactionDate.start_date,
                end_date: self.filterTransactionDate.end_date
            };

            dokan.api.get( '/withdraw', args )
                .done( ( response ) => {
                    if ( ! response.percentage ) {
                        self.loading              = false;
                        self.progressbar.isActive = false;

                        return;
                    }

                    self.progressbar.value = response.percentage;

                    if ( response.percentage >= 100 ) {
                        this.loading              = false;
                        this.progressbar.isActive = false;

                        // Redirect to the response URL.
                        window.location.assign( response.url );
                    } else {
                        // Run recursive logs to file method again.
                        self.recursiveWriteLogsToFile( response.step );
                    }
                } ).fail( ( jqXHR ) => {
                    self.loading              = false;
                    self.progressbar.isActive = false;
                } );
        },

        clearAllFiltering() {
            this.filter.user_id                    = 0;
            this.filter.payment_method.id          = '';
            this.filter.payment_method.title       = '';
            this.filter.transaction_date.startDate = '';
            this.filter.transaction_date.endDate   = '';
        },

        exportAllLogs() {
            this.progressbar.value = 0;

            this.recursiveWriteLogsToFile( 1 );
        },

        moment(date) {
            return moment(date);
        },

        onBulkAction(action, items) {
            let self = this;

            if ( _.contains(['delete', 'approved', 'cancelled', 'pending'], action) ) {

                let jsonData = {};
                jsonData[action] = items;

                this.loading = true;

                dokan.api.put('/withdraw/batch', jsonData)
                .done(response => {
                    this.loading = false;
                    this.fetchRequests();
                });
            }

            if ( 'paypal' === action ) {
                let ids = items.join(",");

                jQuery.post(ajaxurl, {
                    'dokan_withdraw_bulk': 'paypal',
                    'id': ids,
                    'action': 'withdraw_ajax_submission',
                    'nonce': dokan.nonce
                }, function(response, status, xhr) {
                    if ( 'html/csv' === xhr.getResponseHeader('Content-type') ) {
                        var filename = "";
                        var disposition = xhr.getResponseHeader('Content-Disposition');

                        if (disposition && disposition.indexOf('attachment') !== -1) {
                            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(disposition);

                            if (matches != null && matches[1]) {
                                filename = matches[1].replace(/['"]/g, '');
                            }
                        }

                        var type = xhr.getResponseHeader('Content-Type');

                        var blob = typeof File === 'function' ? new File([response], filename, { type: type }) : new Blob([response], { type: type });
                        if (typeof window.navigator.msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                            window.navigator.msSaveBlob(blob, filename);
                        } else {
                            var URL = window.URL || window.webkitURL;
                            var downloadUrl = URL.createObjectURL(blob);

                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                var a = document.createElement("a");
                                // safari doesn't support this yet
                                if (typeof a.download === 'undefined') {
                                    window.location = downloadUrl;
                                } else {
                                    a.href = downloadUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                }
                            } else {
                                window.location = downloadUrl;
                            }

                            setTimeout(function () {
                                URL.revokeObjectURL(downloadUrl);
                            }, 100); // cleanup
                        }
                    }

                    if ( response ) {
                        alert( self.massPayment );
                        return;
                    }
                });
            }
        },

        openNoteModal(note, id) {
            this.showModal = true;
            this.editing = {
                id: id,
                note: note
            }
        },

        updateNote() {
            this.showModal = false;
            this.loading = true;

            dokan.api.put('/withdraw/' + this.editing.id, {
                note: this.editing.note
            })
            .done((response) => {
                this.loading = false;

                this.updateItem(this.editing.id, response);
                this.editing = {
                    id: null,
                    note: null
                }
            });
        },

        clearSelection(element) {
            $(element).val(null).trigger('change');
        },

        showErrorAlert( message ) {
            let self = this;
            swal.fire(
                self.__( 'Something went wrong', 'dokan' ),
                message,
                'error'
            );
        },
    }
};
</script>

<style lang="less">
.withdraw-requests {

    .dokan-modal {

        .modal-body {
            min-height: 130px;

            textarea {
                width: 100%;
            }
        }
    }

    .image {
        width: 10%;
    }

    .seller {
        width: 20%;
    }

    td.seller img {
        float: left;
        margin-right: 10px;
        margin-top: 1px;
        width: 24px;
        height: auto;
    }

    td.seller strong {
        display: block;
        margin-bottom: .2em;
        font-size: 14px;
    }

    td.actions,
    th.actions {
        width: 120px;
    }

    td.status {
        span {
            line-height: 2.5em;
            padding: 5px 8px;
            border-radius: 4px;
        }

        .approved {
            background: #c6e1c6;
            color: #5b841b;
        }

        .pending {
            background: #f8dda7;
            color: #94660c
        }

        .cancelled {
            background: #eba3a3;
            color: #761919
        }
    }

    .method_details_inner {
        p {
            margin-bottom: 2px;
        }
    }

    select#filter-payment-methods {
        width: 175px;
    }

    .select2.select2-container {
        width: 190px;
        vertical-align: top;
    }
}

@media only screen and (max-width: 600px) {
    .withdraw-requests {

        table td.seller, td.amount, td.actions {
            display: table-cell !important;
        }

        table th:not(.check-column):not(.seller):not(.amount):not(.actions) {
            display: none;
        }

        table td:not(.check-column):not(.seller):not(.amount):not(.actions) {
            display: none;
        }

        table th.column, table td.column {
            width: auto;
        }

        table td.column.actions .dashicons {
            width: 14px;
            height: 14px;
            font-size: 18px;
        }

        table td.seller {
            .row-actions {
                display: inline-block;
                span {
                    font-size: 11px;
                }
            }
        }
    }
}

@media only screen and (max-width: 376px) {
    .withdraw-requests {
        table td.seller {
            .row-actions {
                display: inline-block;
                span {
                    font-size: 9px;
                }
            }
        }
    }
}

@media only screen and (max-width: 320px) {
    .withdraw-requests {
        table td.column.actions .dashicons {
            width: 10px;
            height: 10px;
            font-size: 14px;
        }
    }
}
</style>
