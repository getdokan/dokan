<template>
    <div class="withdraw-requests">
        <h1>Withdraw Requests</h1>

        <ul class="subsubsub">
            <li><router-link :to="{ name: 'Withdraw', query: { status: 'pending' }}" active-class="current" exact>Pending <span class="count">({{ counts.pending }})</span></router-link> | </li>
            <li><router-link :to="{ name: 'Withdraw', query: { status: 'approved' }}" active-class="current" exact>Approved <span class="count">({{ counts.approved }})</span></router-link> | </li>
            <li><router-link :to="{ name: 'Withdraw', query: { status: 'cancelled' }}" active-class="current" exact>Cancelled <span class="count">({{ counts.cancelled }})</span></router-link></li>
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
            @action:click="onActionClick"
            @bulk:click="onBulkAction"
        >
            <template slot="seller" slot-scope="data">
                <img :src="data.row.user.gravatar" :alt="data.row.user.store_name" width="50">
                <strong><a href="#">{{ data.row.user.store_name }}</a></strong>
            </template>

            <template slot="amount" slot-scope="data">
                {{ data.row.amount | currency }}
            </template>

            <template slot="status" slot-scope="data">
                <span :class="data.row.status">{{ data.row.status | capitalize }}</span>
            </template>

            <template slot="created" slot-scope="data">
                {{ moment(data.row.created).format('MMM D, YYYY') }}
            </template>

            <template slot="method_details" slot-scope="data">
                {{ getPaymentDetails(data.row.method, data.row.user.payment) }}
            </template>

            <template slot="actions" slot-scope="data">
                <template v-if="data.row.status === 'pending'">
                    <a href="#" class="button button-small" @click.prevent="changeStatus('approved', data.row.id)">Approve</a>
                </template>
                <template v-else-if="data.row.status === 'approved'">
                    <a href="#" class="button button-small" @click.prevent="changeStatus('pending', data.row.id)">Pending</a>
                </template>
                <template v-else>
                    <div class="button-group">
                        <a href="#" class="button button-small" @click.prevent="changeStatus('approved', data.row.id)">Approve</a>
                        <a href="#" class="button button-small" @click.prevent="changeStatus('pending', data.row.id)">Pending</a>
                    </div>
                </template>
            </template>
        </list-table>
    </div>
</template>

<script>
let ListTable = dokan_get_lib('ListTable');

export default {

    name: 'Withdraw',

    components: {
        ListTable,
    },

    data () {
        return {
            counts: {
                pending: 0,
                approved: 0,
                cancelled: 0
            },
            notFound: 'No requests found.',
            showCb: true,
            loading: false,
            columns: {
                'seller': { label: 'Vendor' },
                'amount': { label: 'Amount' },
                'status': { label: 'Status' },
                'method_title': { label: 'Method' },
                'method_details': { label: 'Method Details' },
                'note': { label: 'Note' },
                'created': { label: 'Date' },
                'actions': { label: 'Actions' },
            },
            requests: [],
            actionColumn: 'seller',
            actions: [
                {
                    key: 'trash',
                    label: 'Delete'
                },
                {
                    key: 'cancel',
                    label: 'Cancel'
                }
            ],
            bulkActions: [
                {
                    key: 'approved',
                    label: 'Approve'
                },
                {
                    key: 'cancelled',
                    label: 'Cancel'
                },
                {
                    key: 'delete',
                    label: 'Delete'
                },
                {
                    key: 'paypal',
                    label: 'Download PayPal mass payment file'
                },
            ],
        };
    },

    watch: {
        '$route.query.status'() {
            this.fetchRequests();
        }
    },

    computed: {

        currentStatus() {
            return this.$route.query.status || 'pending';
        }
    },

    created() {
        this.fetchRequests();
    },

    methods: {

        updatedCounts(xhr) {
            this.counts.pending   = parseInt( xhr.getResponseHeader('X-Status-Pending') );
            this.counts.approved  = parseInt( xhr.getResponseHeader('X-Status-Completed') );
            this.counts.cancelled = parseInt( xhr.getResponseHeader('X-Status-Cancelled') );
        },

        fetchRequests() {
            this.loading = true;

            dokan.api.get('/withdraw?status=' + this.currentStatus)
            .done((response, status, xhr) => {
                this.requests = response;
                this.loading = false;

                this.updatedCounts(xhr);
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
                // this.requests = response;
                this.loading = false;
                // this.updateItem(id, response);
                this.fetchRequests();
            });
        },

        onActionClick(action, row) {
            if ( 'cancel' === action ) {
                this.changeStatus('cancelled', row.id);
            }

            if ( 'trash' === action ) {
                if ( confirm( 'Are you sure?' ) ) {
                    this.loading = true;

                    dokan.api.delete('/withdraw/' + row.id)
                    .done(response => {
                        this.loading = false;
                        this.fetchRequests();
                    });
                }
            }
        },

        getPaymentDetails(method, data) {
            let details = '—';

            if ( 'bank' !== method ) {
                details = data[method].email || '';
            } else {

                if ( data.bank.hasOwnProperty('ac_name') ) {
                    details = 'Account Name: ' + data.bank.ac_name;
                }

                if ( data.bank.hasOwnProperty('ac_number') ) {
                    details += ", Account Number: " + data.bank.ac_number;
                }

                if ( data.bank.hasOwnProperty('bank_name') ) {
                    details += ", Bank Name: " + data.bank.bank_name;
                }

                if ( data.bank.hasOwnProperty('routing_number') ) {
                    details += ", Routing Number: " + data.bank.routing_number;
                }
            }

            return details;
        },

        moment(date) {
            return moment(date);
        },

        onBulkAction(action, items) {

            if ( _.contains(['delete', 'approved', 'cancelled'], action) ) {

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
                let ids = items.join("','");

                $.post(ajaxurl, {
                    'dokan_withdraw_bulk': 'paypal',
                    'id': ids,
                    'action': 'withdraw_ajax_submission'
                }, function(response, status, xhr) {
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

                    var blob = typeof File === 'function'
                        ? new File([response], filename, { type: type })
                        : new Blob([response], { type: type });
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

                        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                    }
                });
            }
        }
    }
};
</script>

<style lang="less">
.withdraw-requests {

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

}
</style>
