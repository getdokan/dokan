<template>
    <div class="withdraw-requests">
        <h1>Withdraw Requests</h1>

        <list-table
            :columns="columns"
            :rows="requests"
            :loading="loading"
            :action-column="actionColumn"
            :actions="actions"
            :show-cb="showCb"
            :bulk-actions="bulkActions"
            @action:click="onActionClick"
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
            showCb: true,
            loading: false,
            columns: {
                'seller': { label: 'Vendor' },
                'amount': { label: 'Amount' },
                'status': { label: 'Status' },
                'method_title': { label: 'Method' },
                // 'method_details': { label: 'Method Details' },
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
                    key: 'approve',
                    label: 'Approve Requests'
                },
                {
                    key: 'trash',
                    label: 'Delete'
                },
            ],
        };
    },

    created() {
        this.fetchRequests();
    },

    methods: {

        fetchRequests() {
            this.loading = true;

            dokan.api.get('/withdraw')
            .done(response => {
                this.requests = response;
                this.loading = false;
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
                this.updateItem(id, response);
            });
        },

        onActionClick(action, row) {
            if ( 'cancel' === action ) {
                this.changeStatus('cancelled', row.id);
            }
        },

        moment(date) {
            return moment(date);
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
